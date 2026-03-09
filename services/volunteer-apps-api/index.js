"use strict";

const crypto = require("crypto");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const awsRegion = process.env.AWS_REGION || "us-west-2";
const secretsManager = new SecretsManagerClient({ region: awsRegion });

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify(body),
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

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const normalizeText = (value) => String(value || "").trim();

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getSanityApiToken = async () => {
  const tokenFromEnv = process.env.SANITY_API_TOKEN || "";
  if (tokenFromEnv) {
    return tokenFromEnv;
  }

  const secretName = process.env.SANITY_API_TOKEN_SECRET_NAME || "";
  if (!secretName) {
    throw new Error(
      "Missing SANITY_API_TOKEN or SANITY_API_TOKEN_SECRET_NAME environment configuration.",
    );
  }

  const secretValue = await secretsManager.send(
    new GetSecretValueCommand({ SecretId: secretName }),
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
    "positionTitle": coalesce(role->name, "Volunteer position"),
    "eventName": motorsportRegEvent.name,
    "slug": slug.current
  }`;
  return sanityFetchQuery(query, { positionId });
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
    lastName,
  )}`.trim();
  const applicantNotes = buildApplicantNotes({
    notes,
    referral,
    hasPerformedRoleBefore,
  });

  const applicationId = buildApplicationId();
  const doc = {
    _type: "volunteerApplication",
    applicationId,
    position: { _type: "reference", _ref: positionId },
    applicantName,
    applicantEmail: email,
    applicantPhone: normalizeText(phone) || null,
    applicantNotes,
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

const buildApplicantNotes = ({
  notes,
  referral,
  hasPerformedRoleBefore,
}) => {
  const noteParts = [];
  if (normalizeText(notes)) noteParts.push(`Notes: ${normalizeText(notes)}`);
  if (normalizeText(referral))
    noteParts.push(`Referral: ${normalizeText(referral)}`);
  if (typeof hasPerformedRoleBefore === "boolean") {
    noteParts.push(
      `Performed role before: ${hasPerformedRoleBefore ? "Yes" : "No"}`,
    );
  }
  return noteParts.join("\n\n") || null;
};

const findApplicationById = async (applicationId, positionId = "") => {
  const query = `*[_type == "volunteerApplication" && applicationId == $applicationId && (!defined($positionId) || $positionId == "" || position._ref == $positionId)][0]{
    _id,
    applicationId,
    status,
    isActive,
    applicantName,
    applicantEmail,
    applicantPhone,
    applicantNotes,
    notes,
    referral,
    hasPerformedRoleBefore,
    submittedAt
  }`;
  return sanityFetchQuery(query, {
    applicationId,
    positionId: normalizeText(positionId),
  });
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
    lastName,
  )}`.trim();
  const patch = {
    applicantName,
    applicantEmail: normalizeEmail(email),
    applicantPhone: normalizeText(phone) || null,
    applicantNotes: buildApplicantNotes({
      notes,
      referral,
      hasPerformedRoleBefore,
    }),
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

const withdrawVolunteerApplication = async ({ sanityId }) => {
  const nowIso = new Date().toISOString();
  await sanityMutate([
    {
      patch: {
        id: sanityId,
        set: {
          status: "withdrawn",
          isActive: false,
          withdrawnAt: nowIso,
          lastActionAt: nowIso,
          lastActionBy: "api:withdraw",
        },
      },
    },
  ]);
};

const sendEmail = async ({ to, subject, textBody }) => {
  const fromEmail = process.env.SES_FROM_EMAIL || "";
  if (!fromEmail || !to || !subject || !textBody) return;
  const region = process.env.SES_REGION || awsRegion;
  const ses = new SESClient({ region });
  await ses.send(
    new SendEmailCommand({
      Source: fromEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Text: { Data: textBody, Charset: "UTF-8" },
        },
      },
    }),
  );
};

const notifyApplicantAndStaff = async ({
  applicantEmail,
  applicantName,
  applicationId,
  positionTitle,
  eventName,
  manageUrl,
  withdrawUrl,
}) => {
  const staffEmails = String(process.env.STAFF_NOTIFICATION_EMAILS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const eventLine = eventName ? `Event: ${eventName}\n` : "";
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
  ]
    .filter(Boolean)
    .join("\n");

  const tasks = [sendEmail({ to: applicantEmail, subject: applicantSubject, textBody: applicantBody })];
  staffEmails.forEach((to) => {
    tasks.push(sendEmail({ to, subject: staffSubject, textBody: staffBody }));
  });

  const results = await Promise.allSettled(tasks);
  return {
    attempted: tasks.length,
    failed: results.filter((result) => result.status === "rejected").length,
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

    const emailResult = await notifyApplicantAndStaff({
      applicantEmail: email,
      applicantName: `${firstName} ${lastName}`.trim(),
      applicationId: created.applicationId,
      positionTitle,
      eventName: position?.eventName || "",
      manageUrl,
      withdrawUrl,
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
      email: emailResult,
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

  if (action !== "update") {
    return json(400, {
      ok: false,
      error: "Unsupported action. Use action: load or update.",
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

    return json(200, {
      ok: true,
      action: "update",
      application: {
        id: existing._id,
        applicationId: existing.applicationId || applicationId,
        status: status || "submitted",
        submittedAt: existing.submittedAt || null,
      },
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: "Failed to update application.",
      details: error?.message || "Unknown error",
    });
  }
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
    const status = normalizeText(existing?.status).toLowerCase();
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
    if (status !== "submitted" && status !== "assigned") {
      return json(409, {
        ok: false,
        error: `Cannot withdraw application in ${status || "unknown"} state.`,
      });
    }

    await withdrawVolunteerApplication({
      sanityId: existing._id,
    });

    return json(200, {
      ok: true,
      action: "withdraw",
      application: {
        id: existing._id,
        applicationId: existing.applicationId || applicationId,
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

exports.handler = async (event) => {
  const routeKey = buildRouteKey(event);

  if (routeKey === "POST /applications") {
    return handleCreateApplication(event);
  }
  if (routeKey === "POST /applications/actions") {
    return handleApplicationActions(event);
  }
  if (routeKey === "POST /applications/withdraw") {
    return handleWithdraw(event);
  }

  return json(404, {
    ok: false,
    error: "Route not found.",
    routeKey,
  });
};
