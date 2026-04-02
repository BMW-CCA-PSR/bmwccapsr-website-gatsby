import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
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

const MANAGED_BY = "sanity-email-alias-sync";
const aliasPattern = /^[a-z0-9][a-z0-9._+-]*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    '*[_type == "emailAlias" && !(_id in path("drafts.**"))]|order(name asc){_id,name,recipients}';
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

    for (const alias of publishedAliases) {
      const existingMapping = existingByAlias.get(alias.name) || [];
      if (arraysEqual(existingMapping, alias.recipients)) {
        unchanged += 1;
        continue;
      }

      await dynamoClient.send(
        new PutItemCommand({
          TableName: aliasTableName,
          Item: marshall({
            alias: alias.name,
            mapping: alias.recipients,
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
