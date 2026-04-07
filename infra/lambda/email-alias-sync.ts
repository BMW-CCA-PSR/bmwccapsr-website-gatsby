import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import {
  CloudWatchLogsClient,
  GetQueryResultsCommand,
  StartQueryCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

type RawAliasDocument = {
  _id?: string;
  name?: string;
  enabled?: boolean;
  recipients?: unknown;
};

type RawAliasRecipientReference = {
  _ref?: string;
  _type?: string;
};

type RawAliasRecipientObject = {
  _type?: string;
  email?: unknown;
  alias?: RawAliasRecipientReference;
};

type AliasDocument = {
  _id: string;
  name: string;
  enabled: boolean;
  recipients: Array<string | RawAliasRecipientReference>;
};

type AliasTableRow = {
  alias: string;
  mapping: string[];
  managedBy?: string;
};

type LambdaEvent = Record<string, any>;

const region = process.env.AWS_REGION || "us-west-2";
const secretsClient = new SecretsManagerClient({ region });
const dynamoClient = new DynamoDBClient({ region });
const logsClient = new CloudWatchLogsClient({ region });

const MANAGED_BY = "sanity-email-alias-sync";
const aliasPattern = /^[a-z0-9][a-z0-9._+-]*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const forwarderLogGroupName = String(
  process.env.EMAIL_ALIAS_FORWARDER_LOG_GROUP_NAME ||
    "/aws/lambda/SesProxyStack-SesProxyStack82528740-fpIfvg1MtmOe",
).trim();
const defaultMetricsDays = 7;

const requiredEnv = (name: string): string => {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const sanityTokenSecretName = requiredEnv("SANITY_API_TOKEN_SECRET_NAME");
const sanityProjectId = requiredEnv("SANITY_PROJECT_ID");
const sanityDataset = requiredEnv("SANITY_DATASET");
const sanityApiVersion = requiredEnv("SANITY_API_VERSION");
const aliasTableName = requiredEnv("EMAIL_ALIAS_TABLE_NAME");
const webhookToken = String(process.env.EMAIL_ALIAS_SYNC_WEBHOOK_TOKEN || "").trim();

const normalizeInvocationEvent = (rawEvent: LambdaEvent): LambdaEvent => {
  if (!rawEvent || typeof rawEvent !== "object") return {};
  if (typeof rawEvent.body !== "string") return rawEvent;

  try {
    const parsedBody = JSON.parse(rawEvent.body);
    if (!parsedBody || typeof parsedBody !== "object") return rawEvent;
    return {
      ...rawEvent,
      ...parsedBody,
      body: parsedBody,
    };
  } catch (_error) {
    return rawEvent;
  }
};

const getHeader = (event: LambdaEvent, targetName: string): string => {
  const headers = event?.headers;
  if (!headers || typeof headers !== "object") return "";

  const target = String(targetName || "").trim().toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (String(key || "").trim().toLowerCase() !== target) continue;
    return String(value || "").trim();
  }

  return "";
};

const jsonResponse = (
  statusCode: number,
  payload: Record<string, any>,
): Record<string, any> => ({
  statusCode,
  headers: {
    "content-type": "application/json; charset=utf-8",
  },
  body: JSON.stringify(payload),
});

const optionsResponse = (): Record<string, any> => ({
  statusCode: 204,
  headers: {},
  body: "",
});

const normalizeAlias = (value: unknown): string =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeAliasLocalPart = (value: unknown): string =>
  normalizeAlias(value).replace(/@.*$/, "");

const normalizeRecipient = (value: unknown): string =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeDocumentId = (value: unknown): string =>
  String(value || "")
    .trim()
    .replace(/^drafts\./, "");

const parseSecretString = (value: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);
    const candidateKeys = [
      "token",
      "apiToken",
      "sanityToken",
      "SANITY_API_TOKEN",
      "value",
      "secret",
    ];
    for (const key of candidateKeys) {
      const candidate = String(parsed?.[key] || "").trim();
      if (candidate) return candidate;
    }
  } catch (_error) {
    // Secret is plain text.
  }

  return raw;
};

const getSanityToken = async (): Promise<string> => {
  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: sanityTokenSecretName }),
  );
  const token = parseSecretString(String(response.SecretString || ""));
  if (!token) {
    throw new Error(
      `Secret ${sanityTokenSecretName} did not contain a usable Sanity API token.`,
    );
  }
  return token;
};

const fetchEmailAliasDocuments = async (): Promise<AliasDocument[]> => {
  const token = await getSanityToken();
  const query =
    '*[_type == "emailAlias" && !(_id in path("drafts.**"))]|order(name asc){_id,name,enabled,recipients}';
  const url = new URL(
    `https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/data/query/${sanityDataset}`,
  );
  url.searchParams.set("query", query);
  url.searchParams.set("perspective", "published");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw new Error(
      `Sanity query failed with ${response.status}: ${rawText.slice(0, 300)}`,
    );
  }

  let payload: Record<string, any> = {};
  try {
    payload = rawText ? JSON.parse(rawText) : {};
  } catch (_error) {
    throw new Error("Sanity query response was not valid JSON.");
  }

  const result = Array.isArray(payload?.result) ? payload.result : [];
  const seenAliases = new Set<string>();

  return result.map((row: RawAliasDocument) => {
    const name = normalizeAlias(row?.name);
    const enabled = row?.enabled !== false;
    const recipients = Array.isArray(row?.recipients)
      ? row.recipients
          .map((entry) => {
            if (typeof entry === "string") {
              return normalizeRecipient(entry);
            }

            const entryType = String((entry as RawAliasRecipientObject)?._type || "").trim();
            if (entryType === "emailAliasAddressRecipient") {
              return normalizeRecipient((entry as RawAliasRecipientObject)?.email);
            }

            if (
              entryType === "emailAliasReferenceRecipient" &&
              (entry as RawAliasRecipientObject)?.alias?._ref
            ) {
              return {
                _type: "reference",
                _ref: normalizeDocumentId(
                  (entry as RawAliasRecipientObject).alias?._ref,
                ),
              };
            }

            if (entry && typeof entry === "object" && "_ref" in entry) {
              return {
                _type: "reference",
                _ref: normalizeDocumentId((entry as RawAliasRecipientReference)._ref),
              };
            }

            return "";
          })
          .filter((entry) => {
            if (typeof entry === "string") return Boolean(entry);
            return Boolean(entry?._ref);
          })
      : [];

    if (!name) {
      throw new Error(`Email alias document ${row?._id || "(unknown)"} is missing a name.`);
    }
    if (!aliasPattern.test(name)) {
      throw new Error(`Email alias "${name}" has an invalid alias key.`);
    }
    if (seenAliases.has(name)) {
      throw new Error(`Duplicate published email alias "${name}" found in Sanity.`);
    }
    seenAliases.add(name);

    if (recipients.length === 0) {
      throw new Error(`Email alias "${name}" has no recipients.`);
    }

    return {
      _id: normalizeDocumentId(row?._id),
      name,
      enabled,
      recipients,
    };
  });
};

const dedupeRecipients = (values: string[]): string[] => {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    deduped.push(value);
  }

  return deduped;
};

const resolveAliasRecipients = (
  alias: AliasDocument,
  aliasesById: Map<string, AliasDocument>,
  aliasesByName: Map<string, AliasDocument>,
  stack: string[] = [],
): string[] => {
  const aliasIdentifier = alias._id || alias.name;
  if (stack.includes(aliasIdentifier)) {
    throw new Error(
      `Circular alias reference detected: ${[...stack, aliasIdentifier].join(" -> ")}`,
    );
  }

  const resolved: string[] = [];

  if (alias.enabled === false) {
    throw new Error(`Email alias "${alias.name}" is disabled and cannot be used as a forwarding target.`);
  }

  for (const recipient of alias.recipients) {
    if (typeof recipient === "string") {
      if (!emailPattern.test(recipient)) {
        throw new Error(`Email alias "${alias.name}" has invalid recipient "${recipient}".`);
      }
      resolved.push(recipient);
      continue;
    }

    const referencedId = normalizeDocumentId(recipient?._ref);
    if (!referencedId) {
      throw new Error(`Email alias "${alias.name}" contains an invalid alias reference.`);
    }

    const referencedAlias =
      aliasesById.get(referencedId) || aliasesByName.get(normalizeAlias(referencedId));
    if (!referencedAlias) {
      throw new Error(
        `Email alias "${alias.name}" references alias document "${referencedId}" which was not found in published Sanity content.`,
      );
    }

    if (referencedAlias._id === alias._id) {
      throw new Error(`Email alias "${alias.name}" cannot reference itself.`);
    }

    resolved.push(
      ...resolveAliasRecipients(referencedAlias, aliasesById, aliasesByName, [
        ...stack,
        aliasIdentifier,
      ]),
    );
  }

  const deduped = dedupeRecipients(resolved);
  if (deduped.length === 0) {
    throw new Error(`Email alias "${alias.name}" resolved to zero email recipients.`);
  }

  return deduped;
};

const scanExistingMappings = async (): Promise<AliasTableRow[]> => {
  const rows: AliasTableRow[] = [];
  let exclusiveStartKey: Record<string, any> | undefined;

  do {
    const response = await dynamoClient.send(
      new ScanCommand({
        TableName: aliasTableName,
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    const items = Array.isArray(response.Items) ? response.Items : [];
    for (const item of items) {
      const parsed = unmarshall(item) as AliasTableRow;
      rows.push({
        alias: normalizeAlias(parsed?.alias),
        mapping: Array.isArray(parsed?.mapping)
          ? parsed.mapping.map((entry) => normalizeRecipient(entry)).filter(Boolean)
          : [],
        managedBy: String(parsed?.managedBy || "").trim(),
      });
    }

    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return rows.filter((row) => row.alias);
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const startOfUtcDay = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const formatUtcDate = (date: Date): string =>
  [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");

const buildMetricsDays = (days: number): string[] => {
  const today = startOfUtcDay(new Date());
  return Array.from({ length: days }, (_value, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (days - index - 1));
    return formatUtcDate(date);
  });
};

const parseQueryResults = (
  results: Array<Array<{ field?: string; value?: string }>> = [],
): Map<string, { received: number; delivered: number }> => {
  const parsed = new Map<string, { received: number; delivered: number }>();

  for (const row of results) {
    const rowMap = new Map(
      row.map((entry) => [String(entry?.field || ""), String(entry?.value || "")]),
    );
    const rawDay = rowMap.get("day") || "";
    const day = rawDay.slice(0, 10);
    if (!day) continue;

    parsed.set(day, {
      received: Number(rowMap.get("received_messages") || 0),
      delivered: Number(rowMap.get("forwarded_deliveries") || 0),
    });
  }

  return parsed;
};

const fetchAliasMetrics = async (aliasName: string, requestedDays?: unknown) => {
  const normalizedAlias = normalizeAliasLocalPart(aliasName);
  if (!normalizedAlias) {
    throw new Error("aliasName is required.");
  }
  if (!aliasPattern.test(normalizedAlias)) {
    throw new Error(`Invalid alias name "${normalizedAlias}".`);
  }
  if (!forwarderLogGroupName) {
    throw new Error("EMAIL_ALIAS_FORWARDER_LOG_GROUP_NAME is not configured.");
  }

  const days = Math.max(
    1,
    Math.min(30, Number.parseInt(String(requestedDays || defaultMetricsDays), 10) || defaultMetricsDays),
  );
  const dayLabels = buildMetricsDays(days);
  const startDate = new Date(`${dayLabels[0]}T00:00:00.000Z`);
  const startTime = Math.floor(startDate.getTime() / 1000);
  const endTime = Math.floor(Date.now() / 1000);

  const queryString = [
    "filter @message like /sendMessage: Sending email via SES/",
    "| parse @message /Original recipients: (?<originalRecipient>.*)\\. Transformed recipients: (?<destinations>.*)\\./",
    "| parse originalRecipient /(?<aliasLocalPart>[^@]+)@(?<aliasDomain>[^\\s,]+)/",
    `| filter aliasLocalPart = "${normalizedAlias}"`,
    '| fields 1 + strlen(destinations) - strlen(replace(destinations, ",", "")) as recipientCount',
    "| stats count() as received_messages, sum(recipientCount) as forwarded_deliveries by bin(1d) as day",
    "| sort day asc",
  ].join(" ");

  const startResponse = await logsClient.send(
    new StartQueryCommand({
      logGroupName: forwarderLogGroupName,
      startTime,
      endTime,
      queryString,
    }),
  );
  const queryId = String(startResponse.queryId || "").trim();
  if (!queryId) {
    throw new Error("CloudWatch Logs query did not return a query ID.");
  }

  let queryResults:
    | Array<Array<{ field?: string; value?: string }>>
    | undefined;
  let finalStatus = "";

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (attempt > 0) {
      await sleep(500);
    }

    const resultResponse = await logsClient.send(
      new GetQueryResultsCommand({ queryId }),
    );
    finalStatus = String(resultResponse.status || "");

    if (finalStatus === "Complete") {
      queryResults = resultResponse.results as Array<
        Array<{ field?: string; value?: string }>
      >;
      break;
    }

    if (
      finalStatus === "Failed" ||
      finalStatus === "Cancelled" ||
      finalStatus === "Timeout" ||
      finalStatus === "Unknown"
    ) {
      throw new Error(`CloudWatch Logs query failed with status "${finalStatus}".`);
    }
  }

  if (!queryResults) {
    throw new Error(
      `CloudWatch Logs query did not complete in time. Last status: ${finalStatus || "unknown"}.`,
    );
  }

  const resultsByDay = parseQueryResults(queryResults);
  const series = dayLabels.map((day) => {
    const metrics = resultsByDay.get(day) || { received: 0, delivered: 0 };
    return {
      day,
      received: metrics.received,
      delivered: metrics.delivered,
    };
  });

  return {
    aliasName: normalizedAlias,
    timezone: "UTC",
    series,
    totals: series.reduce(
      (accumulator, row) => ({
        received: accumulator.received + row.received,
        delivered: accumulator.delivered + row.delivered,
      }),
      { received: 0, delivered: 0 },
    ),
  };
};

const arraysEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
};

export const handler = async (rawEvent: LambdaEvent = {}): Promise<Record<string, any>> => {
  const event = normalizeInvocationEvent(rawEvent);
  const requestMethod = String(event?.requestContext?.http?.method || event?.httpMethod || "")
    .trim()
    .toUpperCase();

  if (requestMethod === "OPTIONS") {
    return optionsResponse();
  }

  if (requestMethod && requestMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed. Use POST." });
  }

  if (webhookToken) {
    const suppliedToken = getHeader(event, "x-email-alias-sync-token");
    if (suppliedToken !== webhookToken) {
      return jsonResponse(401, { error: "Unauthorized." });
    }
  }

  try {
    const operation = String(event?.operation || event?.body?.operation || "email_alias_sync")
      .trim()
      .toLowerCase();

    if (operation === "email_alias_metrics") {
      const metrics = await fetchAliasMetrics(
        String(event?.aliasName || event?.body?.aliasName || ""),
        event?.days || event?.body?.days,
      );
      return jsonResponse(200, {
        ok: true,
        metrics,
      });
    }

    const [publishedAliases, existingRows] = await Promise.all([
      fetchEmailAliasDocuments(),
      scanExistingMappings(),
    ]);

    if (publishedAliases.length === 0) {
      throw new Error(
        "No published email aliases were found in Sanity. Refusing to sync because it would clear the forwarding table.",
      );
    }

    const aliasesById = new Map(
      publishedAliases.map((alias) => [alias._id, alias]),
    );
    const aliasesByName = new Map(
      publishedAliases.map((alias) => [alias.name, alias]),
    );
    const enabledAliases = publishedAliases.filter((alias) => alias.enabled !== false);
    const resolvedAliases = enabledAliases.map((alias) => ({
      ...alias,
      resolvedRecipients: resolveAliasRecipients(alias, aliasesById, aliasesByName),
    }));

    const desiredByAlias = new Map(
      resolvedAliases.map((alias) => [alias.name, alias.resolvedRecipients]),
    );
    const existingByAlias = new Map(
      existingRows.map((row) => [row.alias, row.mapping]),
    );

    let upserted = 0;
    let deleted = 0;
    let unchanged = 0;

    for (const alias of resolvedAliases) {
      const existingMapping = existingByAlias.get(alias.name) || [];
      if (arraysEqual(existingMapping, alias.resolvedRecipients)) {
        unchanged += 1;
        continue;
      }

      await dynamoClient.send(
        new PutItemCommand({
          TableName: aliasTableName,
          Item: marshall({
            alias: alias.name,
            mapping: alias.resolvedRecipients,
            managedBy: MANAGED_BY,
            updatedAt: new Date().toISOString(),
            sourceDocumentId: alias._id,
          }),
        }),
      );
      upserted += 1;
    }

    for (const existingRow of existingRows) {
      if (desiredByAlias.has(existingRow.alias)) continue;

      await dynamoClient.send(
        new DeleteItemCommand({
          TableName: aliasTableName,
          Key: marshall({ alias: existingRow.alias }),
        }),
      );
      deleted += 1;
    }

    return jsonResponse(200, {
        ok: true,
        aliases: {
          publishedCount: publishedAliases.length,
          enabledCount: enabledAliases.length,
          existingCount: existingRows.length,
        },
      writes: {
        upserted,
        deleted,
        unchanged,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected email alias sync failure.";
    return jsonResponse(500, { ok: false, error: message });
  }
};
