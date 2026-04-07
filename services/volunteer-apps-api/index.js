"use strict";

const crypto = require("crypto");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
const {
  SESClient,
  SendEmailCommand,
  SendTemplatedEmailCommand,
} = require("@aws-sdk/client-ses");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const awsRegion = process.env.AWS_REGION || "us-west-2";
const secretsManager = new SecretsManagerClient({ region: awsRegion });
const dynamoDb = new DynamoDBClient({ region: awsRegion });
const secretCache = new Map();
const applicationEventsTableNameRaw =
  process.env.APPLICATION_EVENTS_TABLE_NAME || "";
const pointsLedgerTableNameRaw = process.env.POINTS_LEDGER_TABLE_NAME || "";

const SIGNATURE_HEADER_NAME = "sanity-webhook-signature";

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify(body),
});

const html = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  },
  body,
});

const safeParseBody = (event) => {
  if (!event || !event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch (_error) {
    return null;
  }
};

const buildRouteKey = (event) => {
  const method = String(event?.httpMethod || "").toUpperCase();
  const path = String(event?.resource || event?.path || "");
  return `${method} ${path}`;
};

const normalizeEmail = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeText = (value) => String(value || "").trim();
const applicationEventsTableName = normalizeText(applicationEventsTableNameRaw);
const pointsLedgerTableName = normalizeText(pointsLedgerTableNameRaw);
const SETTINGS_CACHE_TTL_MS = 60 * 1000;
const appSettingsCache = {
  expiresAt: 0,
  value: null,
  pending: null,
};

const normalizeStatus = (value) => normalizeText(value).toLowerCase();
const normalizeDomain = (value) => normalizeText(value).toLowerCase();

const uniqueValues = (values) =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => normalizeText(value))
        .filter(Boolean)
    )
  );

const buildEmailAliasAddress = (aliasName, domain) => {
  const localPart = normalizeText(aliasName).toLowerCase();
  const normalizedDomain = normalizeDomain(domain);
  if (!localPart || !normalizedDomain) return "";
  if (localPart.includes("@") || normalizedDomain.includes("@")) return "";
  return `${localPart}@${normalizedDomain}`;
};

const buildSesSourceAddress = ({ fromName, fromEmail }) => {
  const normalizedEmail = normalizeEmail(fromEmail);
  if (!isValidEmail(normalizedEmail)) return "";
  const normalizedName = normalizeText(fromName).replace(/"/g, '\\"');
  return normalizedName ? `"${normalizedName}" <${normalizedEmail}>` : normalizedEmail;
};

const parseEmailList = (value) =>
  uniqueValues(String(value || "").split(",").map((entry) => normalizeEmail(entry)))
    .filter((entry) => isValidEmail(entry));

const resolveBooleanSetting = (value, fallback) =>
  typeof value === "boolean" ? value : fallback;

const ROLE_ICON_NAME_BY_KEY = {
  user: "user",
  "user-check": "user-check",
  users: "users",
  "clipboard-check": "clipboard-check",
  shield: "shield-alt",
  camera: "camera",
  route: "route",
  bullhorn: "bullhorn",
  wrench: "wrench",
  toolbox: "toolbox",
  "hands-helping": "hands-helping",
  car: "car-side",
  "id-badge": "id-badge",
  "hard-hat": "hard-hat",
  heart: "heart",
  "flag-checkered": "flag-checkered",
  cogs: "cogs",
  calendar: "calendar-alt",
  award: "award",
};

const getRoleIconUrl = (value) => {
  const normalized = normalizeStatus(value);
  const iconName = ROLE_ICON_NAME_BY_KEY[normalized] || "flag-checkered";
  return `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.4/svgs/solid/${iconName}.svg`;
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const STATUS_TRANSITIONS = {
  submitted: ["assigned", "denied", "withdrawn"],
  assigned: ["withdrawn"],
  denied: [],
  withdrawn: [],
  expired: [],
};

const STATUS_TIMESTAMP_FIELD = {
  assigned: "assignedAt",
  denied: "deniedAt",
  withdrawn: "withdrawnAt",
  expired: "expiredAt",
};

const getSanityApiToken = async () => {
  const tokenFromEnv = process.env.SANITY_API_TOKEN || "";
  if (tokenFromEnv) {
    return tokenFromEnv;
  }

  const secretName = process.env.SANITY_API_TOKEN_SECRET_NAME || "";
  if (!secretName) {
    throw new Error(
      "Missing SANITY_API_TOKEN or SANITY_API_TOKEN_SECRET_NAME environment configuration."
    );
  }

  const secretValue = await secretsManager.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  const rawString = secretValue?.SecretString || "";
  if (!rawString) {
    throw new Error(`Secret ${secretName} has no SecretString value.`);
  }
  let resolvedToken = "";
  try {
    const parsed = JSON.parse(rawString);
    resolvedToken =
      parsed?.SANITY_API_TOKEN ||
      parsed?.token ||
      parsed?.Token ||
      rawString.trim();
  } catch (_error) {
    resolvedToken = rawString.trim();
  }

  if (!resolvedToken) {
    throw new Error(`Secret ${secretName} did not resolve to a token value.`);
  }

  return resolvedToken;
};

const getSecretTokenByName = async (secretName, fallbackKeys = []) => {
  const normalizedName = normalizeText(secretName);
  if (!normalizedName) return "";
  if (secretCache.has(normalizedName)) {
    return secretCache.get(normalizedName) || "";
  }

  const secretValue = await secretsManager.send(
    new GetSecretValueCommand({ SecretId: normalizedName })
  );
  const rawString = secretValue?.SecretString || "";
  if (!rawString) {
    throw new Error(`Secret ${normalizedName} has no SecretString value.`);
  }

  let resolved = "";
  try {
    const parsed = JSON.parse(rawString);
    const keys = fallbackKeys.length > 0 ? fallbackKeys : ["token", "Token"];
    for (const key of keys) {
      if (normalizeText(parsed?.[key])) {
        resolved = normalizeText(parsed[key]);
        break;
      }
    }
    if (!resolved) {
      resolved = normalizeText(rawString);
    }
  } catch (_error) {
    resolved = normalizeText(rawString);
  }

  secretCache.set(normalizedName, resolved);
  return resolved;
};

const getAdminActionToken = async () => {
  const envToken = normalizeText(process.env.ADMIN_ACTION_TOKEN || "");
  if (envToken) return envToken;
  const secretName = normalizeText(
    process.env.ADMIN_ACTION_TOKEN_SECRET_NAME || ""
  );
  if (!secretName) return "";
  return getSecretTokenByName(secretName, [
    "ADMIN_ACTION_TOKEN",
    "adminActionToken",
    "token",
    "Token",
  ]);
};

const getSanityWebhookSecret = async () => {
  const envSecret = normalizeText(process.env.SANITY_WEBHOOK_SECRET || "");
  if (envSecret) return envSecret;
  const secretName = normalizeText(
    process.env.SANITY_WEBHOOK_SECRET_NAME || ""
  );
  if (!secretName) return "";
  return getSecretTokenByName(secretName, [
    "SANITY_WEBHOOK_SECRET",
    "sanityWebhookSecret",
    "webhookSecret",
    "secret",
    "token",
    "Token",
  ]);
};

const parseWebhookSignature = (signatureHeader) => {
  const normalized = normalizeText(signatureHeader);
  if (!normalized) return null;
  const matches = normalized.match(
    /(?:^|,)\s*t=(\d+)\s*,\s*v1=([A-Za-z0-9\-_]+)/i
  );
  if (!matches) return null;
  return {
    timestamp: Number(matches[1]),
    signature: matches[2],
  };
};

const toBase64Url = (buffer) =>
  Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const isValidWebhookSignature = ({ body, signatureHeader, secret }) => {
  const parsed = parseWebhookSignature(signatureHeader);
  const webhookSecret = normalizeText(secret);
  if (!parsed || !webhookSecret) return false;
  const signedPayload = `${parsed.timestamp}.${String(body || "")}`;
  const computedSignature = toBase64Url(
    crypto.createHmac("sha256", webhookSecret).update(signedPayload).digest()
  );
  if (computedSignature.length !== parsed.signature.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(computedSignature),
    Buffer.from(parsed.signature)
  );
};

const decodeRequestBody = (event) => {
  if (!event?.body) return "";
  if (event.isBase64Encoded) {
    return Buffer.from(String(event.body), "base64").toString("utf8");
  }
  return String(event.body);
};

const conditionalPutDynamoItem = async ({
  tableName,
  item,
  partitionKeyName = "pk",
  sortKeyName = "sk",
}) => {
  const normalizedTableName = normalizeText(tableName);
  if (!normalizedTableName || !item) {
    return { written: false, reason: "table_not_configured" };
  }

  try {
    await dynamoDb.send(
      new PutItemCommand({
        TableName: normalizedTableName,
        Item: item,
        ConditionExpression:
          "attribute_not_exists(#partitionKey) AND attribute_not_exists(#sortKey)",
        ExpressionAttributeNames: {
          "#partitionKey": partitionKeyName,
          "#sortKey": sortKeyName,
        },
      })
    );
    return { written: true };
  } catch (error) {
    if (error?.name === "ConditionalCheckFailedException") {
      return { written: false, reason: "duplicate" };
    }
    throw error;
  }
};

const getSanityConfig = () => {
  const projectId = process.env.SANITY_PROJECT_ID || "";
  const dataset = process.env.SANITY_DATASET || "";
  const apiVersionRaw = process.env.SANITY_API_VERSION || "2025-01-01";
  const apiVersion = apiVersionRaw.startsWith("v")
    ? apiVersionRaw
    : `v${apiVersionRaw}`;
  if (!projectId || !dataset) {
    throw new Error("Missing required Sanity environment configuration.");
  }
  const baseUrl = `https://${projectId}.api.sanity.io/${apiVersion}/data`;
  return { baseUrl, dataset };
};

const sanityFetchQuery = async (query, params = {}) => {
  const { baseUrl, dataset } = getSanityConfig();
  const apiToken = await getSanityApiToken();
  const url = new URL(`${baseUrl}/query/${dataset}`);
  url.searchParams.set("query", query);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sanity query failed (${response.status}): ${text}`);
  }

  const payload = await response.json();
  return payload?.result;
};

const sanityMutate = async (mutations) => {
  const { baseUrl, dataset } = getSanityConfig();
  const apiToken = await getSanityApiToken();
  const response = await fetch(`${baseUrl}/mutate/${dataset}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sanity mutate failed (${response.status}): ${text}`);
  }

  return response.json();
};

const getAppSettings = async ({ forceRefresh = false } = {}) => {
  const now = Date.now();
  if (
    !forceRefresh &&
    appSettingsCache.value &&
    appSettingsCache.expiresAt > now
  ) {
    return appSettingsCache.value;
  }
  if (!forceRefresh && appSettingsCache.pending) {
    return appSettingsCache.pending;
  }

  const pending = (async () => {
    try {
      const result = await sanityFetchQuery(`{
        "siteDomain": *[_type == "siteSettings"][0].domain,
        "emailSendingSettings": *[_type == "emailSendingSettings"][0]{
          fromName,
          fromEmail
        },
        "volunteerApplicationLifecycleSettings": *[_type == "volunteerApplicationLifecycleSettings"][0]{
          "replyTo": replyTo[0]{
            _type,
            email,
            "aliasName": alias->name
          },
          sendStaffNotificationOnNewApplication,
          sendApplicantSubmissionConfirmation,
          sendApplicantUpdateConfirmation,
          sendApplicantApprovalEmail,
          sendApplicantDeclineEmail,
          sendApplicantWithdrawalEmail,
          requirePublicReasonOnDecline,
          "staffNotificationAliasName": staffNotificationAlias->name
        }
      }`);

      const value = {
        siteDomain: normalizeDomain(result?.siteDomain || ""),
        emailSendingSettings: {
          fromName: normalizeText(result?.emailSendingSettings?.fromName || ""),
          fromEmail: normalizeEmail(
            result?.emailSendingSettings?.fromEmail || ""
          ),
        },
        volunteerApplicationLifecycleSettings: {
          replyToEmailOverride: normalizeEmail(
            (result?.volunteerApplicationLifecycleSettings?.replyTo?._type ===
            "emailAliasAddressRecipient"
              ? result?.volunteerApplicationLifecycleSettings?.replyTo?.email
              : result?.volunteerApplicationLifecycleSettings?.replyToEmailOverride) || ""
          ),
          replyToAliasName: normalizeText(
            (result?.volunteerApplicationLifecycleSettings?.replyTo?._type ===
            "emailAliasReferenceRecipient"
              ? result?.volunteerApplicationLifecycleSettings?.replyTo?.aliasName
              : result?.volunteerApplicationLifecycleSettings?.replyToAliasName) || ""
          ),
          sendStaffNotificationOnNewApplication: resolveBooleanSetting(
            result?.volunteerApplicationLifecycleSettings
              ?.sendStaffNotificationOnNewApplication,
            true
          ),
          sendApplicantSubmissionConfirmation: resolveBooleanSetting(
            result?.volunteerApplicationLifecycleSettings
              ?.sendApplicantSubmissionConfirmation,
            true
          ),
          sendApplicantUpdateConfirmation: resolveBooleanSetting(
            result?.volunteerApplicationLifecycleSettings
              ?.sendApplicantUpdateConfirmation,
            true
          ),
          sendApplicantApprovalEmail: resolveBooleanSetting(
            result?.volunteerApplicationLifecycleSettings
              ?.sendApplicantApprovalEmail,
            true
          ),
          sendApplicantDeclineEmail: resolveBooleanSetting(
            result?.volunteerApplicationLifecycleSettings
              ?.sendApplicantDeclineEmail,
            true
          ),
          sendApplicantWithdrawalEmail: resolveBooleanSetting(
            result?.volunteerApplicationLifecycleSettings
              ?.sendApplicantWithdrawalEmail,
            true
          ),
          requirePublicReasonOnDecline: resolveBooleanSetting(
            result?.volunteerApplicationLifecycleSettings
              ?.requirePublicReasonOnDecline,
            true
          ),
          staffNotificationAliasName: normalizeText(
            result?.volunteerApplicationLifecycleSettings
              ?.staffNotificationAliasName || ""
          ),
        },
      };

      appSettingsCache.value = value;
      appSettingsCache.expiresAt = Date.now() + SETTINGS_CACHE_TTL_MS;
      return value;
    } finally {
      appSettingsCache.pending = null;
    }
  })();

  appSettingsCache.pending = pending;
  return pending;
};

const getResolvedEmailRuntimeSettings = async () => {
  let settings = null;
  try {
    settings = await getAppSettings();
  } catch (_error) {
    settings = null;
  }

  const siteDomain = normalizeDomain(settings?.siteDomain || "");
  const sending = settings?.emailSendingSettings || {};
  const lifecycle = settings?.volunteerApplicationLifecycleSettings || {};

  const fallbackFromEmail = normalizeEmail(process.env.SES_FROM_EMAIL || "");
  const source =
    buildSesSourceAddress({
      fromName: sending.fromName || "",
      fromEmail: sending.fromEmail || fallbackFromEmail,
    }) || fallbackFromEmail;

  const replyToAddress =
    normalizeEmail(lifecycle.replyToEmailOverride || "") ||
    buildEmailAliasAddress(lifecycle.replyToAliasName, siteDomain);

  const staffNotificationAliasAddress = buildEmailAliasAddress(
    lifecycle.staffNotificationAliasName,
    siteDomain
  );
  const staffNotificationAddresses = staffNotificationAliasAddress
    ? [staffNotificationAliasAddress]
    : parseEmailList(process.env.STAFF_NOTIFICATION_EMAILS || "");

  return {
    source,
    replyToAddresses: replyToAddress ? [replyToAddress] : [],
    lifecycle,
    staffNotificationAddresses,
  };
};

const buildApplicationId = () => {
  const timePart = Date.now().toString(36);
  const randomPart = crypto.randomBytes(5).toString("hex");
  return `app_${timePart}_${randomPart}`;
};

const findExistingActiveApplication = async (positionId, email) => {
  const query = `*[_type == "volunteerApplication" && position._ref == $positionId && lower(applicantEmail) == $email && status in ["submitted", "assigned"]][0]{
    _id,
    applicationId,
    status,
    submittedAt,
    applicantName,
    applicantEmail,
    applicantNotes
  }`;

  return sanityFetchQuery(query, {
    positionId,
    email,
  });
};

const getPositionContext = async (positionId) => {
  const query = `*[_type == "volunteerRole" && _id == $positionId][0]{
    _id,
    active,
    capacity,
    "roleName": role->name,
    "roleIcon": role->icon,
    "assignmentCardinality": role->assignmentCardinality,
    "positionTitle": coalesce(role->name, "Volunteer position"),
    "eventName": motorsportRegEvent.name,
    "slug": slug.current
  }`;
  return sanityFetchQuery(query, { positionId });
};

const getPublicPositionStatus = async (positionId) => {
  const normalizedPositionId = normalizeText(positionId);
  if (!normalizedPositionId) return null;
  const query = `*[_type == "volunteerRole" && _id == $positionId][0]{
    _id,
    active,
    "assignedVolunteerCount": count(assignedVolunteers[defined(_ref)]),
    "eventId": motorsportRegEvent.eventId,
    "eventName": motorsportRegEvent.name,
    "eventStart": motorsportRegEvent.start,
    "eventUrl": motorsportRegEvent.url,
    "eventVenueName": motorsportRegEvent.venueName,
    "eventVenueCity": motorsportRegEvent.venueCity,
    "eventVenueRegion": motorsportRegEvent.venueRegion
  }`;
  const result = await sanityFetchQuery(query, {
    positionId: normalizedPositionId,
  });
  if (!result?._id) return null;
  const assignedVolunteerCount = Number(result?.assignedVolunteerCount);
  const hasAssignedVolunteer =
    Number.isFinite(assignedVolunteerCount) && assignedVolunteerCount > 0;
  const hasAssignedEvent = Boolean(
    result?.eventId ||
      result?.eventName ||
      result?.eventStart ||
      result?.eventUrl ||
      result?.eventVenueName ||
      result?.eventVenueCity ||
      result?.eventVenueRegion
  );
  return {
    positionId: result._id,
    active: typeof result?.active === "boolean" ? result.active : null,
    assignedVolunteerCount: hasAssignedVolunteer ? assignedVolunteerCount : 0,
    hasAssignedVolunteer,
    hasAssignedEvent,
    filled:
      !hasAssignedEvent &&
      ((typeof result?.active === "boolean" && result.active === false) ||
        hasAssignedVolunteer),
  };
};

const getHeaderValue = (event, key) => {
  const headers = event?.headers || {};
  const direct =
    headers[key] || headers[key.toLowerCase()] || headers[key.toUpperCase()];
  if (direct) return String(direct);
  const match = Object.keys(headers).find(
    (headerKey) => String(headerKey).toLowerCase() === String(key).toLowerCase()
  );
  if (!match) return "";
  return String(headers[match] || "");
};

const getAuthorizationToken = (event) => {
  const raw = normalizeText(getHeaderValue(event, "authorization"));
  if (!raw) return "";
  const bearerMatch = raw.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch?.[1]) {
    return normalizeText(bearerMatch[1]);
  }
  return raw;
};

const canTransitionStatus = (fromStatus, toStatus) => {
  const from = normalizeStatus(fromStatus);
  const to = normalizeStatus(toStatus);
  return (STATUS_TRANSITIONS[from] || []).includes(to);
};

const toCapacityNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const shouldAutoDeactivatePositionOnAssign = (positionContext) => {
  const assignmentCardinality = normalizeStatus(
    positionContext?.assignmentCardinality
  );
  if (assignmentCardinality === "singleton") return true;
  const roleName = normalizeStatus(positionContext?.roleName);
  if (!roleName) return false;
  // Legacy fallback while older roles are migrated to assignmentCardinality.
  return roleName.includes("chairperson") || roleName.includes("coordinator");
};

const getEffectiveCapacityLimit = (positionContext) => {
  const explicitCapacity = toCapacityNumber(positionContext?.capacity);
  if (explicitCapacity) return explicitCapacity;
  if (shouldAutoDeactivatePositionOnAssign(positionContext)) return 1;
  return null;
};

const countAssignedApplicationsForPosition = async (positionId) => {
  if (!normalizeText(positionId)) return 0;
  const query = `count(*[_type == "volunteerApplication" && position._ref == $positionId && status == "assigned" && isActive == true])`;
  const count = await sanityFetchQuery(query, { positionId });
  return Number.isFinite(Number(count)) ? Number(count) : 0;
};

const createVolunteerApplication = async ({
  positionId,
  firstName,
  lastName,
  email,
  phone,
  notes,
  referral,
  hasPerformedRoleBefore,
}) => {
  const nowIso = new Date().toISOString();
  const applicantName = `${normalizeText(firstName)} ${normalizeText(
    lastName
  )}`.trim();

  const applicationId = buildApplicationId();
  const doc = {
    _type: "volunteerApplication",
    applicationId,
    position: { _type: "reference", _ref: positionId },
    applicantName,
    applicantEmail: email,
    applicantPhone: normalizeText(phone) || null,
    referral: normalizeText(referral) || null,
    hasPerformedRoleBefore:
      typeof hasPerformedRoleBefore === "boolean"
        ? hasPerformedRoleBefore
        : null,
    notes: normalizeText(notes) || null,
    status: "submitted",
    isActive: true,
    submittedAt: nowIso,
    lastActionAt: nowIso,
    lastActionBy: "api:apply",
  };

  const result = await sanityMutate([{ create: doc }]);
  const created = result?.results?.[0];
  return {
    applicationId,
    sanityId: created?.id || null,
    submittedAt: nowIso,
  };
};

const splitApplicantName = (value) => {
  const fullName = normalizeText(value);
  if (!fullName) {
    return { firstName: "", lastName: "" };
  }
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] || "", lastName: "" };
  }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.slice(-1).join(" "),
  };
};

const parseApplicantNotes = (value) => {
  const raw = normalizeText(value);
  const parsed = {
    notes: "",
    referral: "",
    hasPerformedRoleBefore: null,
  };
  if (!raw) return parsed;
  const blocks = raw.split(/\n\s*\n/);
  blocks.forEach((block) => {
    const trimmed = normalizeText(block);
    if (/^Notes:\s*/i.test(trimmed)) {
      parsed.notes = trimmed.replace(/^Notes:\s*/i, "");
      return;
    }
    if (/^Referral:\s*/i.test(trimmed)) {
      parsed.referral = trimmed.replace(/^Referral:\s*/i, "");
      return;
    }
    if (/^Performed role before:\s*/i.test(trimmed)) {
      const answer = trimmed.replace(/^Performed role before:\s*/i, "");
      if (/^yes$/i.test(answer)) parsed.hasPerformedRoleBefore = true;
      if (/^no$/i.test(answer)) parsed.hasPerformedRoleBefore = false;
    }
  });
  return parsed;
};

const buildManageApplicationUrl = ({
  positionSlug,
  positionId,
  applicationId,
  intent = "manage",
}) => {
  const siteUrl = normalizeText(process.env.SITE_BASE_URL || "");
  if (!siteUrl || !positionSlug || !positionId || !applicationId) return "";
  const trimmedSiteUrl = siteUrl.replace(/\/+$/, "");
  const normalizedPath = String(positionSlug || "").startsWith("/")
    ? String(positionSlug || "")
    : `/${String(positionSlug || "")}`;
  const params = new URLSearchParams({
    manage: "1",
    applicationId,
    positionId,
  });
  if (intent === "withdraw") {
    params.set("intent", "withdraw");
  }
  return `${trimmedSiteUrl}${normalizedPath}?${params.toString()}`;
};

const buildApiBaseUrl = (event) => {
  const configured = normalizeText(
    process.env.VOLUNTEER_APPS_API_BASE_URL || ""
  ).replace(/\/+$/, "");
  if (configured) return configured;
  const headers = event?.headers || {};
  const host =
    headers.Host || headers.host || event?.requestContext?.domainName || "";
  const proto =
    headers["X-Forwarded-Proto"] || headers["x-forwarded-proto"] || "https";
  const stage = normalizeText(event?.requestContext?.stage || "");
  if (!host) return "";
  return `${proto}://${host}${stage ? `/${stage}` : ""}`;
};

const buildAdminActionUrl = ({
  apiBaseUrl,
  applicationId,
  positionId,
  action,
  token,
}) => {
  const base = normalizeText(apiBaseUrl).replace(/\/+$/, "");
  const appId = normalizeText(applicationId);
  const nextAction = normalizeText(action).toLowerCase();
  const actionToken = normalizeText(token);
  if (!base || !appId || !nextAction || !actionToken) return "";
  const params = new URLSearchParams({
    applicationId: appId,
    action: nextAction,
    token: actionToken,
  });
  if (normalizeText(positionId)) {
    params.set("positionId", normalizeText(positionId));
  }
  return `${base}/applications/admin-action?${params.toString()}`;
};

const buildStudioApplicationEditUrl = (sanityId) => {
  const docId = normalizeText(sanityId);
  if (!docId) return "";
  const studioBaseUrl = normalizeText(
    process.env.SANITY_STUDIO_BASE_URL || "https://bmwccapsr.sanity.studio"
  ).replace(/\/+$/, "");
  return `${studioBaseUrl}/intent/edit/id=${encodeURIComponent(
    docId
  )};type=volunteerApplication`;
};

const findApplicationById = async (applicationId, positionId = "") => {
  const query = `*[_type == "volunteerApplication" && applicationId == $applicationId && (!defined($positionId) || $positionId == "" || position._ref == $positionId)][0]{
    _id,
    _rev,
    applicationId,
    "positionId": position._ref,
    status,
    isActive,
    _updatedAt,
    applicantName,
    applicantEmail,
    applicantPhone,
    applicantNotes,
    notes,
    referral,
    hasPerformedRoleBefore,
    submittedAt,
    assignedAt,
    deniedAt,
    withdrawnAt,
    lastActionAt,
    lastActionBy,
    rejectedReasonPublic,
    rejectedReasonInternal,
    "positionTitle": coalesce(position->role->name, "Volunteer position"),
    "roleIcon": position->role->icon,
    "eventName": position->motorsportRegEvent.name,
    "positionSlug": position->slug.current,
    "pointValue": position->role->pointValue,
    "assignedVolunteerIds": position->assignedVolunteers[]._ref
  }`;
  return sanityFetchQuery(query, {
    applicationId,
    positionId: normalizeText(positionId),
  });
};

const findApplicationBySanityId = async (sanityId) => {
  const normalizedSanityId = normalizeText(sanityId);
  if (!normalizedSanityId) return null;
  const query = `*[_type == "volunteerApplication" && _id == $sanityId][0]{
    _id,
    _rev,
    applicationId,
    "positionId": position._ref,
    status,
    isActive,
    _updatedAt,
    applicantName,
    applicantEmail,
    applicantPhone,
    applicantNotes,
    notes,
    referral,
    hasPerformedRoleBefore,
    submittedAt,
    assignedAt,
    deniedAt,
    withdrawnAt,
    lastActionAt,
    lastActionBy,
    rejectedReasonPublic,
    rejectedReasonInternal,
    "positionTitle": coalesce(position->role->name, "Volunteer position"),
    "roleIcon": position->role->icon,
    "eventName": position->motorsportRegEvent.name,
    "positionSlug": position->slug.current,
    "pointValue": position->role->pointValue,
    "assignedVolunteerIds": position->assignedVolunteers[]._ref
  }`;
  return sanityFetchQuery(query, { sanityId: normalizedSanityId });
};

const updateVolunteerApplication = async ({
  sanityId,
  firstName,
  lastName,
  email,
  phone,
  notes,
  referral,
  hasPerformedRoleBefore,
}) => {
  const applicantName = `${normalizeText(firstName)} ${normalizeText(
    lastName
  )}`.trim();
  const patch = {
    applicantName,
    applicantEmail: normalizeEmail(email),
    applicantPhone: normalizeText(phone) || null,
    notes: normalizeText(notes) || null,
    referral: normalizeText(referral) || null,
    hasPerformedRoleBefore:
      typeof hasPerformedRoleBefore === "boolean"
        ? hasPerformedRoleBefore
        : null,
    lastActionAt: new Date().toISOString(),
    lastActionBy: "api:update",
  };

  await sanityMutate([
    {
      patch: {
        id: sanityId,
        set: patch,
      },
    },
  ]);
};

const sendEmail = async ({ to, subject, textBody }) => {
  const { source, replyToAddresses } = await getResolvedEmailRuntimeSettings();
  if (!source || !to || !subject || !textBody) return;
  const region = process.env.SES_REGION || awsRegion;
  const ses = new SESClient({ region });
  await ses.send(
    new SendEmailCommand({
      Source: source,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Text: { Data: textBody, Charset: "UTF-8" },
        },
      },
      ...(replyToAddresses.length > 0
        ? { ReplyToAddresses: replyToAddresses }
        : {}),
    })
  );
};

const sendTemplatedEmail = async ({
  to,
  templateName,
  templateData,
  fallbackSubject,
  fallbackTextBody,
}) => {
  const { source, replyToAddresses } = await getResolvedEmailRuntimeSettings();
  if (!source || !to) return;
  const region = process.env.SES_REGION || awsRegion;
  const ses = new SESClient({ region });
  const resolvedTemplateName = normalizeText(templateName);
  if (!resolvedTemplateName) {
    if (fallbackSubject && fallbackTextBody) {
      await sendEmail({
        to,
        subject: fallbackSubject,
        textBody: fallbackTextBody,
      });
    }
    return;
  }

  try {
    await ses.send(
      new SendTemplatedEmailCommand({
        Source: source,
        Destination: { ToAddresses: [to] },
        Template: resolvedTemplateName,
        TemplateData: JSON.stringify(templateData || {}),
        ...(replyToAddresses.length > 0
          ? { ReplyToAddresses: replyToAddresses }
          : {}),
      })
    );
  } catch (error) {
    if (fallbackSubject && fallbackTextBody) {
      await sendEmail({
        to,
        subject: fallbackSubject,
        textBody: fallbackTextBody,
      });
      return;
    }
    throw error;
  }
};

const notifyApplicantAndStaff = async ({
  apiBaseUrl,
  positionId,
  sanityId,
  applicantEmail,
  applicantName,
  applicationId,
  positionTitle,
  roleIconUrl,
  eventName,
  manageUrl,
  withdrawUrl,
  applicantReferral = "",
  applicantNotes = "",
  applicantHasPerformedRoleBefore,
}) => {
  const runtimeSettings = await getResolvedEmailRuntimeSettings();
  const staffEmails = runtimeSettings.staffNotificationAddresses;
  const shouldSendApplicantSubmissionConfirmation =
    runtimeSettings.lifecycle.sendApplicantSubmissionConfirmation !== false;
  const shouldSendStaffNotification =
    runtimeSettings.lifecycle.sendStaffNotificationOnNewApplication !== false;
  const pendingApplicationsUrl = normalizeText(
    process.env.SANITY_PENDING_APPLICATIONS_URL ||
      "https://bmwccapsr.sanity.studio/structure/volunteers;pendingApplications"
  );
  const studioEditUrl = buildStudioApplicationEditUrl(sanityId);
  const adminActionToken = await getAdminActionToken();
  const approveUrl =
    buildAdminActionUrl({
      apiBaseUrl,
      applicationId,
      positionId,
      action: "approve",
      token: adminActionToken,
    }) || studioEditUrl;
  const denyUrl =
    buildAdminActionUrl({
      apiBaseUrl,
      applicationId,
      positionId,
      action: "deny",
      token: adminActionToken,
    }) || studioEditUrl;

  const eventLine = eventName ? `Event: ${eventName}\n` : "";
  const eventLinePlain = eventName ? `Event: ${eventName}` : "";
  const applicantSubject = `Application received: ${positionTitle}`;
  const applicantBody = [
    `Hi ${applicantName || "there"},`,
    "",
    `Thanks for applying for "${positionTitle}".`,
    eventLine ? eventLine.trim() : null,
    `Application ID: ${applicationId}`,
    manageUrl ? `Manage your application: ${manageUrl}` : null,
    withdrawUrl ? `Withdraw your application: ${withdrawUrl}` : null,
    "",
    "We have received your submission and the volunteer team will review it.",
  ]
    .filter(Boolean)
    .join("\n");

  const staffSubject = `New volunteer application: ${positionTitle}`;
  const staffBody = [
    "A new volunteer application was submitted.",
    "",
    `Position: ${positionTitle}`,
    eventLine ? eventLine.trim() : null,
    `Applicant: ${applicantName} <${applicantEmail}>`,
    `Application ID: ${applicationId}`,
    pendingApplicationsUrl
      ? `Pending applications: ${pendingApplicationsUrl}`
      : null,
    approveUrl ? `Approve (open in Studio): ${approveUrl}` : null,
    denyUrl ? `Deny (open in Studio): ${denyUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const applicantTemplateName =
    process.env.SES_TEMPLATE_APPLICANT_SUBMITTED || "";
  const staffTemplateName =
    process.env.SES_TEMPLATE_STAFF_NEW_APPLICATION || "";
  const normalizedReferral = normalizeText(applicantReferral || "");
  const normalizedNotes = normalizeText(applicantNotes || "");
  const applicantHasPerformedRoleBeforeLabel =
    typeof applicantHasPerformedRoleBefore === "boolean"
      ? applicantHasPerformedRoleBefore
        ? "Yes"
        : "No"
      : "Unknown";
  const applicantTemplateData = {
    applicantName: applicantName || "there",
    positionTitle,
    roleIconUrl: normalizeText(roleIconUrl) || getRoleIconUrl("flag-checkered"),
    eventLine: eventLinePlain || "",
    applicationId,
    manageUrl: manageUrl || "",
    withdrawUrl: withdrawUrl || "",
    manageLine: manageUrl ? `Manage your application: ${manageUrl}` : "",
    withdrawLine: withdrawUrl
      ? `Withdraw your application: ${withdrawUrl}`
      : "",
    applicantReferral: normalizedReferral || "None",
    applicantNotes: normalizedNotes || "None",
    applicantHasPerformedRoleBefore: applicantHasPerformedRoleBeforeLabel,
    showManageButton: Boolean(manageUrl),
  };
  const staffTemplateData = {
    applicantName: applicantName || "",
    applicantEmail: applicantEmail || "",
    positionTitle,
    eventLine: eventLinePlain || "",
    applicationId,
    pendingApplicationsUrl: pendingApplicationsUrl || "",
    approveUrl: approveUrl || "",
    denyUrl: denyUrl || "",
    applicantReferral: normalizedReferral || "None",
    applicantNotes: normalizedNotes || "None",
    applicantHasPerformedRoleBefore: applicantHasPerformedRoleBeforeLabel,
  };

  const tasks = [];
  if (shouldSendApplicantSubmissionConfirmation) {
    tasks.push(
      sendTemplatedEmail({
        to: applicantEmail,
        templateName: applicantTemplateName,
        templateData: applicantTemplateData,
        fallbackSubject: applicantSubject,
        fallbackTextBody: applicantBody,
      })
    );
  }
  if (shouldSendStaffNotification) {
    staffEmails.forEach((to) => {
      tasks.push(
        sendTemplatedEmail({
          to,
          templateName: staffTemplateName,
          templateData: staffTemplateData,
          fallbackSubject: staffSubject,
          fallbackTextBody: staffBody,
        })
      );
    });
  }

  const results = await Promise.allSettled(tasks);
  return {
    attempted: tasks.length,
    failed: results.filter((result) => result.status === "rejected").length,
  };
};

const notifyApplicantUpdateSuccess = async ({
  applicantEmail,
  applicantName,
  applicationId,
  positionTitle,
  roleIconUrl,
  eventName,
  manageUrl,
  withdrawUrl,
}) => {
  if (!applicantEmail) {
    return { attempted: 0, failed: 0 };
  }
  const runtimeSettings = await getResolvedEmailRuntimeSettings();
  if (runtimeSettings.lifecycle.sendApplicantUpdateConfirmation === false) {
    return { attempted: 0, failed: 0 };
  }

  const eventLine = eventName ? `Event: ${eventName}\n` : "";
  const eventLinePlain = eventName ? `Event: ${eventName}` : "";
  const subject = `Application updated: ${positionTitle}`;
  const body = [
    `Hi ${applicantName || "there"},`,
    "",
    `Your application was successfully updated for "${positionTitle}".`,
    eventLine ? eventLine.trim() : null,
    `Application ID: ${applicationId}`,
    manageUrl ? `Manage your application: ${manageUrl}` : null,
    withdrawUrl ? `Withdraw your application: ${withdrawUrl}` : null,
    "",
    "Your latest details are now saved.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await sendTemplatedEmail({
      to: applicantEmail,
      templateName: process.env.SES_TEMPLATE_APPLICANT_UPDATED || "",
      templateData: {
        applicantName: applicantName || "there",
        positionTitle,
        roleIconUrl:
          normalizeText(roleIconUrl) || getRoleIconUrl("flag-checkered"),
        eventLine: eventLinePlain || "",
        applicationId,
        manageUrl: manageUrl || "",
        withdrawUrl: withdrawUrl || "",
        manageLine: manageUrl ? `Manage your application: ${manageUrl}` : "",
        withdrawLine: withdrawUrl
          ? `Withdraw your application: ${withdrawUrl}`
          : "",
      },
      fallbackSubject: subject,
      fallbackTextBody: body,
    });
    return { attempted: 1, failed: 0 };
  } catch (_error) {
    return { attempted: 1, failed: 1 };
  }
};

const notifyApplicantTransition = async ({
  application,
  targetStatus,
  positionContext,
  rejectedReasonPublic,
}) => {
  const applicantEmail = normalizeEmail(application?.applicantEmail || "");
  if (!isValidEmail(applicantEmail)) {
    return { attempted: 0, failed: 0 };
  }
  const runtimeSettings = await getResolvedEmailRuntimeSettings();

  const applicantName =
    normalizeText(application?.applicantName || "") || "there";
  const applicationId = normalizeText(application?.applicationId || "");
  const positionId = normalizeText(application?.positionId || "");
  const positionTitle =
    normalizeText(positionContext?.positionTitle) || "Volunteer position";
  const roleIconUrl =
    normalizeText(positionContext?.roleIconUrl) ||
    getRoleIconUrl(
      positionContext?.roleIcon || application?.roleIcon || "flag-checkered"
    );
  const eventName = normalizeText(positionContext?.eventName || "");
  const manageUrl = buildManageApplicationUrl({
    positionSlug: positionContext?.slug || application?.positionSlug || "",
    positionId,
    applicationId,
  });
  const withdrawUrl = buildManageApplicationUrl({
    positionSlug: positionContext?.slug || application?.positionSlug || "",
    positionId,
    applicationId,
    intent: "withdraw",
  });

  const eventLinePlain = eventName ? `Event: ${eventName}` : "";
  const eventLine = eventName ? `Event: ${eventName}\n` : "";
  const baseLines = [
    `Hi ${applicantName},`,
    "",
    eventLine || null,
    `Application ID: ${applicationId}`,
    manageUrl ? `Manage your application: ${manageUrl}` : null,
    withdrawUrl ? `Withdraw your application: ${withdrawUrl}` : null,
    "",
  ];

  let subject = "";
  let transitionHeading = "";
  const transitionLines = [];
  if (targetStatus === "assigned") {
    if (runtimeSettings.lifecycle.sendApplicantApprovalEmail === false) {
      return { attempted: 0, failed: 0 };
    }
    subject = `Application approved: ${positionTitle}`;
    transitionHeading = "Application approved";
    transitionLines.push(
      `Your application for "${positionTitle}" has been approved and assigned.`
    );
  } else if (targetStatus === "denied") {
    if (runtimeSettings.lifecycle.sendApplicantDeclineEmail === false) {
      return { attempted: 0, failed: 0 };
    }
    subject = `Application update: ${positionTitle}`;
    transitionHeading = "Application update";
    transitionLines.push(
      `Your application for "${positionTitle}" was not approved.`
    );
    transitionLines.push(
      `Reason provided: ${
        normalizeText(rejectedReasonPublic) || "No reason provided."
      }`
    );
  } else if (targetStatus === "withdrawn") {
    if (runtimeSettings.lifecycle.sendApplicantWithdrawalEmail === false) {
      return { attempted: 0, failed: 0 };
    }
    subject = `Application withdrawn: ${positionTitle}`;
    transitionHeading = "Application withdrawn";
    transitionLines.push(
      `Your application for ${positionTitle} has been marked as withdrawn.`
    );
  } else {
    return { attempted: 0, failed: 0 };
  }

  const transitionLine = transitionLines.join(" ");
  const transitionFooter =
    targetStatus === "withdrawn"
      ? "You can reapply at any time if your circumstances change."
      : "We’ll reach out if we need anything else.";

  const transitionTemplateName =
    process.env.SES_TEMPLATE_APPLICANT_TRANSITION || "";

  const showManageButton = targetStatus !== "withdrawn" && Boolean(manageUrl);
  const templateData = {
    applicantName: applicantName || "there",
    positionTitle,
    roleIconUrl,
    eventLine: eventLinePlain || "",
    applicationId,
    manageUrl: manageUrl || "",
    withdrawUrl: withdrawUrl || "",
    manageLine: manageUrl ? `Manage your application: ${manageUrl}` : "",
    withdrawLine: withdrawUrl
      ? `Withdraw your application: ${withdrawUrl}`
      : "",
    transitionHeading,
    transitionLine,
    transitionFooter,
    showManageButton,
  };

  if (transitionTemplateName) {
    try {
      await sendTemplatedEmail({
        to: applicantEmail,
        templateName: transitionTemplateName,
        templateData,
        fallbackSubject: subject,
        fallbackTextBody: [...baseLines, ...transitionLines, transitionFooter]
          .filter(Boolean)
          .join("\n"),
      });
      return { attempted: 1, failed: 0 };
    } catch (_error) {
      return { attempted: 1, failed: 1 };
    }
  }

  const textBody = [...baseLines, ...transitionLines, transitionFooter]
    .filter(Boolean)
    .join("\n");
  try {
    await sendEmail({
      to: applicantEmail,
      subject,
      textBody,
    });
    return { attempted: 1, failed: 0 };
  } catch (_error) {
    return { attempted: 1, failed: 1 };
  }
};

const deriveLifecycleEventType = (application) => {
  const status = normalizeStatus(application?.status);
  if (status === "assigned") return "assigned";
  if (status === "denied") return "denied";
  if (status === "withdrawn") return "withdrawn";
  if (status === "submitted") {
    const submittedAt = normalizeText(application?.submittedAt || "");
    const lastActionAt = normalizeText(application?.lastActionAt || "");
    const lastActionBy = normalizeStatus(application?.lastActionBy || "");
    if (
      lastActionBy.includes("update") ||
      (lastActionAt && submittedAt && lastActionAt !== submittedAt)
    ) {
      return "updated";
    }
    return "submitted";
  }
  return "";
};

const getLifecycleEventTimestamp = (application, eventType) => {
  const event = normalizeStatus(eventType);
  if (event === "submitted") {
    return normalizeText(
      application?.submittedAt || application?.lastActionAt || ""
    );
  }
  if (event === "updated") {
    return normalizeText(
      application?.lastActionAt || application?._updatedAt || ""
    );
  }
  if (event === "assigned") {
    return normalizeText(
      application?.assignedAt || application?.lastActionAt || ""
    );
  }
  if (event === "denied") {
    return normalizeText(
      application?.deniedAt || application?.lastActionAt || ""
    );
  }
  if (event === "withdrawn") {
    return normalizeText(
      application?.withdrawnAt || application?.lastActionAt || ""
    );
  }
  return normalizeText(
    application?.lastActionAt || application?._updatedAt || ""
  );
};

const toDynamoString = (value, fallback = "") => ({
  S: normalizeText(value || fallback),
});

const toDynamoNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return { N: String(parsed) };
};

const recordApplicationAuditEvent = async ({
  application,
  eventType,
  eventAt,
  source,
}) => {
  if (!applicationEventsTableName) {
    return { written: false, reason: "table_not_configured" };
  }
  const applicationId = normalizeText(application?.applicationId);
  const positionId = normalizeText(application?.positionId);
  const applicantEmail = normalizeEmail(application?.applicantEmail);
  if (!applicationId || !eventType || !eventAt) {
    return { written: false, reason: "missing_required_fields" };
  }

  return conditionalPutDynamoItem({
    tableName: applicationEventsTableName,
    item: {
      pk: toDynamoString(`APP#${applicationId}`),
      sk: toDynamoString(`EVENT#${eventType}#${eventAt}`),
      positionPk: toDynamoString(`POSITION#${positionId || "none"}`),
      applicantPk: toDynamoString(`EMAIL#${applicantEmail || "unknown"}`),
      eventTypePk: toDynamoString(`TYPE#${eventType}`),
      eventAt: toDynamoString(eventAt),
      eventType: toDynamoString(eventType),
      source: toDynamoString(source || "unknown"),
      applicationId: toDynamoString(applicationId),
      sanityId: toDynamoString(application?._id || ""),
      status: toDynamoString(application?.status || ""),
      positionId: toDynamoString(positionId || ""),
      positionTitle: toDynamoString(application?.positionTitle || ""),
      eventName: toDynamoString(application?.eventName || ""),
      applicantEmail: toDynamoString(applicantEmail || ""),
      applicantName: toDynamoString(application?.applicantName || ""),
      rejectedReasonPublic: toDynamoString(
        application?.rejectedReasonPublic || ""
      ),
      createdAt: toDynamoString(new Date().toISOString()),
    },
  });
};

const writeProvisionalPointsLedger = async ({
  application,
  eventAt,
  source,
}) => {
  if (!pointsLedgerTableName) {
    return { written: false, reason: "table_not_configured" };
  }

  const pointValue = Number(application?.pointValue || 0);
  const applicantEmail = normalizeEmail(application?.applicantEmail);
  const applicationId = normalizeText(application?.applicationId);
  const positionId = normalizeText(application?.positionId);
  if (!applicantEmail || !applicationId || !positionId || pointValue <= 0) {
    return { written: false, reason: "not_applicable" };
  }

  return conditionalPutDynamoItem({
    tableName: pointsLedgerTableName,
    partitionKeyName: "applicantPk",
    sortKeyName: "entrySk",
    item: {
      applicantPk: toDynamoString(`EMAIL#${applicantEmail}`),
      entrySk: toDynamoString(`PROVISIONAL#APP#${applicationId}`),
      positionPk: toDynamoString(`POSITION#${positionId}`),
      statusPk: toDynamoString("STATUS#PROVISIONAL"),
      createdAt: toDynamoString(eventAt || new Date().toISOString()),
      status: toDynamoString("provisional"),
      source: toDynamoString(source || "unknown"),
      applicationId: toDynamoString(applicationId),
      positionId: toDynamoString(positionId),
      positionTitle: toDynamoString(application?.positionTitle || ""),
      points: toDynamoNumber(pointValue),
    },
  });
};

const processApplicationLifecycleEvent = async ({
  application,
  source,
  apiBaseUrl,
  explicitEventType = "",
  explicitEventAt = "",
}) => {
  if (!application?._id || !application?.applicationId) {
    return {
      processed: false,
      reason: "missing_application",
      email: { attempted: 0, failed: 0 },
    };
  }

  const eventType =
    normalizeStatus(explicitEventType) || deriveLifecycleEventType(application);
  const eventAt =
    normalizeText(explicitEventAt) ||
    getLifecycleEventTimestamp(application, eventType);
  if (!eventType || !eventAt) {
    return {
      processed: false,
      reason: "missing_event_metadata",
      email: { attempted: 0, failed: 0 },
    };
  }

  const auditWrite = await recordApplicationAuditEvent({
    application,
    eventType,
    eventAt,
    source,
  });
  if (!auditWrite.written) {
    return {
      processed: false,
      reason: auditWrite.reason || "audit_skipped",
      eventType,
      eventAt,
      email: { attempted: 0, failed: 0 },
    };
  }

  const positionId = normalizeText(application?.positionId || "");
  const positionTitle =
    normalizeText(application?.positionTitle || "") || "Volunteer position";
  const roleIconUrl = getRoleIconUrl(application?.roleIcon);
  const eventName = normalizeText(application?.eventName || "");
  const positionSlug = normalizeText(application?.positionSlug || "");
  const manageUrl = buildManageApplicationUrl({
    positionSlug,
    positionId,
    applicationId: application.applicationId,
  });
  const withdrawUrl = buildManageApplicationUrl({
    positionSlug,
    positionId,
    applicationId: application.applicationId,
    intent: "withdraw",
  });

  let email = { attempted: 0, failed: 0 };
  if (eventType === "submitted") {
    email = await notifyApplicantAndStaff({
      apiBaseUrl,
      positionId,
      sanityId: application._id,
      applicantEmail: normalizeEmail(application?.applicantEmail || ""),
      applicantName: normalizeText(application?.applicantName || ""),
      applicationId: application.applicationId,
      positionTitle,
      roleIconUrl,
      eventName,
      manageUrl,
      withdrawUrl,
      applicantReferral: normalizeText(application?.referral || ""),
      applicantNotes: normalizeText(application?.notes || ""),
      applicantHasPerformedRoleBefore: application?.hasPerformedRoleBefore,
    });
  } else if (eventType === "updated") {
    email = await notifyApplicantUpdateSuccess({
      applicantEmail: normalizeEmail(application?.applicantEmail || ""),
      applicantName: normalizeText(application?.applicantName || ""),
      applicationId: application.applicationId,
      positionTitle,
      roleIconUrl,
      eventName,
      manageUrl,
      withdrawUrl,
    });
  } else if (
    eventType === "assigned" ||
    eventType === "denied" ||
    eventType === "withdrawn"
  ) {
    email = await notifyApplicantTransition({
      application,
      targetStatus: eventType,
      positionContext: {
        positionTitle,
        eventName,
        slug: positionSlug,
        roleIconUrl,
      },
      rejectedReasonPublic: application?.rejectedReasonPublic || "",
    });
  }

  let points = { written: false, reason: "not_applicable" };
  if (eventType === "assigned") {
    points = await writeProvisionalPointsLedger({
      application,
      eventAt,
      source,
    });
  }

  return {
    processed: true,
    eventType,
    eventAt,
    email,
    points,
  };
};

const transitionApplicationStatus = async ({
  applicationId,
  positionId = "",
  targetStatus,
  actorName = "api:transition",
  rejectedReasonPublic = "",
  rejectedReasonInternal = "",
  apiBaseUrl = "",
  source = "",
}) => {
  const normalizedApplicationId = normalizeText(applicationId);
  const normalizedTargetStatus = normalizeStatus(targetStatus);
  if (!normalizedApplicationId) {
    return {
      outcome: "failed",
      reason: "Missing applicationId.",
    };
  }
  if (!["assigned", "denied", "withdrawn"].includes(normalizedTargetStatus)) {
    return {
      outcome: "failed",
      reason: `Unsupported transition target: ${
        normalizedTargetStatus || "unknown"
      }.`,
    };
  }

  const existing = await findApplicationById(
    normalizedApplicationId,
    positionId
  );
  if (!existing?._id) {
    return {
      outcome: "failed",
      reason: "Application not found.",
    };
  }

  const currentStatus = normalizeStatus(existing?.status || "submitted");
  if (!canTransitionStatus(currentStatus, normalizedTargetStatus)) {
    return {
      outcome: "skipped",
      sanityId: existing._id,
      applicationId: existing.applicationId || normalizedApplicationId,
      reason: `Cannot move ${
        currentStatus || "unknown"
      } to ${normalizedTargetStatus}.`,
    };
  }

  const resolvedPositionId = normalizeText(
    positionId || existing?.positionId || ""
  );
  const positionContext = resolvedPositionId
    ? await getPositionContext(resolvedPositionId)
    : null;

  if (normalizedTargetStatus === "assigned" && resolvedPositionId) {
    const capacityLimit = getEffectiveCapacityLimit(positionContext);
    if (capacityLimit) {
      const assignedCount = await countAssignedApplicationsForPosition(
        resolvedPositionId
      );
      if (assignedCount >= capacityLimit) {
        return {
          outcome: "skipped",
          sanityId: existing._id,
          applicationId: existing.applicationId || normalizedApplicationId,
          reason: `Capacity full for ${
            normalizeText(positionContext?.positionTitle) || "this position"
          }.`,
        };
      }
    }
  }

  const nowIso = new Date().toISOString();
  const setPatch = {
    status: normalizedTargetStatus,
    isActive:
      normalizedTargetStatus === "submitted" ||
      normalizedTargetStatus === "assigned",
    lastActionAt: nowIso,
    lastActionBy: normalizeText(actorName) || "api:transition",
  };
  const timestampField = STATUS_TIMESTAMP_FIELD[normalizedTargetStatus];
  if (timestampField) {
    setPatch[timestampField] = nowIso;
  }
  if (normalizedTargetStatus === "denied") {
    setPatch.rejectedReasonPublic =
      normalizeText(rejectedReasonPublic) || "No reason provided.";
    setPatch.rejectedReasonInternal =
      normalizeText(rejectedReasonInternal) || null;
  }

  const unsetPatch = [];
  if (normalizedTargetStatus === "assigned") {
    unsetPatch.push(
      "deniedAt",
      "withdrawnAt",
      "expiredAt",
      "rejectedReasonPublic",
      "rejectedReasonInternal"
    );
  }
  if (normalizedTargetStatus === "denied") {
    unsetPatch.push("assignedAt", "withdrawnAt", "expiredAt");
  }
  if (normalizedTargetStatus === "withdrawn") {
    unsetPatch.push("assignedAt", "deniedAt", "expiredAt");
  }

  const mutations = [
    {
      patch: {
        id: existing._id,
        set: setPatch,
        ...(unsetPatch.length > 0 ? { unset: unsetPatch } : {}),
      },
    },
  ];

  if (resolvedPositionId && normalizedTargetStatus === "assigned") {
    const assignedVolunteerIds = Array.isArray(existing?.assignedVolunteerIds)
      ? existing.assignedVolunteerIds
      : [];
    if (!assignedVolunteerIds.includes(existing._id)) {
      mutations.push({
        patch: {
          id: resolvedPositionId,
          setIfMissing: { assignedVolunteers: [] },
          insert: {
            after: "assignedVolunteers[-1]",
            items: [{ _type: "reference", _ref: existing._id }],
          },
        },
      });
    }
    if (shouldAutoDeactivatePositionOnAssign(positionContext)) {
      mutations.push({
        patch: {
          id: resolvedPositionId,
          set: { active: false },
        },
      });
    }
  }

  if (
    resolvedPositionId &&
    (normalizedTargetStatus === "withdrawn" ||
      normalizedTargetStatus === "denied" ||
      normalizedTargetStatus === "expired")
  ) {
    mutations.push({
      patch: {
        id: resolvedPositionId,
        unset: [`assignedVolunteers[_ref=="${existing._id}"]`],
      },
    });
  }

  await sanityMutate(mutations);

  const refreshedApplication = await findApplicationById(
    existing.applicationId || normalizedApplicationId,
    resolvedPositionId
  );
  const applicationForSideEffects = refreshedApplication || {
    ...existing,
    applicationId: existing.applicationId || normalizedApplicationId,
    positionId: resolvedPositionId,
    status: normalizedTargetStatus,
    rejectedReasonPublic:
      normalizedTargetStatus === "denied"
        ? normalizeText(rejectedReasonPublic) || "No reason provided."
        : normalizeText(existing?.rejectedReasonPublic || ""),
    positionTitle:
      positionContext?.positionTitle || existing?.positionTitle || "",
    roleIcon: positionContext?.roleIcon || existing?.roleIcon || "",
    eventName: positionContext?.eventName || existing?.eventName || "",
    positionSlug: positionContext?.slug || existing?.positionSlug || "",
    assignedAt:
      normalizedTargetStatus === "assigned"
        ? nowIso
        : normalizeText(existing?.assignedAt || ""),
    deniedAt:
      normalizedTargetStatus === "denied"
        ? nowIso
        : normalizeText(existing?.deniedAt || ""),
    withdrawnAt:
      normalizedTargetStatus === "withdrawn"
        ? nowIso
        : normalizeText(existing?.withdrawnAt || ""),
    lastActionAt: nowIso,
  };
  const lifecycleResult = await processApplicationLifecycleEvent({
    application: applicationForSideEffects,
    source: source || normalizeText(actorName) || "api:transition",
    apiBaseUrl,
    explicitEventType: normalizedTargetStatus,
    explicitEventAt: nowIso,
  });

  return {
    outcome: "updated",
    sanityId: existing._id,
    applicationId: existing.applicationId || normalizedApplicationId,
    status: normalizedTargetStatus,
    email: lifecycleResult?.email || { attempted: 0, failed: 0 },
    lifecycle: lifecycleResult,
  };
};

const handleCreateApplication = async (event) => {
  const body = safeParseBody(event);
  if (body === null) {
    return json(400, { ok: false, error: "Invalid JSON payload." });
  }

  const positionId = normalizeText(body?.positionId);
  const firstName = normalizeText(body?.firstName);
  const lastName = normalizeText(body?.lastName);
  const email = normalizeEmail(body?.email);
  const phone = normalizeText(body?.phone);
  const notes = normalizeText(body?.notes);
  const referral = normalizeText(body?.referral);
  const hasPerformedRoleBefore = body?.hasPerformedRoleBefore;

  if (!positionId || !firstName || !lastName || !email) {
    return json(400, {
      ok: false,
      error: "positionId, firstName, lastName, and email are required.",
    });
  }
  if (!isValidEmail(email)) {
    return json(400, {
      ok: false,
      error: "A valid email address is required.",
    });
  }

  try {
    const apiBaseUrl = buildApiBaseUrl(event);
    const existing = await findExistingActiveApplication(positionId, email);
    if (existing?._id) {
      const position = await getPositionContext(positionId);
      const manageUrl = buildManageApplicationUrl({
        positionSlug: position?.slug || "",
        positionId,
        applicationId: existing.applicationId || "",
      });
      return json(200, {
        ok: true,
        deduped: true,
        message:
          "An active application already exists for this position and email.",
        application: {
          id: existing._id,
          applicationId: existing.applicationId || null,
          status: existing.status || null,
          submittedAt: existing.submittedAt || null,
          manageUrl: manageUrl || null,
        },
      });
    }

    const position = await getPositionContext(positionId);
    const positionTitle = position?.positionTitle || "Volunteer position";
    const created = await createVolunteerApplication({
      positionId,
      firstName,
      lastName,
      email,
      phone,
      notes,
      referral,
      hasPerformedRoleBefore,
    });

    const manageUrl = buildManageApplicationUrl({
      positionSlug: position?.slug || "",
      positionId,
      applicationId: created.applicationId,
    });
    const withdrawUrl = buildManageApplicationUrl({
      positionSlug: position?.slug || "",
      positionId,
      applicationId: created.applicationId,
      intent: "withdraw",
    });

    const createdApplication = await findApplicationById(
      created.applicationId,
      positionId
    );
    const lifecycleResult = await processApplicationLifecycleEvent({
      application: createdApplication || {
        _id: created.sanityId,
        applicationId: created.applicationId,
        positionId,
        positionTitle,
        roleIcon: position?.roleIcon || "",
        eventName: position?.eventName || "",
        positionSlug: position?.slug || "",
        applicantEmail: email,
        applicantName: `${firstName} ${lastName}`.trim(),
        status: "submitted",
        submittedAt: created.submittedAt || new Date().toISOString(),
      },
      source: "api:apply",
      apiBaseUrl,
      explicitEventType: "submitted",
      explicitEventAt: created.submittedAt || "",
    });

    return json(201, {
      ok: true,
      deduped: false,
      application: {
        id: created.sanityId,
        applicationId: created.applicationId,
        status: "submitted",
        submittedAt: created.submittedAt || null,
        manageUrl: manageUrl || null,
        withdrawUrl: withdrawUrl || null,
      },
      email: lifecycleResult?.email || { attempted: 0, failed: 0 },
      lifecycle: lifecycleResult,
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: "Failed to create application.",
      details: error?.message || "Unknown error",
    });
  }
};

const handleApplicationActions = async (event) => {
  const body = safeParseBody(event);
  if (body === null) {
    return json(400, { ok: false, error: "Invalid JSON payload." });
  }

  const action = normalizeText(body?.action).toLowerCase();
  if (action === "load") {
    const applicationId = normalizeText(body?.applicationId);
    const positionId = normalizeText(body?.positionId);
    if (!applicationId) {
      return json(400, {
        ok: false,
        error: "applicationId is required for load action.",
      });
    }
    try {
      const existing = await findApplicationById(applicationId, positionId);
      if (!existing?._id) {
        return json(404, {
          ok: false,
          error: "Application not found.",
        });
      }
      const splitName = splitApplicantName(existing?.applicantName || "");
      const parsedNotes = parseApplicantNotes(existing?.applicantNotes || "");
      return json(200, {
        ok: true,
        action: "load",
        application: {
          id: existing._id,
          applicationId: existing.applicationId || applicationId,
          status: existing.status || null,
          submittedAt: existing.submittedAt || null,
          rejectedReasonPublic: normalizeText(
            existing?.rejectedReasonPublic || ""
          ),
          rejectedReasonInternal: normalizeText(
            existing?.rejectedReasonInternal || ""
          ),
          firstName: splitName.firstName || "",
          lastName: splitName.lastName || "",
          email: normalizeEmail(existing?.applicantEmail || ""),
          phone: normalizeText(existing?.applicantPhone || ""),
          notes:
            normalizeText(existing?.notes || "") || parsedNotes.notes || "",
          referral:
            normalizeText(existing?.referral || "") ||
            parsedNotes.referral ||
            "",
          hasPerformedRoleBefore:
            typeof existing?.hasPerformedRoleBefore === "boolean"
              ? existing.hasPerformedRoleBefore
              : parsedNotes.hasPerformedRoleBefore,
        },
      });
    } catch (error) {
      return json(500, {
        ok: false,
        error: "Failed to load application.",
        details: error?.message || "Unknown error",
      });
    }
  }

  if (action === "transition") {
    let expectedToken = "";
    try {
      expectedToken = await getAdminActionToken();
    } catch (error) {
      return json(500, {
        ok: false,
        error: "Unable to load admin transition token.",
        details: error?.message || "Unknown secret error",
      });
    }
    if (!expectedToken) {
      return json(500, {
        ok: false,
        error: "Admin transition token is not configured.",
      });
    }
    const providedToken = getAuthorizationToken(event);
    if (!providedToken || providedToken !== expectedToken) {
      return json(403, {
        ok: false,
        error: "Unauthorized transition request.",
      });
    }

    const targetStatus = normalizeStatus(body?.targetStatus);
    const actorName = normalizeText(body?.actorName) || "api:studio";
    const rejectedReasonPublic = normalizeText(body?.rejectedReasonPublic);
    const rejectedReasonInternal = normalizeText(body?.rejectedReasonInternal);
    const positionId = normalizeText(body?.positionId || "");
    const applicationIds = Array.isArray(body?.applicationIds)
      ? body.applicationIds.map((value) => normalizeText(value)).filter(Boolean)
      : [];

    if (!["assigned", "denied", "withdrawn"].includes(targetStatus)) {
      return json(400, {
        ok: false,
        error: "targetStatus must be one of: assigned, denied, withdrawn.",
      });
    }
    if (applicationIds.length === 0) {
      return json(400, {
        ok: false,
        error: "applicationIds must contain at least one applicationId.",
      });
    }
    const runtimeSettings = await getResolvedEmailRuntimeSettings();
    const requirePublicReasonOnDecline =
      runtimeSettings.lifecycle.requirePublicReasonOnDecline !== false;
    if (
      targetStatus === "denied" &&
      requirePublicReasonOnDecline &&
      !rejectedReasonPublic
    ) {
      return json(400, {
        ok: false,
        error: "rejectedReasonPublic is required when denying applications.",
      });
    }

    try {
      const apiBaseUrl = buildApiBaseUrl(event);
      const uniqueApplicationIds = Array.from(new Set(applicationIds));
      const updated = [];
      const skipped = [];
      const failed = [];
      const emailSummary = { attempted: 0, failed: 0 };

      for (const transitionApplicationId of uniqueApplicationIds) {
        try {
          const result = await transitionApplicationStatus({
            applicationId: transitionApplicationId,
            positionId,
            targetStatus,
            actorName,
            rejectedReasonPublic,
            rejectedReasonInternal,
            apiBaseUrl,
            source: "api:studio",
          });

          if (result?.email) {
            emailSummary.attempted += Number(result.email.attempted || 0);
            emailSummary.failed += Number(result.email.failed || 0);
          }

          if (result?.outcome === "updated") {
            updated.push({
              applicationId: result.applicationId || transitionApplicationId,
              sanityId: result.sanityId || null,
              status: result.status || targetStatus,
            });
            continue;
          }

          if (result?.outcome === "skipped") {
            skipped.push({
              applicationId: result.applicationId || transitionApplicationId,
              sanityId: result.sanityId || null,
              reason: result.reason || "Transition skipped.",
            });
            continue;
          }

          failed.push({
            applicationId: transitionApplicationId,
            reason: result?.reason || "Transition failed.",
          });
        } catch (error) {
          failed.push({
            applicationId: transitionApplicationId,
            reason: error?.message || "Transition failed.",
          });
        }
      }

      return json(200, {
        ok: true,
        action: "transition",
        targetStatus,
        summary: {
          updated: updated.length,
          skipped: skipped.length,
          failed: failed.length,
        },
        updated,
        skipped,
        failed,
        email: emailSummary,
      });
    } catch (error) {
      return json(500, {
        ok: false,
        error: "Failed to transition application statuses.",
        details: error?.message || "Unknown error",
      });
    }
  }

  if (action !== "update") {
    return json(400, {
      ok: false,
      error: "Unsupported action. Use action: load, update, or transition.",
    });
  }

  const applicationId = normalizeText(body?.applicationId);
  const positionId = normalizeText(body?.positionId);
  const firstName = normalizeText(body?.firstName);
  const lastName = normalizeText(body?.lastName);
  const email = normalizeEmail(body?.email);
  const phone = normalizeText(body?.phone);
  const notes = normalizeText(body?.notes);
  const referral = normalizeText(body?.referral);
  const hasPerformedRoleBefore = body?.hasPerformedRoleBefore;

  if (!applicationId || !firstName || !lastName || !email) {
    return json(400, {
      ok: false,
      error: "applicationId, firstName, lastName, and email are required.",
    });
  }
  if (!isValidEmail(email)) {
    return json(400, {
      ok: false,
      error: "A valid email address is required.",
    });
  }

  try {
    const existing = await findApplicationById(applicationId, positionId);
    if (!existing?._id) {
      return json(404, {
        ok: false,
        error: "Application not found.",
      });
    }
    const status = normalizeText(existing?.status).toLowerCase();
    if (status !== "submitted" && status !== "assigned") {
      return json(409, {
        ok: false,
        error: `Cannot update application in ${status || "unknown"} state.`,
      });
    }

    await updateVolunteerApplication({
      sanityId: existing._id,
      firstName,
      lastName,
      email,
      phone,
      notes,
      referral,
      hasPerformedRoleBefore,
    });

    const resolvedPositionId = normalizeText(
      positionId || existing?.positionId
    );
    const refreshedApplication = await findApplicationById(
      existing.applicationId || applicationId,
      resolvedPositionId
    );
    const apiBaseUrl = buildApiBaseUrl(event);
    const lifecycleResult = await processApplicationLifecycleEvent({
      application: refreshedApplication || {
        ...existing,
        applicationId: existing.applicationId || applicationId,
        positionId: resolvedPositionId,
        applicantEmail: email,
        applicantName: `${firstName} ${lastName}`.trim(),
        status: status || "submitted",
        lastActionAt: new Date().toISOString(),
        lastActionBy: "api:update",
      },
      source: "api:update",
      apiBaseUrl,
      explicitEventType: "updated",
    });

    return json(200, {
      ok: true,
      action: "update",
      application: {
        id: existing._id,
        applicationId: existing.applicationId || applicationId,
        status: status || "submitted",
        submittedAt: existing.submittedAt || null,
      },
      email: lifecycleResult?.email || { attempted: 0, failed: 0 },
      lifecycle: lifecycleResult,
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: "Failed to update application.",
      details: error?.message || "Unknown error",
    });
  }
};

const handleAdminActionLink = async (event) => {
  const query = event?.queryStringParameters || {};
  const applicationId = normalizeText(query?.applicationId);
  const positionId = normalizeText(query?.positionId);
  const action = normalizeText(query?.action).toLowerCase();
  const token = normalizeText(query?.token);
  let expectedToken = "";
  try {
    expectedToken = await getAdminActionToken();
  } catch (error) {
    return html(
      500,
      `<h3>Admin action is not configured.</h3><p>${
        error?.message || "Unable to load token."
      }</p>`
    );
  }

  if (!expectedToken) {
    return html(
      500,
      "<h3>Admin action is not configured.</h3><p>Missing ADMIN_ACTION_TOKEN.</p>"
    );
  }
  if (!token || token !== expectedToken) {
    return html(403, "<h3>Unauthorized.</h3><p>Invalid or missing token.</p>");
  }
  if (!applicationId) {
    return html(400, "<h3>Missing applicationId.</h3>");
  }
  if (action !== "approve" && action !== "deny") {
    return html(400, "<h3>Unsupported action.</h3>");
  }

  try {
    const targetStatus = action === "approve" ? "assigned" : "denied";
    const apiBaseUrl = buildApiBaseUrl(event);
    const transitionResult = await transitionApplicationStatus({
      applicationId,
      positionId,
      targetStatus,
      actorName: "api:admin-link",
      rejectedReasonPublic:
        targetStatus === "denied" ? "No reason provided." : "",
      apiBaseUrl,
      source: "api:admin-link",
    });

    if (transitionResult?.outcome === "failed") {
      return html(
        404,
        `<h3>Action failed.</h3><p>${
          transitionResult.reason || "Application not found."
        }</p>`
      );
    }

    if (transitionResult?.outcome === "skipped") {
      return html(
        200,
        `<h3>No changes applied.</h3><p>${
          transitionResult.reason ||
          "Application was already in the target state."
        }</p>`
      );
    }

    const finalStatus = transitionResult?.status || targetStatus;
    return html(
      200,
      `<h3>Success.</h3><p>Application ${applicationId} is now ${finalStatus}.</p>`
    );
  } catch (error) {
    return html(
      500,
      `<h3>Admin action failed.</h3><p>${error?.message || "Unknown error"}</p>`
    );
  }
};

const handleSanityWebhook = async (event) => {
  const rawBody = decodeRequestBody(event);
  if (!rawBody) {
    return json(400, { ok: false, error: "Missing webhook payload body." });
  }

  const signatureHeader =
    getHeaderValue(event, SIGNATURE_HEADER_NAME) ||
    getHeaderValue(event, "x-sanity-signature");
  let webhookSecret = "";
  try {
    webhookSecret = await getSanityWebhookSecret();
  } catch (error) {
    return json(500, {
      ok: false,
      error: "Unable to load Sanity webhook secret.",
      details: error?.message || "Unknown secret error",
    });
  }
  if (!webhookSecret) {
    return json(500, {
      ok: false,
      error: "Sanity webhook secret is not configured.",
    });
  }
  if (
    !isValidWebhookSignature({
      body: rawBody,
      signatureHeader,
      secret: webhookSecret,
    })
  ) {
    return json(401, { ok: false, error: "Invalid webhook signature." });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (_error) {
    return json(400, { ok: false, error: "Invalid JSON payload." });
  }

  const payloadDoc =
    payload?.document || payload?.after || payload?.result || payload || {};
  const sanityId = normalizeText(
    payloadDoc?._id || payload?._id || payload?.documentId || ""
  );
  if (sanityId.startsWith("drafts.")) {
    return json(200, { ok: true, ignored: true, reason: "draft_document" });
  }

  const candidateType = normalizeText(
    payloadDoc?._type || payload?._type || payload?.documentType || ""
  );
  if (candidateType && candidateType !== "volunteerApplication") {
    return json(200, { ok: true, ignored: true, reason: "unsupported_type" });
  }

  const applicationId = normalizeText(
    payloadDoc?.applicationId || payload?.applicationId || ""
  );
  let application = null;
  if (applicationId) {
    application = await findApplicationById(applicationId);
  }
  if (!application && sanityId) {
    application = await findApplicationBySanityId(sanityId);
  }
  if (!application?._id) {
    return json(200, {
      ok: true,
      ignored: true,
      reason: "application_not_found",
    });
  }

  const lifecycleResult = await processApplicationLifecycleEvent({
    application,
    source: "sanity:webhook",
    apiBaseUrl: buildApiBaseUrl(event),
  });

  return json(200, {
    ok: true,
    action: "sanity-webhook",
    applicationId: application.applicationId || null,
    status: application.status || null,
    lifecycle: lifecycleResult,
  });
};

const handleWithdraw = async (event) => {
  const body = safeParseBody(event);
  if (body === null) {
    return json(400, { ok: false, error: "Invalid JSON payload." });
  }

  const applicationId = normalizeText(body?.applicationId);
  const positionId = normalizeText(body?.positionId);
  if (!applicationId) {
    return json(400, {
      ok: false,
      error: "applicationId is required.",
    });
  }

  try {
    const existing = await findApplicationById(applicationId, positionId);
    if (!existing?._id) {
      return json(404, {
        ok: false,
        error: "Application not found.",
      });
    }

    const status = normalizeStatus(existing?.status);
    if (status === "withdrawn") {
      return json(200, {
        ok: true,
        action: "withdraw",
        message: "Application already withdrawn.",
        application: {
          id: existing._id,
          applicationId: existing.applicationId || applicationId,
          status: "withdrawn",
        },
      });
    }
    const transitionResult = await transitionApplicationStatus({
      applicationId,
      positionId,
      targetStatus: "withdrawn",
      actorName: "api:withdraw",
      apiBaseUrl: buildApiBaseUrl(event),
      source: "api:withdraw",
    });
    if (transitionResult?.outcome === "failed") {
      return json(500, {
        ok: false,
        error: "Failed to withdraw application.",
        details: transitionResult.reason || "Unknown error",
      });
    }
    if (transitionResult?.outcome === "skipped") {
      return json(409, {
        ok: false,
        error:
          transitionResult.reason ||
          `Cannot withdraw application in ${status || "unknown"} state.`,
      });
    }

    return json(200, {
      ok: true,
      action: "withdraw",
      application: {
        id: transitionResult?.sanityId || existing._id,
        applicationId:
          transitionResult?.applicationId ||
          existing.applicationId ||
          applicationId,
        status: "withdrawn",
      },
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: "Failed to withdraw application.",
      details: error?.message || "Unknown error",
    });
  }
};

const handlePositionStatus = async (event) => {
  const query = event?.queryStringParameters || {};
  const positionId = normalizeText(query?.positionId);
  if (!positionId) {
    return json(400, {
      ok: false,
      error: "positionId is required.",
    });
  }

  try {
    const status = await getPublicPositionStatus(positionId);
    if (!status?.positionId) {
      return json(404, {
        ok: false,
        error: "Position not found.",
      });
    }
    return json(200, {
      ok: true,
      position: status,
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: "Failed to load position status.",
      details: error?.message || "Unknown error",
    });
  }
};

const handlePositionsStatus = async (event) => {
  const body = safeParseBody(event);
  if (body === null) {
    return json(400, { ok: false, error: "Invalid JSON payload." });
  }

  const positionIds = Array.isArray(body?.positionIds)
    ? Array.from(
        new Set(
          body.positionIds.map((value) => normalizeText(value)).filter(Boolean)
        )
      )
    : [];

  if (positionIds.length === 0) {
    return json(400, {
      ok: false,
      error: "positionIds must contain at least one position id.",
    });
  }

  try {
    const statuses = await Promise.all(
      positionIds.map(async (positionId) => {
        const status = await getPublicPositionStatus(positionId);
        return status?.positionId ? status : null;
      })
    );
    return json(200, {
      ok: true,
      positions: statuses.filter(Boolean),
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: "Failed to load positions status.",
      details: error?.message || "Unknown error",
    });
  }
};

exports.handler = async (event) => {
  const routeKey = buildRouteKey(event);

  if (routeKey === "POST /applications") {
    return handleCreateApplication(event);
  }
  if (routeKey === "GET /applications/position-status") {
    return handlePositionStatus(event);
  }
  if (routeKey === "POST /applications/positions-status") {
    return handlePositionsStatus(event);
  }
  if (routeKey === "GET /applications/admin-action") {
    return handleAdminActionLink(event);
  }
  if (routeKey === "POST /applications/actions") {
    return handleApplicationActions(event);
  }
  if (routeKey === "POST /applications/withdraw") {
    return handleWithdraw(event);
  }
  if (routeKey === "POST /applications/sanity-webhook") {
    return handleSanityWebhook(event);
  }

  return json(404, {
    ok: false,
    error: "Route not found.",
    routeKey,
  });
};
