import crypto from "crypto";
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import {
  DescribeRuleCommand,
  EventBridgeClient,
  PutRuleCommand,
} from "@aws-sdk/client-eventbridge";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { htmlToPortableText } from "@portabletext/html";
import { JSDOM } from "jsdom";

// expected body shape for invocation:
// {
//   "eventId": "123", // optional, can also be "msrEventId"
//   "maxCreateActions": 2, // optional, overrides default max create actions for this run
//   "maxUpdateActions": 3, // optional, overrides default max update actions for this run
// }

type MsrCalendarEvent = {
  id: string;
  name?: string;
  description?: string;
  detailuri?: string;
  uri?: string;
  organization?: {
    uri?: string;
    name?: string;
  };
  public?: boolean;
  image?: {
    standard?: string;
  };
  start?: string;
  end?: string;
  type?: string;
  cancelled?: boolean;
  venue?: {
    name?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    uri?: string;
    geo?: {
      coordinates?: Array<number | string>;
    };
  };
  registration?: {
    start?: string;
    end?: string;
  };
};

type MsrAttendee = {
  status?: string;
  registered?: string;
  lastUpdate?: string;
};

type PortableTextBlock = Record<string, any>;

type SanityEventSnapshot = {
  _id: string;
  sourceHash?: string;
  title?: string;
  cost?: number | null;
  startTime?: string;
  endTime?: string;
  onlineEvent?: boolean;
  onlineLink?: string;
  website?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
  sourceIsCancelled?: boolean;
  sourceRegistrationOpenAt?: string;
  sourceRegistrationCloseAt?: string;
  sourceRegisterLink?: string;
  sourceIsPublic?: boolean;
  sourceRegistrationCount?: number;
  sourceConfirmedCount?: number;
  sourceLastRegistrantUpdateAt?: string;
  venueName?: string;
  category?: {
    _ref?: string;
  };
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  body?: PortableTextBlock[];
  mainImage?: {
    asset?: {
      _ref?: string;
    };
  };
};

type ComparableEventShape = {
  title: string;
  categoryRef: string;
  cost: number | null;
  startTime: string;
  endTime: string;
  onlineEvent: boolean;
  onlineLink: string;
  website: string;
  location:
    | {
        lat: number;
        lng: number;
      }
    | null;
  sourceIsCancelled: boolean;
  sourceRegistrationOpenAt: string;
  sourceRegistrationCloseAt: string;
  sourceRegisterLink: string;
  sourceIsPublic: boolean;
  sourceRegistrationCount: number;
  sourceConfirmedCount: number;
  sourceLastRegistrantUpdateAt: string;
  venueName: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
  };
  body: PortableTextBlock[];
  excerpt?: PortableTextBlock[];
};

type CandidateEvent = ComparableEventShape & {
  source: "msr";
  msrEventId: string;
  sourceImageUrl: string;
  sourceHash: string;
  sourceLastSyncedAt: string;
  derivedCostText: string;
};

type SanityEventCategory = {
  _id: string;
  title?: string;
};

const region = process.env.AWS_REGION || "us-west-2";
const secretsClient = new SecretsManagerClient({ region });
const dynamoClient = new DynamoDBClient({ region });
const eventBridgeClient = new EventBridgeClient({ region });

const requiredEnv = (name: string): string => {
  const value = (process.env[name] || "").trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const msrUsername = requiredEnv("MSR_USERNAME");
const msrOrganizationId = requiredEnv("MSR_ORGANIZATION_ID");
const msrPasswordSecretName = requiredEnv("MSR_PASSWORD_SECRET_NAME");
const sanityTokenSecretName = requiredEnv("SANITY_API_TOKEN_SECRET_NAME");
const sanityProjectId = requiredEnv("SANITY_PROJECT_ID");
const sanityDataset = requiredEnv("SANITY_DATASET");
const sanityApiVersion = requiredEnv("SANITY_API_VERSION");
const auditTableName = requiredEnv("AUDIT_TABLE_NAME");
const eventsTableName = requiredEnv("EVENTS_TABLE_NAME");
const nightlyRuleName = String(process.env.NIGHTLY_RULE_NAME || "").trim();

const calendarStartOffsetDays = Number(
  process.env.CALENDAR_START_OFFSET_DAYS || "-30"
);
const calendarEndOffsetDays = Number(
  process.env.CALENDAR_END_OFFSET_DAYS || "400"
);

const defaultApplyWrites = parseBooleanWithDefault(
  process.env.DEFAULT_APPLY_WRITES,
  false
);
const defaultMaxCreateActionsPerRun = parseNonNegativeIntWithDefault(
  process.env.MAX_CREATE_ACTIONS_PER_RUN,
  1
);
const defaultMaxUpdateActionsPerRun = parseNonNegativeIntWithDefault(
  process.env.MAX_UPDATE_ACTIONS_PER_RUN,
  0
);

const isoDateWithOffset = (offsetDays: number): string => {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() + offsetDays);
  return now.toISOString().slice(0, 10);
};

const randomKey = (): string => crypto.randomBytes(6).toString("hex");

const stableKey = (seed: string): string =>
  crypto.createHash("sha1").update(seed).digest("hex").slice(0, 12);

const normalizeMsrEventId = (value?: string): string =>
  String(value || "")
    .trim()
    .toLowerCase();

const MSR_EVENT_DOC_PREFIX = "event-msr-";

const buildDocumentIdFromMsrEventId = (msrEventId: string): string =>
  `${MSR_EVENT_DOC_PREFIX}${normalizeMsrEventId(msrEventId)}`;

const normalizeDocumentId = (value?: string): string =>
  String(value || "")
    .trim()
    .replace(/^drafts\./, "");

const parseRequestedMsrEventIds = (event: Record<string, any>): Set<string> => {
  const requested = new Set<string>();
  const pushIfPresent = (value: unknown) => {
    const normalized = normalizeMsrEventId(String(value || ""));
    if (normalized) requested.add(normalized);
  };

  pushIfPresent(event.eventId);
  pushIfPresent(event.msrEventId);

  const eventIds = Array.isArray(event.eventIds) ? event.eventIds : [];
  for (const value of eventIds) {
    pushIfPresent(value);
  }

  return requested;
};

const normalizeInvocationEvent = (
  rawEvent: Record<string, any>
): Record<string, any> => {
  if (!rawEvent || typeof rawEvent !== "object") return {};
  if (typeof rawEvent.body !== "string") return rawEvent;

  try {
    const parsedBody = JSON.parse(rawEvent.body);
    if (!parsedBody || typeof parsedBody !== "object") return rawEvent;
    return {
      ...parsedBody,
      ...rawEvent,
      body: parsedBody,
    };
  } catch (_error) {
    return rawEvent;
  }
};

const extractMsrEventIdFromDocumentId = (documentId?: string): string => {
  const normalized = normalizeDocumentId(documentId);
  if (!normalized.startsWith(MSR_EVENT_DOC_PREFIX)) return "";
  return normalizeMsrEventId(normalized.slice(MSR_EVENT_DOC_PREFIX.length));
};

const MSR_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const normalizeMsrDate = (value?: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (MSR_DATE_ONLY_PATTERN.test(raw)) return raw;

  const normalized = raw.replace(" ", "T");
  const prefix = normalized.slice(0, 10);
  if (MSR_DATE_ONLY_PATTERN.test(prefix)) return prefix;

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const msrDateToIso = (value: string, boundary: "start" | "end"): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (MSR_DATE_ONLY_PATTERN.test(raw)) {
    return boundary === "start"
      ? `${raw}T00:00:00.000Z`
      : `${raw}T23:59:59.999Z`;
  }

  const normalized = raw.replace(" ", "T");
  const hasZone = /(z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  const parseCandidate = hasZone ? normalized : `${normalized}Z`;
  const parsed = new Date(parseCandidate);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  const datePrefix = normalized.slice(0, 10);
  if (MSR_DATE_ONLY_PATTERN.test(datePrefix)) {
    return boundary === "start"
      ? `${datePrefix}T00:00:00.000Z`
      : `${datePrefix}T23:59:59.999Z`;
  }

  return "";
};

const deriveStartAndEndTime = (
  start?: string,
  end?: string
): { startTime: string; endTime: string } => {
  const startRaw = String(start || "").trim();
  const endRaw = String(end || "").trim();

  const startTime = startRaw ? msrDateToIso(startRaw, "start") : "";
  let endTime = endRaw ? msrDateToIso(endRaw, "end") : "";

  if (!endTime && startRaw) {
    if (MSR_DATE_ONLY_PATTERN.test(startRaw)) {
      endTime = msrDateToIso(startRaw, "end");
    } else if (startTime) {
      const fallbackEnd = new Date(new Date(startTime).getTime() + 2 * 60 * 60 * 1000);
      endTime = fallbackEnd.toISOString();
    }
  }

  if (startTime && endTime && endTime < startTime) {
    endTime = startTime;
  }

  return { startTime, endTime };
};

const msrDateTimeToIso = (value?: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const normalized = raw.replace(" ", "T");
  const hasZone = /(z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  const parseCandidate = hasZone ? normalized : `${normalized}Z`;
  const parsed = new Date(parseCandidate);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
};

const parseAttendeeDateToIso = (value?: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
};

const toAbsoluteUrl = (value?: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("//")) return `https:${raw}`;
  return raw;
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&apos;/gi, "'");

const htmlToSearchableText = (value?: string): string =>
  decodeHtmlEntities(String(value || ""))
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/p\s*>/gi, "\n")
    .replace(/<\s*\/div\s*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const stripHtml = (value?: string): string => htmlToSearchableText(value);

const extractSourceCostText = (descriptionHtml?: string): string => {
  const text = htmlToSearchableText(descriptionHtml);
  if (!text) return "";

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const lineMatch = lines.find(
    (line) =>
      /\b(cost|fee|price|member|non-member|registration)\b/i.test(line) &&
      /\$?\s*[0-9]+(?:\.[0-9]{1,2})?/i.test(line)
  );
  if (lineMatch) return lineMatch;

  const phraseMatch = text.match(
    /\b(cost|fee|price)\b[^\n.]{0,120}\$?\s*[0-9]+(?:\.[0-9]{1,2})?/i
  );
  if (phraseMatch?.[0]) return phraseMatch[0].trim();

  if (/\bfree\b/i.test(text)) return "Free";

  return "";
};

const parseCostInfo = (
  descriptionHtml?: string
): { cost: number | null; sourceCostText: string } => {
  const sourceCostText = extractSourceCostText(descriptionHtml);
  const sourceText = sourceCostText || htmlToSearchableText(descriptionHtml);

  if (/\bfree\b/i.test(sourceText)) {
    return {
      cost: 0,
      sourceCostText,
    };
  }

  const amountMatch = sourceText.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
  if (amountMatch?.[1]) {
    const parsed = Number(amountMatch[1]);
    return {
      cost: Number.isFinite(parsed) ? parsed : null,
      sourceCostText,
    };
  }

  const fallbackMatch = sourceText.match(
    /\b([0-9]+(?:\.[0-9]{1,2})?)\b\s*(?:usd|dollars?)?/i
  );
  if (fallbackMatch?.[1]) {
    const parsed = Number(fallbackMatch[1]);
    if (Number.isFinite(parsed)) {
      return {
        cost: parsed,
        sourceCostText,
      };
    }
  }

  return {
    cost: null,
    sourceCostText,
  };
};

const MSR_EVENT_DATE_IN_TITLE_PATTERN =
  /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,)?\s+\d{4}\b/gi;

const cleanMsrEventTitle = (value?: string): string => {
  const original = String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!original) return "";

  if (!/\b(?:hpde|ccc)\b/i.test(original)) {
    return original;
  }

  const cleaned = original
    .replace(/\bBMW\s*CCA\b\s*PSR\b[\s:-]*/gi, "")
    .replace(MSR_EVENT_DATE_IN_TITLE_PATTERN, "")
    .replace(/\s+([,.:;!?])/g, "$1")
    .replace(/\s*@\s*/g, " @ ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,.:;\-]+/, "")
    .replace(/[\s,.:;\-]+$/, "")
    .trim();

  return cleaned || original;
};

const buildFallbackPortableTextBlocks = (html?: string): PortableTextBlock[] => {
  const plain = htmlToSearchableText(html);
  if (!plain) return [];

  const paragraphs = plain
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph, index) => ({
    _type: "block",
    _key: stableKey(`fallback-${index}-${paragraph}`),
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: stableKey(`fallback-${index}-${paragraph}-span`),
        text: paragraph,
        marks: [],
      },
    ],
  }));
};

const normalizePortableTextNode = (
  rawNode: Record<string, any>,
  index: number
): PortableTextBlock | null => {
  const type = String(rawNode?._type || "").trim();
  if (!type) return null;

  if (type !== "block") {
    const fallbackSeed = String(rawNode?.url || rawNode?.src || rawNode?.text || "");
    return {
      ...rawNode,
      _type: type,
      _key:
        String(rawNode?._key || "").trim() ||
        stableKey(`node-${index}-${type}-${fallbackSeed}`),
    };
  }

  const style = String(rawNode?.style || "normal").trim() || "normal";
  const rawChildren = Array.isArray(rawNode?.children) ? rawNode.children : [];
  const children = rawChildren
    .map((child: Record<string, any>, childIndex: number) => {
      const text = String(child?.text || "");
      const marks = Array.isArray(child?.marks)
        ? child.marks
            .map((mark: unknown) => String(mark || "").trim())
            .filter(Boolean)
        : [];
      return {
        _type: "span",
        _key:
          String(child?._key || "").trim() ||
          stableKey(`b${index}-c${childIndex}-${text}-${marks.join(",")}`),
        text,
        marks,
      };
    })
    .filter((child) => child.text.length > 0 || child.marks.length > 0);

  if (children.length === 0) {
    children.push({
      _type: "span",
      _key: stableKey(`b${index}-empty`),
      text: "",
      marks: [],
    });
  }

  const rawMarkDefs = Array.isArray(rawNode?.markDefs) ? rawNode.markDefs : [];
  const markDefs = rawMarkDefs.map((markDef: Record<string, any>, markDefIndex: number) => {
    const markDefType = String(markDef?._type || "link").trim() || "link";
    const href = String(markDef?.href || "").trim();
    return {
      ...markDef,
      _type: markDefType,
      _key:
        String(markDef?._key || "").trim() ||
        stableKey(`b${index}-m${markDefIndex}-${markDefType}-${href}`),
      ...(href ? { href } : {}),
    };
  });

  const normalized: PortableTextBlock = {
    _type: "block",
    _key:
      String(rawNode?._key || "").trim() ||
      stableKey(`block-${index}-${style}-${children.map((child) => child.text).join("|")}`),
    style,
    markDefs,
    children,
  };

  const listItem = String(rawNode?.listItem || "").trim();
  if (listItem) {
    normalized.listItem = listItem;
  }

  const level = Number(rawNode?.level);
  if (Number.isFinite(level) && level > 0) {
    normalized.level = Math.floor(level);
  }

  return normalized;
};

const normalizePortableTextBlocks = (nodes: PortableTextBlock[]): PortableTextBlock[] =>
  nodes
    .map((node, index) => normalizePortableTextNode(node, index))
    .filter((node): node is PortableTextBlock => Boolean(node));

const getAlignmentStyleFromElement = (element: any): "normalCenter" | "normalRight" | "" => {
  const alignAttr = String(element?.getAttribute?.("align") || "")
    .trim()
    .toLowerCase();
  if (alignAttr === "center") return "normalCenter";
  if (alignAttr === "right") return "normalRight";

  const styleAttr = String(element?.getAttribute?.("style") || "");
  const styleMatch = styleAttr.match(/text-align\s*:\s*(center|right)/i);
  if (!styleMatch?.[1]) return "";
  return styleMatch[1].toLowerCase() === "center"
    ? "normalCenter"
    : "normalRight";
};

const htmlDeserializerRules = [
  {
    deserialize(el: any, next: any, createBlock: any) {
      if (!el || el.nodeType !== 1) return undefined;
      const tag = String(el.tagName || "").toLowerCase();
      if (tag !== "p" && tag !== "div") return undefined;

      const style = getAlignmentStyleFromElement(el) || "normal";

      const childrenRaw = next(el.childNodes);
      const children = Array.isArray(childrenRaw)
        ? childrenRaw
        : childrenRaw
          ? [childrenRaw]
          : [];

      return createBlock({
        _type: "block",
        style,
        markDefs: [],
        children,
      });
    },
  },
];

const isEmbeddableVideoUrl = (value?: string): boolean => {
  const url = String(value || "").trim();
  if (!url) return false;
  return /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|vimeo\.com\/|player\.vimeo\.com\/video\/|loom\.com\/share\/)/i.test(
    url
  );
};

const extractVideoUrlFromText = (value: string): string => {
  const match = String(value || "").match(/https?:\/\/[^\s"'<>]+/i);
  if (!match?.[0]) return "";
  const candidate = match[0].replace(/[),.;!?]+$/, "");
  return isEmbeddableVideoUrl(candidate) ? candidate : "";
};

const collectEmbeddableVideoUrlsFromHtml = (rawHtml: string): string[] => {
  const urls = new Set<string>();

  try {
    const jsdom = new JSDOM(rawHtml);
    const document = (jsdom.window as any).document as Document;

    const anchorNodes = Array.from(
      document.querySelectorAll("a[href]")
    ) as Array<HTMLElement>;
    for (const anchorNode of anchorNodes) {
      const href = String(anchorNode.getAttribute("href") || "")
        .trim()
        .replace(/^\/\//, "https://");
      if (isEmbeddableVideoUrl(href)) {
        urls.add(href);
      }
    }

    const iframeNodes = Array.from(
      document.querySelectorAll("iframe[src]")
    ) as Array<HTMLElement>;
    for (const iframeNode of iframeNodes) {
      const src = String(iframeNode.getAttribute("src") || "")
        .trim()
        .replace(/^\/\//, "https://");
      if (isEmbeddableVideoUrl(src)) {
        urls.add(src);
      }
    }
  } catch (_error) {
    // no-op
  }

  return Array.from(urls);
};

const getVideoUrlsFromBlock = (node: PortableTextBlock): string[] => {
  if (String(node?._type || "") !== "block") return [];

  const spans = Array.isArray(node?.children)
    ? node.children.filter((child: any) => String(child?._type || "") === "span")
    : [];
  if (spans.length === 0) return [];

  const markDefs = Array.isArray(node?.markDefs) ? node.markDefs : [];
  const videoUrlsFromMarks = markDefs
    .map((markDef: any) => ({
      markType: String(markDef?._type || "").trim(),
      href: String(markDef?.href || "").trim(),
    }))
    .filter((markDef) => markDef.markType === "link" && isEmbeddableVideoUrl(markDef.href))
    .map((markDef) => markDef.href);

  const plainText = spans.map((span: any) => String(span?.text || "")).join(" ");
  const videoUrlFromText = extractVideoUrlFromText(plainText);
  const combined = [...videoUrlsFromMarks, ...(videoUrlFromText ? [videoUrlFromText] : [])];
  return Array.from(new Set(combined));
};

const promoteVideoLinkBlocks = (nodes: PortableTextBlock[]): PortableTextBlock[] =>
  nodes.flatMap((node, index) => {
    if (String(node?._type || "") !== "block") return [node];
    const videoUrls = getVideoUrlsFromBlock(node);
    if (videoUrls.length === 0) return [node];

    const videoEmbeds = videoUrls.map((videoUrl, videoIndex) => ({
      _type: "videoEmbed",
      _key: stableKey(`video-${index}-${videoIndex}-${videoUrl}`),
      url: videoUrl,
    }));
    return [node, ...videoEmbeds];
  });

const normalizeVideoPlaceholderText = (value: string): string =>
  String(value || "")
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isVideoPlaceholderText = (value: string): boolean => {
  const normalized = normalizeVideoPlaceholderText(value);
  if (!normalized) return true;
  if (isEmbeddableVideoUrl(normalized)) return true;
  return /^(video|watch video|watch the video|video link|video url|watch)$/i.test(
    normalized
  );
};

const removeVideoLinkArtifactsFromBlock = (
  node: PortableTextBlock
): PortableTextBlock | null => {
  if (String(node?._type || "") !== "block") return node;

  const markDefs = Array.isArray(node?.markDefs) ? node.markDefs : [];
  const videoMarkKeys = new Set(
    markDefs
      .filter(
        (markDef: any) =>
          String(markDef?._type || "").trim() === "link" &&
          isEmbeddableVideoUrl(String(markDef?.href || "").trim())
      )
      .map((markDef: any) => String(markDef?._key || "").trim())
      .filter(Boolean)
  );
  const nonVideoMarkDefs = markDefs.filter(
    (markDef: any) => !videoMarkKeys.has(String(markDef?._key || "").trim())
  );

  const rawChildren = Array.isArray(node?.children) ? node.children : [];
  const children = rawChildren.map((child: any) => {
    if (String(child?._type || "") !== "span") return child;
    const marks = Array.isArray(child?.marks)
      ? child.marks
          .map((mark: unknown) => String(mark || "").trim())
          .filter((mark: string) => mark && !videoMarkKeys.has(mark))
      : [];
    return {
      ...child,
      marks,
    };
  });

  const plainText = children
    .filter((child: any) => String(child?._type || "") === "span")
    .map((child: any) => String(child?.text || ""))
    .join(" ");
  const normalizedText = normalizeVideoPlaceholderText(plainText);
  const hasNonSpanChildren = children.some(
    (child: any) => String(child?._type || "") !== "span"
  );

  const hasVideoLinkMarks = videoMarkKeys.size > 0;
  const hasOnlyPlaceholderText =
    isVideoPlaceholderText(normalizedText) && !hasNonSpanChildren;

  if (hasVideoLinkMarks && hasOnlyPlaceholderText) {
    return null;
  }

  if (!hasVideoLinkMarks && !hasNonSpanChildren && isEmbeddableVideoUrl(normalizedText)) {
    return null;
  }

  return {
    ...node,
    markDefs: nonVideoMarkDefs,
    children,
  };
};

const removeVideoLinkArtifacts = (nodes: PortableTextBlock[]): PortableTextBlock[] =>
  nodes.filter((node) => {
    if (String(node?._type || "") === "videoEmbed") return true;
    const sanitized =
      String(node?._type || "") === "block"
        ? removeVideoLinkArtifactsFromBlock(node)
        : node;
    return Boolean(sanitized);
  }).map((node) => {
    if (String(node?._type || "") !== "block") return node;
    return removeVideoLinkArtifactsFromBlock(node) || node;
  });

const mapAlignmentStyles = (
  blocks: PortableTextBlock[],
  document: any
): PortableTextBlock[] => {
  const alignmentNodes = Array.from(document.querySelectorAll("p,div"));
  let alignmentIndex = 0;

  return blocks.map((block) => {
    if (!block || block._type !== "block") return block;
    const style = String(block.style || "normal").trim() || "normal";

    if (style === "normal" && alignmentIndex < alignmentNodes.length) {
      const nodeStyle = getAlignmentStyleFromElement(alignmentNodes[alignmentIndex]);
      if (nodeStyle) {
        block.style = nodeStyle;
      }
      alignmentIndex += 1;
    }

    return block;
  });
};

const convertHtmlToPortableText = (html?: string): PortableTextBlock[] => {
  const rawHtml = String(html || "").trim();
  if (!rawHtml) return [];

  try {
    // Patch global crypto for Node.js Lambda (@portabletext/html requires webcrypto)
    if (typeof globalThis.crypto === "undefined") {
      // TypeScript: Node's webcrypto type is not assignable to DOM Crypto, so cast to any
      globalThis.crypto = crypto.webcrypto as any;
    }

    console.log("convertHtmlToPortableText: starting with html length", rawHtml.length);

    // Use official @portabletext/html with proper parseHtml config for Node.js
    const converted = htmlToPortableText(rawHtml, {
      parseHtml: (html: string) => (new JSDOM(html).window as any).document as Document,
    });

    console.log("convertHtmlToPortableText: htmlToPortableText returned", Array.isArray(converted) ? `${converted.length} blocks` : typeof converted);

    const jsdom = new JSDOM(rawHtml);
    const document = (jsdom.window as any).document as Document;

    const normalized = normalizePortableTextBlocks(
      Array.isArray(converted) ? (converted as PortableTextBlock[]) : []
    );

    console.log("convertHtmlToPortableText: normalized to", normalized.length, "blocks");
    console.log("convertHtmlToPortableText: first block marks:", normalized[0]?.children?.[0]?.marks);

    const aligned = mapAlignmentStyles(normalized, document);
    const withVideoEmbeds = promoteVideoLinkBlocks(aligned);
    const htmlVideoUrls = collectEmbeddableVideoUrlsFromHtml(rawHtml);
    const existingVideoUrls = new Set(
      withVideoEmbeds
        .filter((node) => String(node?._type || "") === "videoEmbed")
        .map((node) => String(node?.url || "").trim())
        .filter(Boolean)
    );
    const missingHtmlVideoEmbeds = htmlVideoUrls
      .filter((url) => !existingVideoUrls.has(url))
      .map((url, index) => ({
        _type: "videoEmbed",
        _key: stableKey(`video-html-${index}-${url}`),
        url,
      }));
    const finalNodes = removeVideoLinkArtifacts([
      ...withVideoEmbeds,
      ...missingHtmlVideoEmbeds,
    ]);

    if (finalNodes.length > 0) {
      console.log("convertHtmlToPortableText: returning", finalNodes.length, "final blocks");
      return finalNodes;
    }

    console.warn(
      "convertHtmlToPortableText: no portable text nodes generated from HTML; falling back to plain text."
    );
  } catch (error) {
    console.error("convertHtmlToPortableText: conversion failed, using fallback", error);
  }

  console.log("convertHtmlToPortableText: using fallback plaintext");
  return buildFallbackPortableTextBlocks(rawHtml);
};

const stripPortableTextKeys = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map((item) => stripPortableTextKeys(item));
  }
  if (!value || typeof value !== "object") return value;

  const output: Record<string, any> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (key === "_key") continue;
    output[key] = stripPortableTextKeys(nested);
  }
  return output;
};

const normalizeLocation = (
  event: MsrCalendarEvent
): { lat: number; lng: number } | null => {
  const coordinates = event.venue?.geo?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;

  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
};

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function parseBooleanWithDefault(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  return asBoolean(value);
}

function parseNonNegativeIntWithDefault(
  value: unknown,
  fallback: number
): number {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

const getSecretString = async (secretId: string): Promise<string> => {
  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretId })
  );
  const raw = response.SecretString || "";
  if (!raw) {
    throw new Error(`Secret ${secretId} has no SecretString value`);
  }
  try {
    const parsed = JSON.parse(raw);
    const fromJson =
      parsed?.password ||
      parsed?.MSR_API_PASSWORD ||
      parsed?.SANITY_API_TOKEN ||
      parsed?.token;
    if (typeof fromJson === "string" && fromJson.trim()) {
      return fromJson.trim();
    }
  } catch (_error) {
    // no-op
  }
  return raw.trim();
};

const fetchJson = async (
  url: string,
  headers: Record<string, string>
): Promise<any> => {
  const response = await fetch(url, { method: "GET", headers });
  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status}) ${url}: ${bodyText.slice(0, 300)}`
    );
  }
  return JSON.parse(bodyText);
};

const getMsrAuthHeaders = (
  username: string,
  password: string,
  organizationId: string
): Record<string, string> => ({
  Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
    "base64"
  )}`,
  "X-Organization-Id": organizationId,
  Accept: "application/json",
});

type EventCategoryKey = "driver-education" | "tour" | "car-show";

type EventCategoryLookup = {
  driverEducationId: string;
  tourId: string;
  carShowId: string;
};

const normalizeCategoryTitle = (value?: string): string =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const chooseCategoryKeyForEvent = (event: MsrCalendarEvent): EventCategoryKey => {
  const searchable = String(event.name || "").toLowerCase();

  if (/\b(ccc|hpde|hdpe)\b/i.test(searchable)) {
    return "driver-education";
  }
  if (/\btour\b/i.test(searchable)) {
    return "tour";
  }
  return "car-show";
};

const buildEventCategoryLookup = (
  categories: SanityEventCategory[]
): EventCategoryLookup => {
  const normalized = categories.map((category) => ({
    id: String(category._id || "").trim(),
    title: normalizeCategoryTitle(category.title),
  }));

  const findByPredicate = (
    predicate: (item: { id: string; title: string }) => boolean
  ): string => normalized.find(predicate)?.id || "";

  const driverEducationId =
    findByPredicate((item) => /driver education/.test(item.title)) ||
    findByPredicate((item) => /\bhpde\b/.test(item.title)) ||
    findByPredicate((item) => /\bccc\b/.test(item.title));

  const tourId = findByPredicate((item) => /\btour\b/.test(item.title));

  const carShowId =
    findByPredicate((item) => /car show/.test(item.title)) ||
    findByPredicate((item) => /\bshow\b/.test(item.title));

  return {
    driverEducationId,
    tourId,
    carShowId,
  };
};

const resolveCategoryRefForEvent = (
  event: MsrCalendarEvent,
  lookup: EventCategoryLookup
): string => {
  const categoryKey = chooseCategoryKeyForEvent(event);

  if (categoryKey === "driver-education") {
    return (
      lookup.driverEducationId || lookup.carShowId || lookup.tourId || ""
    );
  }
  if (categoryKey === "tour") {
    return lookup.tourId || lookup.carShowId || lookup.driverEducationId || "";
  }
  return lookup.carShowId || lookup.tourId || lookup.driverEducationId || "";
};

const shouldSkipEventImportByName = (event: MsrCalendarEvent): boolean => {
  const name = String(event.name || "").trim().toLowerCase();
  if (!name) return false;
  return /\bvirtual\b/.test(name) || /\bgift\s*card(s)?\b/.test(name);
};

const getAttendeeSummary = (attendees: MsrAttendee[]) => {
  const statusCounts: Record<string, number> = {};
  let lastRegistrantUpdateAt = "";

  for (const attendee of attendees) {
    const status = String(attendee.status || "Unknown");
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    const lastUpdateIso = parseAttendeeDateToIso(
      attendee.lastUpdate || attendee.registered
    );
    if (
      lastUpdateIso &&
      (!lastRegistrantUpdateAt || lastUpdateIso > lastRegistrantUpdateAt)
    ) {
      lastRegistrantUpdateAt = lastUpdateIso;
    }
  }

  const confirmedCount =
    (statusCounts.Confirmed || 0) + (statusCounts["Checked In"] || 0);
  const waitlistCount = Object.entries(statusCounts).reduce(
    (count, [status, value]) =>
      status.toLowerCase().includes("waitlist") ? count + value : count,
    0
  );

  return {
    total: attendees.length,
    confirmedCount,
    waitlistCount,
    lastRegistrantUpdateAt,
  };
};

const buildComparableEventShape = (
  event: MsrCalendarEvent,
  attendeeSummary: {
    total: number;
    confirmedCount: number;
    waitlistCount: number;
    lastRegistrantUpdateAt: string;
  },
  categoryRef: string
): { shape: ComparableEventShape; sourceCostText: string } => {
  const eventUrl =
    String(event.detailuri || "").trim() ||
    `https://www.motorsportreg.com${String(event.uri || "").trim()}`;
  const { cost, sourceCostText } = parseCostInfo(event.description);
  const location = normalizeLocation(event);
  const { startTime, endTime } = deriveStartAndEndTime(event.start, event.end);

  const body = convertHtmlToPortableText(String(event.description || "").trim());

  // Extract first sentence for excerpt as PortableText block
  const descriptionText = String(event.description || "").trim();
  let excerpt: PortableTextBlock[] = [];
  if (descriptionText) {
    // Remove HTML tags and decode entities
    const plain = htmlToSearchableText(descriptionText);
    // Find first sentence (ends with . ! or ?)
    const match = plain.match(/([^.!?]+[.!?])/);
    const excerptText = match ? match[1].trim() : plain.split("\n")[0].trim();
    if (excerptText) {
      excerpt = [
        {
          _type: "block",
          _key: stableKey(`excerpt-${excerptText}`),
          style: "normal",
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: stableKey(`excerpt-span-${excerptText}`),
              text: excerptText,
              marks: [],
            },
          ],
        },
      ];
    }
  }

  return {
    shape: {
      title: cleanMsrEventTitle(event.name),
      categoryRef: String(categoryRef || "").trim(),
      cost,
      startTime,
      endTime,
      onlineEvent: false,
      onlineLink: "",
      website: "",
      location,
      sourceIsCancelled: Boolean(event.cancelled),
      sourceRegistrationOpenAt: msrDateTimeToIso(event.registration?.start),
      sourceRegistrationCloseAt: msrDateTimeToIso(event.registration?.end),
      sourceRegisterLink: eventUrl,
      sourceIsPublic: Boolean(event.public),
      sourceRegistrationCount: attendeeSummary.total,
      sourceConfirmedCount: attendeeSummary.confirmedCount,
      sourceLastRegistrantUpdateAt: attendeeSummary.lastRegistrantUpdateAt,
      venueName: String(event.venue?.name || "").trim(),
      address: {
        line1: String(event.venue?.name || "").trim(),
        line2: "",
        city: String(event.venue?.city || "").trim(),
        state: String(event.venue?.region || "").trim(),
        postalCode: String(event.venue?.postalCode || "").trim(),
      },
      body,
      excerpt,
    },
    sourceCostText,
  };
};

const hashComparableShape = (shape: ComparableEventShape): string =>
  crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        ...shape,
        body: stripPortableTextKeys(shape.body),
      })
    )
    .digest("hex");

const buildCandidateEvent = (
  event: MsrCalendarEvent,
  comparableShape: ComparableEventShape,
  generatedAtIso: string,
  sourceCostText: string
): CandidateEvent => ({
  source: "msr",
  msrEventId: normalizeMsrEventId(event.id),
  ...comparableShape,
  sourceImageUrl: toAbsoluteUrl(event.image?.standard),
  sourceHash: hashComparableShape(comparableShape),
  sourceLastSyncedAt: generatedAtIso,
  derivedCostText: sourceCostText,
});

const buildComparableFromSanity = (
  snapshot: SanityEventSnapshot
): ComparableEventShape => ({
  title: String(snapshot.title || "").trim(),
  categoryRef: String(snapshot.category?._ref || "").trim(),
  cost:
    snapshot.cost === null || snapshot.cost === undefined
      ? null
      : Number(snapshot.cost),
  startTime: String(snapshot.startTime || "").trim(),
  endTime: String(snapshot.endTime || "").trim(),
  onlineEvent: Boolean(snapshot.onlineEvent),
  onlineLink: String(snapshot.onlineLink || "").trim(),
  website: String(snapshot.website || "").trim(),
  location:
    Number.isFinite(Number(snapshot.location?.lat)) &&
    Number.isFinite(Number(snapshot.location?.lng))
      ? {
          lat: Number(snapshot.location?.lat),
          lng: Number(snapshot.location?.lng),
        }
      : null,
  sourceIsCancelled: Boolean(snapshot.sourceIsCancelled),
  sourceRegistrationOpenAt: String(snapshot.sourceRegistrationOpenAt || "").trim(),
  sourceRegistrationCloseAt: String(snapshot.sourceRegistrationCloseAt || "").trim(),
  sourceRegisterLink: String(snapshot.sourceRegisterLink || "").trim(),
  sourceIsPublic: Boolean(snapshot.sourceIsPublic),
  sourceRegistrationCount: Number(snapshot.sourceRegistrationCount || 0),
  sourceConfirmedCount: Number(snapshot.sourceConfirmedCount || 0),
  sourceLastRegistrantUpdateAt: String(
    snapshot.sourceLastRegistrantUpdateAt || ""
  ).trim(),
  venueName: String(snapshot.venueName || "").trim(),
  address: {
    line1: String(snapshot.address?.line1 || "").trim(),
    line2: String(snapshot.address?.line2 || "").trim(),
    city: String(snapshot.address?.city || "").trim(),
    state: String(snapshot.address?.state || "").trim(),
    postalCode: String(snapshot.address?.postalCode || "").trim(),
  },
  body: normalizePortableTextBlocks(
    Array.isArray(snapshot.body) ? snapshot.body : []
  ),
});

const getSanityEventCategories = async (
  sanityToken: string
): Promise<SanityEventCategory[]> => {
  const query = `*[_type == "eventCategory"]{
    _id,
    title
  }`;
  const url = `https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/data/query/${sanityDataset}?query=${encodeURIComponent(
    query
  )}`;
  const payload = await fetchJson(url, {
    Authorization: `Bearer ${sanityToken}`,
    Accept: "application/json",
  });
  return Array.isArray(payload?.result) ? payload.result : [];
};

const getSanitySnapshots = async (
  sanityToken: string
): Promise<SanityEventSnapshot[]> => {
  const query = `*[_type == "event" && source == "msr" && _id match "event-msr-*"]{
    _id,
    sourceHash,
    title,
    cost,
    startTime,
    endTime,
    onlineEvent,
    onlineLink,
    website,
    location,
    sourceIsCancelled,
    sourceRegistrationOpenAt,
    sourceRegistrationCloseAt,
    sourceRegisterLink,
    sourceIsPublic,
    sourceRegistrationCount,
    sourceConfirmedCount,
    sourceLastRegistrantUpdateAt,
    venueName,
    category,
    address,
    body,
    mainImage{
      asset
    }
  }`;
  const url = `https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/data/query/${sanityDataset}?query=${encodeURIComponent(
    query
  )}`;
  const payload = await fetchJson(url, {
    Authorization: `Bearer ${sanityToken}`,
    Accept: "application/json",
  });
  return Array.isArray(payload?.result) ? payload.result : [];
};

const slugifySegment = (value: string): string =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w/-]+/g, "")
    .replace(/--+/g, "-");

const buildSlugCurrent = (candidate: CandidateEvent): string => {
  const monthPrefix = candidate.startTime
    ? candidate.startTime.slice(0, 7).split("-").join("/")
    : "events";
  const titleSegment =
    slugifySegment(candidate.title) || slugifySegment(candidate.msrEventId);
  const maxTitleLength = Math.max(12, 96 - (monthPrefix.length + 1));
  return `${monthPrefix}/${titleSegment.slice(0, maxTitleLength)}`;
};

const buildSanitySetAndUnset = (
  candidate: CandidateEvent,
  imageAssetRef?: string
) => {
  const set: Record<string, any> = {
    _type: "event",
    title: candidate.title,
    source: candidate.source,
    startTime: candidate.startTime,
    endTime: candidate.endTime,
    onlineEvent: candidate.onlineEvent,
    sourceHash: candidate.sourceHash,
    sourceLastSyncedAt: candidate.sourceLastSyncedAt,
    sourceIsCancelled: candidate.sourceIsCancelled,
    sourceIsPublic: candidate.sourceIsPublic,
    sourceRegistrationCount: candidate.sourceRegistrationCount,
    sourceConfirmedCount: candidate.sourceConfirmedCount,
  };
  const unset: string[] = ["startDate", "endDate"];

  const setStringOrUnset = (field: string, value: string) => {
    if (value) {
      set[field] = value;
      return;
    }
    unset.push(field);
  };

  if (candidate.cost === null || candidate.cost === undefined) {
    unset.push("cost");
  } else {
    set.cost = candidate.cost;
  }

  if (candidate.categoryRef) {
    set.category = {
      _type: "reference",
      _ref: candidate.categoryRef,
    };
  } else {
    unset.push("category");
  }

  setStringOrUnset("website", candidate.website);
  setStringOrUnset("onlineLink", candidate.onlineLink);
  setStringOrUnset(
    "sourceRegistrationOpenAt",
    candidate.sourceRegistrationOpenAt
  );
  setStringOrUnset(
    "sourceRegistrationCloseAt",
    candidate.sourceRegistrationCloseAt
  );
  setStringOrUnset("sourceRegisterLink", candidate.sourceRegisterLink);
  setStringOrUnset(
    "sourceLastRegistrantUpdateAt",
    candidate.sourceLastRegistrantUpdateAt
  );
  unset.push("sourceWaitlistCount");
  setStringOrUnset("venueName", candidate.venueName);

  if (candidate.body.length > 0) {
    set.body = candidate.body;
  } else {
    unset.push("body");
  }

  // Add excerpt field
  if (candidate.excerpt && candidate.excerpt.length > 0) {
    set.excerpt = candidate.excerpt;
  } else {
    unset.push("excerpt");
  }

  if (imageAssetRef) {
    set.mainImage = {
      _type: "mainImage",
      asset: {
        _type: "reference",
        _ref: imageAssetRef,
      },
      alt: candidate.title || "MotorsportReg event image",
    };
  }

  if (candidate.location) {
    set.location = {
      _type: "geopoint",
      lat: candidate.location.lat,
      lng: candidate.location.lng,
    };
  } else {
    unset.push("location");
  }

  const hasAddress = Object.values(candidate.address).some((segment) =>
    Boolean(String(segment || "").trim())
  );
  if (hasAddress) {
    set.address = {
      _type: "address",
      line1: candidate.address.line1,
      line2: candidate.address.line2,
      city: candidate.address.city,
      state: candidate.address.state,
      postalCode: candidate.address.postalCode,
    };
  } else {
    unset.push("address");
  }

  return { set, unset };
};

const getImageExtensionFromUrl = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop() || "";
    const extension = filename.includes(".")
      ? filename.split(".").pop() || ""
      : "";
    const cleaned = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!cleaned) return "jpg";
    return cleaned;
  } catch (_error) {
    return "jpg";
  }
};

const imageContentTypeForExtension = (extension: string): string => {
  if (extension === "png") return "image/png";
  if (extension === "gif") return "image/gif";
  if (extension === "webp") return "image/webp";
  if (extension === "svg") return "image/svg+xml";
  if (extension === "avif") return "image/avif";
  return "image/jpeg";
};

const uploadSanityImageAssetFromUrl = async (
  sanityToken: string,
  sourceImageUrl: string,
  msrEventId: string
): Promise<string> => {
  const imageResponse = await fetch(sourceImageUrl, {
    method: "GET",
    headers: {
      Accept: "image/*,*/*",
    },
  });
  if (!imageResponse.ok) {
    throw new Error(
      `Failed to fetch source image (${imageResponse.status}): ${sourceImageUrl}`
    );
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const extension = getImageExtensionFromUrl(sourceImageUrl);
  const fallbackType = imageContentTypeForExtension(extension);
  const contentType =
    String(imageResponse.headers.get("content-type") || "").trim() || fallbackType;
  const filename = `msr-${normalizeMsrEventId(msrEventId)}.${extension}`;
  const uploadUrl = `https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/assets/images/${sanityDataset}?filename=${encodeURIComponent(
    filename
  )}`;

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sanityToken}`,
      "Content-Type": contentType,
      Accept: "application/json",
    },
    body: new Uint8Array(imageBuffer),
  });
  const uploadBody = await uploadResponse.text();
  if (!uploadResponse.ok) {
    throw new Error(
      `Sanity image upload failed (${uploadResponse.status}): ${uploadBody.slice(
        0,
        500
      )}`
    );
  }

  let parsed: any = null;
  try {
    parsed = JSON.parse(uploadBody);
  } catch (_error) {
    throw new Error(
      `Sanity image upload returned non-JSON: ${uploadBody.slice(0, 500)}`
    );
  }

  const assetId = String(parsed?.document?._id || "").trim();
  if (!assetId) {
    throw new Error(
      `Sanity image upload did not return document._id: ${uploadBody.slice(0, 500)}`
    );
  }
  return assetId;
};

const getSnapshotImageAssetRef = (snapshot?: SanityEventSnapshot): string => {
  const ref = String(snapshot?.mainImage?.asset?._ref || "").trim();
  return ref;
};

const resolveImageAssetForCandidate = async (
  sanityToken: string,
  candidate: CandidateEvent,
  existingSnapshot?: SanityEventSnapshot
): Promise<{
  assetRef: string;
  reused: boolean;
  uploaded: boolean;
  error?: string;
}> => {
  const sourceImageUrl = String(candidate.sourceImageUrl || "").trim();
  if (!sourceImageUrl) {
    return {
      assetRef: "",
      reused: false,
      uploaded: false,
    };
  }

  const existingAssetRef = getSnapshotImageAssetRef(existingSnapshot);

  try {
    const uploadedAssetRef = await uploadSanityImageAssetFromUrl(
      sanityToken,
      sourceImageUrl,
      candidate.msrEventId
    );
    return {
      assetRef: uploadedAssetRef,
      reused: false,
      uploaded: true,
    };
  } catch (error) {
    return {
      assetRef: existingAssetRef || "",
      reused: Boolean(existingAssetRef),
      uploaded: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const sanityMutate = async (
  sanityToken: string,
  mutations: Array<Record<string, any>>
): Promise<any> => {
  const url = `https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/data/mutate/${sanityDataset}?returnIds=true&returnDocuments=false&visibility=sync`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sanityToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ mutations }),
  });
  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(
      `Sanity mutation failed (${response.status}): ${bodyText.slice(0, 500)}`
    );
  }
  try {
    return JSON.parse(bodyText);
  } catch (_error) {
    throw new Error(`Sanity mutation returned non-JSON: ${bodyText.slice(0, 500)}`);
  }
};

const createSanityEventDocument = async (
  sanityToken: string,
  documentId: string,
  candidate: CandidateEvent,
  imageAssetRef?: string
) => {
  const { set } = buildSanitySetAndUnset(candidate, imageAssetRef);
  await sanityMutate(sanityToken, [
    {
      createIfNotExists: {
        _id: documentId,
        ...set,
        slug: {
          _type: "slug",
          current: buildSlugCurrent(candidate),
        },
      },
    },
  ]);
};

const updateSanityEventDocument = async (
  sanityToken: string,
  documentId: string,
  candidate: CandidateEvent,
  imageAssetRef?: string
) => {
  const { set, unset } = buildSanitySetAndUnset(candidate, imageAssetRef);
  const patch: Record<string, any> = {
    id: documentId,
    set,
    setIfMissing: {
      slug: {
        _type: "slug",
        current: buildSlugCurrent(candidate),
      },
      source: "msr",
    },
  };
  if (unset.length > 0) {
    patch.unset = unset;
  }
  await sanityMutate(sanityToken, [{ patch }]);
};

const putAuditItem = async (item: Record<string, any>) => {
  await dynamoClient.send(
    new PutItemCommand({
      TableName: auditTableName,
      Item: marshall(item, { removeUndefinedValues: true }),
    })
  );
};

const putCurrentEventStateItem = async (item: Record<string, any>) => {
  await dynamoClient.send(
    new PutItemCommand({
      TableName: eventsTableName,
      Item: marshall(item, { removeUndefinedValues: true }),
    })
  );
};

const responseHeaders = {
  "Content-Type": "application/json",
};

const httpResponse = (statusCode: number, body: Record<string, any>) => ({
  statusCode,
  headers: responseHeaders,
  body: JSON.stringify(body, null, 2),
});

const isValidScheduleExpression = (value: unknown): boolean => {
  const normalized = String(value || "").trim();
  if (!normalized) return false;
  return /^(cron|rate)\(.+\)$/.test(normalized);
};

const getRuleSnapshot = async () => {
  if (!nightlyRuleName) {
    throw new Error("Missing NIGHTLY_RULE_NAME environment variable.");
  }
  return eventBridgeClient.send(new DescribeRuleCommand({ Name: nightlyRuleName }));
};

const updateRuleScheduleExpression = async (scheduleExpression: string) => {
  const normalized = String(scheduleExpression || "").trim();
  if (!isValidScheduleExpression(normalized)) {
    throw new Error(
      `Invalid schedule expression: ${scheduleExpression}. Use cron(...) or rate(...).`
    );
  }

  const existing = await getRuleSnapshot();
  await eventBridgeClient.send(
    new PutRuleCommand({
      Name: nightlyRuleName,
      ScheduleExpression: normalized,
      State: existing.State,
      Description: existing.Description,
      EventBusName: existing.EventBusName,
    })
  );
  return getRuleSnapshot();
};

const updateRuleSettings = async (args: {
  scheduleExpression?: string;
  enabled?: boolean;
}) => {
  const existing = await getRuleSnapshot();

  const nextScheduleExpression =
    args.scheduleExpression !== undefined
      ? String(args.scheduleExpression || "").trim()
      : String(existing.ScheduleExpression || "").trim();

  if (!isValidScheduleExpression(nextScheduleExpression)) {
    throw new Error(
      `Invalid schedule expression: ${nextScheduleExpression}. Use cron(...) or rate(...).`
    );
  }

  const nextState =
    args.enabled === undefined
      ? existing.State
      : args.enabled
      ? "ENABLED"
      : "DISABLED";

  await eventBridgeClient.send(
    new PutRuleCommand({
      Name: nightlyRuleName,
      ScheduleExpression: nextScheduleExpression,
      State: nextState,
      Description: existing.Description,
      EventBusName: existing.EventBusName,
    })
  );

  return getRuleSnapshot();
};

const weekdayToNumber: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

const computeNextFromDailyCron = (
  minute: number,
  hour: number,
  now: Date
): string => {
  const candidate = new Date(now);
  candidate.setUTCSeconds(0, 0);
  candidate.setUTCMinutes(minute, 0, 0);
  candidate.setUTCHours(hour);

  if (candidate.getTime() <= now.getTime()) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }
  return candidate.toISOString();
};

const computeNextFromWeeklyCron = (
  minute: number,
  hour: number,
  weekday: number,
  now: Date
): string => {
  const candidate = new Date(now);
  candidate.setUTCSeconds(0, 0);
  candidate.setUTCMinutes(minute, 0, 0);
  candidate.setUTCHours(hour);

  const today = candidate.getUTCDay();
  let deltaDays = weekday - today;
  if (deltaDays < 0) deltaDays += 7;
  candidate.setUTCDate(candidate.getUTCDate() + deltaDays);

  if (candidate.getTime() <= now.getTime()) {
    candidate.setUTCDate(candidate.getUTCDate() + 7);
  }

  return candidate.toISOString();
};

const computeNextFromEveryTwelveHoursCron = (
  minute: number,
  now: Date
): string => {
  const cursor = new Date(now);
  cursor.setUTCSeconds(0, 0);
  cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);

  const maxMinutesToScan = 60 * 24 * 14;
  for (let i = 0; i < maxMinutesToScan; i += 1) {
    if (
      cursor.getUTCMinutes() === minute &&
      cursor.getUTCHours() % 12 === 0
    ) {
      return cursor.toISOString();
    }
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  }

  return "";
};

const computeNextFromRateExpression = (
  unit: string,
  amount: number,
  now: Date
): string => {
  if (!Number.isFinite(amount) || amount <= 0) return "";
  const next = new Date(now);
  const normalizedUnit = String(unit || "").trim().toLowerCase();

  if (normalizedUnit.startsWith("minute")) {
    next.setUTCMinutes(next.getUTCMinutes() + amount);
    return next.toISOString();
  }
  if (normalizedUnit.startsWith("hour")) {
    next.setUTCHours(next.getUTCHours() + amount);
    return next.toISOString();
  }
  if (normalizedUnit.startsWith("day")) {
    next.setUTCDate(next.getUTCDate() + amount);
    return next.toISOString();
  }
  return "";
};

const getNextInvocationIsoFromScheduleExpression = (
  scheduleExpression: string,
  now: Date = new Date()
): string => {
  const expression = String(scheduleExpression || "").trim();
  if (!expression) return "";

  const everyTwelveHoursMatch = expression.match(
    /^cron\((\d{1,2})\s+\*\/12\s+\*\s+\*\s+\?\s+\*\)$/i
  );
  if (everyTwelveHoursMatch) {
    const minute = Number(everyTwelveHoursMatch[1]);
    if (!Number.isFinite(minute) || minute < 0 || minute > 59) return "";
    return computeNextFromEveryTwelveHoursCron(minute, now);
  }

  const dailyMatch = expression.match(
    /^cron\((\d{1,2})\s+(\d{1,2})\s+\*\s+\*\s+\?\s+\*\)$/i
  );
  if (dailyMatch) {
    const minute = Number(dailyMatch[1]);
    const hour = Number(dailyMatch[2]);
    if (!Number.isFinite(minute) || minute < 0 || minute > 59) return "";
    if (!Number.isFinite(hour) || hour < 0 || hour > 23) return "";
    return computeNextFromDailyCron(minute, hour, now);
  }

  const weeklyMatch = expression.match(
    /^cron\((\d{1,2})\s+(\d{1,2})\s+\?\s+\*\s+([A-Z]{3})\s+\*\)$/i
  );
  if (weeklyMatch) {
    const minute = Number(weeklyMatch[1]);
    const hour = Number(weeklyMatch[2]);
    const weekdayCode = String(weeklyMatch[3] || "").toUpperCase();
    const weekday = weekdayToNumber[weekdayCode];
    if (!Number.isFinite(minute) || minute < 0 || minute > 59) return "";
    if (!Number.isFinite(hour) || hour < 0 || hour > 23) return "";
    if (weekday === undefined) return "";
    return computeNextFromWeeklyCron(minute, hour, weekday, now);
  }

  const rateMatch = expression.match(/^rate\((\d+)\s+([a-zA-Z]+)\)$/i);
  if (rateMatch) {
    const amount = Number(rateMatch[1]);
    const unit = String(rateMatch[2] || "");
    return computeNextFromRateExpression(unit, amount, now);
  }

  return "";
};

const getRecentRunSummaries = async (requestedLimit: number) => {
  const limit = Math.max(1, Math.min(50, requestedLimit || 10));
  const items: Array<Record<string, any>> = [];
  let lastEvaluatedKey: Record<string, any> | undefined = undefined;

  do {
    const page = await dynamoClient.send(
      new ScanCommand({
        TableName: auditTableName,
        ProjectionExpression: "pk, sk, createdAt, totals, writeSummary",
        FilterExpression: "#sk = :summary AND begins_with(#pk, :runPrefix)",
        ExpressionAttributeNames: {
          "#pk": "pk",
          "#sk": "sk",
        },
        ExpressionAttributeValues: {
          ":summary": { S: "SUMMARY" },
          ":runPrefix": { S: "RUN#" },
        },
        ExclusiveStartKey: lastEvaluatedKey,
        Limit: 200,
      })
    );

    for (const item of page.Items || []) {
      const parsed = unmarshall(item) as Record<string, any>;
      items.push(parsed);
    }

    lastEvaluatedKey = page.LastEvaluatedKey as Record<string, any> | undefined;
    if (items.length >= limit * 5) break;
  } while (lastEvaluatedKey);

  const summaries = items
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, limit)
    .map((item) => ({
      runId: String(item.pk || "").replace(/^RUN#/, ""),
      generatedAt: String(item.createdAt || ""),
      totals: item.totals || {},
      writes: item.writeSummary || {},
    }));

  return summaries;
};

export const handler = async (rawEvent: Record<string, any> = {}) => {
  const event = normalizeInvocationEvent(rawEvent);
  const operation = String(event.operation || "").trim().toLowerCase();

  if (operation === "source_settings") {
    try {
      const source = String(event.source || "").trim().toLowerCase();
      if (source !== "msr") {
        return httpResponse(400, {
          error: "Unsupported source",
          message: "Only source='msr' is currently supported.",
        });
      }

      let ruleSnapshot = await getRuleSnapshot();
      let applied = false;
      let appliedAt = "";

      const requestedEnabled =
        event.enabled === undefined
          ? undefined
          : parseBooleanWithDefault(event.enabled, true);

      if (event.scheduleExpression !== undefined || requestedEnabled !== undefined) {
        ruleSnapshot = await updateRuleSettings({
          scheduleExpression:
            event.scheduleExpression !== undefined
              ? String(event.scheduleExpression || "")
              : undefined,
          enabled: requestedEnabled,
        });
        applied = true;
        appliedAt = new Date().toISOString();
      }

      const effectiveScheduleExpression =
        event.scheduleExpression !== undefined
          ? String(event.scheduleExpression || "").trim()
          : String(ruleSnapshot.ScheduleExpression || "").trim();

      const effectiveEnabled =
        requestedEnabled !== undefined
          ? requestedEnabled
          : String(ruleSnapshot.State || "").toUpperCase() !== "DISABLED";

      const effectiveState = effectiveEnabled ? "ENABLED" : "DISABLED";

      const recentRunsLimit = parseNonNegativeIntWithDefault(
        event.recentRunsLimit,
        10
      );
      const recentRuns = await getRecentRunSummaries(recentRunsLimit || 10);

      return httpResponse(200, {
        source: "msr",
        applied,
        ...(appliedAt ? { appliedAt } : {}),
        scheduleExpression: effectiveScheduleExpression,
        state: effectiveState,
        enabled: effectiveEnabled,
        nextInvocationAt: effectiveEnabled
          ? getNextInvocationIsoFromScheduleExpression(effectiveScheduleExpression)
          : "",
        recentRuns,
      });
    } catch (error) {
      return httpResponse(500, {
        error: "Failed to apply source settings",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const applyWrites = parseBooleanWithDefault(
    event.applyWrites,
    defaultApplyWrites
  );
  const maxCreates = parseNonNegativeIntWithDefault(
    event.maxCreates,
    defaultMaxCreateActionsPerRun
  );
  const maxUpdates = parseNonNegativeIntWithDefault(
    event.maxUpdates,
    defaultMaxUpdateActionsPerRun
  );

  const startedAt = new Date();
  const startedAtIso = startedAt.toISOString();
  const runId = `${startedAt.getTime()}-${crypto
    .randomBytes(4)
    .toString("hex")}`;
  const windowStart = isoDateWithOffset(calendarStartOffsetDays);
  const windowEnd = isoDateWithOffset(calendarEndOffsetDays);

  const msrPassword = await getSecretString(msrPasswordSecretName);
  const sanityToken = await getSecretString(sanityTokenSecretName);
  const msrHeaders = getMsrAuthHeaders(
    msrUsername,
    msrPassword,
    msrOrganizationId
  );

  const calendarUrl = `https://api.motorsportreg.com/rest/calendars/organization/${msrOrganizationId}.json?start=${windowStart}&end=${windowEnd}&exclude_cancelled=false`;
  const calendarPayload = await fetchJson(calendarUrl, msrHeaders);
  const allCalendarEvents: MsrCalendarEvent[] = Array.isArray(calendarPayload?.response?.events)
    ? calendarPayload.response.events
    : [];
  const requestedEventIds = parseRequestedMsrEventIds(event);
  const events: MsrCalendarEvent[] =
    requestedEventIds.size > 0
      ? allCalendarEvents.filter((eventItem) =>
          requestedEventIds.has(normalizeMsrEventId(eventItem.id))
        )
      : allCalendarEvents;
  const eventCategories = await getSanityEventCategories(sanityToken);
  const eventCategoryLookup = buildEventCategoryLookup(eventCategories);

  const existingSnapshots = await getSanitySnapshots(sanityToken);
  const existingByMsrEventId = new Map<string, SanityEventSnapshot>();
  for (const snapshot of existingSnapshots) {
    const msrEventId = extractMsrEventIdFromDocumentId(snapshot._id);
    if (msrEventId) {
      existingByMsrEventId.set(msrEventId, snapshot);
    }
  }

  const decisions: Array<Record<string, any>> = [];
  const currentStateItems: Array<Record<string, any>> = [];
  const currentStateByEventId = new Map<string, Record<string, any>>();
  const writePlans: Array<{
    msrEventId: string;
    action: "create" | "update";
    documentId: string;
    candidate: CandidateEvent;
    existingSnapshot?: SanityEventSnapshot;
    decision: Record<string, any>;
  }> = [];

  let createCount = 0;
  let updateCount = 0;
  let noChangeCount = 0;
  let errorCount = 0;

  for (const eventItem of events) {
    const msrEventId = normalizeMsrEventId(eventItem.id);

    if (!msrEventId) {
      errorCount += 1;
      decisions.push({
        eventId: "",
        title: eventItem.name || "",
        action: "error",
        reason: "Missing MSR event ID in calendar payload",
        write: {
          status: "not_applicable",
        },
      });
      continue;
    }

    if (shouldSkipEventImportByName(eventItem)) {
      noChangeCount += 1;
      decisions.push({
        eventId: msrEventId,
        title: eventItem.name || "",
        action: "no_change",
        reason: "Skipped by import filter: event name contains virtual/gift card",
        write: {
          status: "not_applicable",
        },
      });
      currentStateItems.push({
        pk: `EVENT#${msrEventId}`,
        sk: "CURRENT",
        eventPk: `EVENT#${msrEventId}`,
        runPk: `RUN#${runId}`,
        createdAt: startedAtIso,
        updatedAt: startedAtIso,
        runId,
        action: "skipped",
        reason: "Skipped by import filter: event name contains virtual/gift card",
        title: eventItem.name || "",
        writeStatus: "not_applicable",
        sourceCalendarEvent: eventItem,
      });
      continue;
    }

    const attendeeUrl = `https://api.motorsportreg.com/rest/events/${encodeURIComponent(
      eventItem.id
    )}/attendees.json`;

    try {
      const attendeesPayload = await fetchJson(attendeeUrl, msrHeaders);
      const attendees: MsrAttendee[] = Array.isArray(
        attendeesPayload?.response?.attendees
      )
        ? attendeesPayload.response.attendees
        : [];

      const attendeeSummary = getAttendeeSummary(attendees);
      const categoryRef = resolveCategoryRefForEvent(
        eventItem,
        eventCategoryLookup
      );
      const { shape: comparableShape, sourceCostText } = buildComparableEventShape(
        eventItem,
        attendeeSummary,
        categoryRef
      );
      const candidate = buildCandidateEvent(
        eventItem,
        comparableShape,
        startedAtIso,
        sourceCostText
      );

      const existing = existingByMsrEventId.get(msrEventId);
      const documentId = existing?._id || buildDocumentIdFromMsrEventId(msrEventId);

      let action: "create" | "update" | "no_change" = "create";
      let reason = "No existing MSR event found in Sanity";
      if (existing) {
        const existingComparable = buildComparableFromSanity(existing);
        const existingHash = hashComparableShape(existingComparable);
        const incomingHash = hashComparableShape(comparableShape);

        if (existingHash === incomingHash) {
          action = "no_change";
          reason = "Source hash unchanged";
        } else {
          action = "update";
          reason = "Source hash changed";
        }
      }

      if (action === "create") createCount += 1;
      if (action === "update") updateCount += 1;
      if (action === "no_change") noChangeCount += 1;

      const decision: Record<string, any> = {
        eventId: msrEventId,
        title: candidate.title,
        action,
        reason,
        sanityDocumentId: documentId,
        windowStart,
        windowEnd,
        write: {
          status:
            action === "create" || action === "update"
              ? applyWrites
                ? "pending"
                : "dry_run"
              : "not_applicable",
        },
        counts: {
          total: candidate.sourceRegistrationCount,
          confirmed: candidate.sourceConfirmedCount,
          waitlist: candidate.sourceWaitlistCount,
        },
        source: {
          cancelled: candidate.sourceIsCancelled,
          isPublic: candidate.sourceIsPublic,
        },
        payloadPreview: {
          source: candidate.source,
          title: candidate.title,
          cost: candidate.cost,
          derivedCostText: candidate.derivedCostText,
          startTime: candidate.startTime,
          endTime: candidate.endTime,
          onlineEvent: candidate.onlineEvent,
          onlineLink: candidate.onlineLink,
          website: candidate.website,
          venueName: candidate.venueName,
          categoryRef: candidate.categoryRef,
          address: candidate.address,
          location: candidate.location,
          sourceRegistrationOpenAt: candidate.sourceRegistrationOpenAt,
          sourceRegistrationCloseAt: candidate.sourceRegistrationCloseAt,
          sourceRegisterLink: candidate.sourceRegisterLink,
          sourceRegistrationCount: candidate.sourceRegistrationCount,
          sourceConfirmedCount: candidate.sourceConfirmedCount,
          sourceWaitlistCount: candidate.sourceWaitlistCount,
          sourceLastRegistrantUpdateAt: candidate.sourceLastRegistrantUpdateAt,
          sourceHash: candidate.sourceHash,
          bodyBlockCount: candidate.body.length,
        },
        fullEventDetails: {
          sourceCalendarEvent: eventItem,
          attendeeSummary,
          candidate,
        },
      };
      decisions.push(decision);

      const stateItem = {
        pk: `EVENT#${msrEventId}`,
        sk: "CURRENT",
        eventPk: `EVENT#${msrEventId}`,
        runPk: `RUN#${runId}`,
        createdAt: startedAtIso,
        updatedAt: startedAtIso,
        runId,
        action,
        reason,
        title: candidate.title,
        sanityDocumentId: documentId,
        sourceHash: candidate.sourceHash,
        writeStatus:
          action === "create" || action === "update"
            ? applyWrites
              ? "pending"
              : "dry_run"
            : "not_applicable",
        sourceCalendarEvent: eventItem,
        attendeeSummary,
        candidatePayload: candidate,
      };
      currentStateItems.push(stateItem);
      currentStateByEventId.set(msrEventId, stateItem);

      if (action === "create" || action === "update") {
        writePlans.push({
          msrEventId,
          action,
          documentId,
          candidate,
          existingSnapshot: existing,
          decision,
        });
      }
    } catch (error) {
      errorCount += 1;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      decisions.push({
        eventId: msrEventId,
        title: eventItem.name || "",
        action: "error",
        reason: "Failed to evaluate attendees payload",
        error: errorMessage,
        write: {
          status: "not_applicable",
        },
      });
      currentStateItems.push({
        pk: `EVENT#${msrEventId}`,
        sk: "CURRENT",
        eventPk: `EVENT#${msrEventId}`,
        runPk: `RUN#${runId}`,
        createdAt: startedAtIso,
        updatedAt: startedAtIso,
        runId,
        action: "error",
        reason: "Failed to evaluate attendees payload",
        title: eventItem.name || "",
        writeStatus: "not_applicable",
        sourceCalendarEvent: eventItem,
        error: errorMessage,
      });
    }
  }

  writePlans.sort((left, right) => {
    const byStart = left.candidate.startTime.localeCompare(right.candidate.startTime);
    if (byStart !== 0) return byStart;
    return left.candidate.title.localeCompare(right.candidate.title);
  });

  let appliedCreateCount = 0;
  let appliedUpdateCount = 0;
  let writeErrorCount = 0;
  let skippedCreateByLimitCount = 0;
  let skippedUpdateByLimitCount = 0;

  for (const plan of writePlans) {
    const stateItem = currentStateByEventId.get(plan.msrEventId);
    if (!applyWrites) {
      continue;
    }

    if (plan.action === "create" && appliedCreateCount >= maxCreates) {
      skippedCreateByLimitCount += 1;
      plan.decision.write = {
        status: "skipped_limit",
        operation: "create",
        reason: `Max create limit reached (${maxCreates})`,
      };
      if (stateItem) {
        stateItem.writeStatus = "skipped_limit";
        stateItem.writeReason = `Max create limit reached (${maxCreates})`;
      }
      continue;
    }

    if (plan.action === "update" && appliedUpdateCount >= maxUpdates) {
      skippedUpdateByLimitCount += 1;
      plan.decision.write = {
        status: "skipped_limit",
        operation: "update",
        reason: `Max update limit reached (${maxUpdates})`,
      };
      if (stateItem) {
        stateItem.writeStatus = "skipped_limit";
        stateItem.writeReason = `Max update limit reached (${maxUpdates})`;
      }
      continue;
    }

    try {
      const imageResolution = await resolveImageAssetForCandidate(
        sanityToken,
        plan.candidate,
        plan.existingSnapshot
      );
      const imageAssetRef = imageResolution.assetRef || undefined;

      if (plan.action === "create") {
        await createSanityEventDocument(
          sanityToken,
          plan.documentId,
          plan.candidate,
          imageAssetRef
        );
        appliedCreateCount += 1;
      } else {
        await updateSanityEventDocument(
          sanityToken,
          plan.documentId,
          plan.candidate,
          imageAssetRef
        );
        appliedUpdateCount += 1;
      }

      plan.decision.write = {
        status: "applied",
        operation: plan.action,
        documentId: plan.documentId,
        image: {
          assetRef: imageResolution.assetRef || "",
          reused: imageResolution.reused,
          uploaded: imageResolution.uploaded,
          error: imageResolution.error || "",
        },
      };
      if (stateItem) {
        stateItem.writeStatus = "applied";
        stateItem.writeOperation = plan.action;
        stateItem.imageAssetRef = imageResolution.assetRef || "";
        stateItem.imageAssetUploaded = imageResolution.uploaded;
        stateItem.imageAssetReused = imageResolution.reused;
        if (imageResolution.error) {
          stateItem.imageAssetError = imageResolution.error;
        }
      }
    } catch (error) {
      writeErrorCount += 1;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      plan.decision.write = {
        status: "error",
        operation: plan.action,
        documentId: plan.documentId,
        error: errorMessage,
      };
      if (stateItem) {
        stateItem.writeStatus = "error";
        stateItem.writeOperation = plan.action;
        stateItem.writeError = errorMessage;
      }
    }
  }

  const actionable = decisions.filter(
    (decision) => decision.action === "create" || decision.action === "update"
  );

  const writeSummary = {
    enabled: applyWrites,
    limits: {
      maxCreates,
      maxUpdates,
    },
    planned: {
      create: createCount,
      update: updateCount,
      actionable: actionable.length,
    },
    applied: {
      create: appliedCreateCount,
      update: appliedUpdateCount,
      total: appliedCreateCount + appliedUpdateCount,
    },
    skippedByLimit: {
      create: skippedCreateByLimitCount,
      update: skippedUpdateByLimitCount,
      total: skippedCreateByLimitCount + skippedUpdateByLimitCount,
    },
    errors: writeErrorCount,
  };

  await putAuditItem({
    pk: `RUN#${runId}`,
    sk: "SUMMARY",
    eventPk: "EVENT#SUMMARY",
    createdAt: startedAtIso,
    windowStart,
    windowEnd,
    totals: {
      fetched: events.length,
      create: createCount,
      update: updateCount,
      noChange: noChangeCount,
      error: errorCount,
    },
    actionableCount: actionable.length,
    writeSummary,
  });

  for (const decision of decisions) {
    await putAuditItem({
      pk: `RUN#${runId}`,
      sk: `EVENT#${decision.eventId || randomKey()}`,
      eventPk: `EVENT#${decision.eventId || "UNKNOWN"}`,
      createdAt: startedAtIso,
      action: decision.action,
      title: decision.title || "",
      reason: decision.reason || "",
      counts: decision.counts || {},
      source: decision.source || {},
      write: decision.write || {},
      sanityDocumentId: decision.sanityDocumentId || "",
      error: decision.error || "",
    });
  }

  for (const stateItem of currentStateItems) {
    await putCurrentEventStateItem(stateItem);
  }

  const responseBody = {
    runId,
    generatedAt: startedAtIso,
    dryRun: !applyWrites,
    mode: applyWrites ? "apply" : "dry_run",
    organizationId: msrOrganizationId,
    invocationOptions: {
      applyWrites,
      maxCreates,
      maxUpdates,
      requestedEventIds: Array.from(requestedEventIds),
    },
    totals: {
      fetched: events.length,
      create: createCount,
      update: updateCount,
      noChange: noChangeCount,
      error: errorCount,
      actionable: actionable.length,
    },
    writes: writeSummary,
    calendarWindow: {
      start: windowStart,
      end: windowEnd,
    },
    events: actionable,
    allDecisions: decisions,
  };

  return httpResponse(200, responseBody);
};

