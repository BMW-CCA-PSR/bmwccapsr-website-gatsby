const EMAIL_ALIAS_LOCAL_PART_PATTERN = /^[a-z0-9][a-z0-9._+-]*$/;
const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export const normalizeEmailAliasLocalPart = (value) =>
  String(value || "").trim().toLowerCase();

export const normalizeDomain = (value) =>
  String(value || "").trim().toLowerCase();

export const isValidEmailAliasLocalPart = (value) =>
  EMAIL_ALIAS_LOCAL_PART_PATTERN.test(normalizeEmailAliasLocalPart(value));

export const isValidDomain = (value) => DOMAIN_PATTERN.test(normalizeDomain(value));

export const buildEmailAliasAddress = (localPart, domain) => {
  const normalizedLocalPart = normalizeEmailAliasLocalPart(localPart);
  const normalizedDomain = normalizeDomain(domain);

  if (!normalizedLocalPart) return "";
  if (!normalizedDomain) return normalizedLocalPart;

  return `${normalizedLocalPart}@${normalizedDomain}`;
};

export const normalizePublishedDocumentId = (value) =>
  String(value || "")
    .trim()
    .replace(/^drafts\./, "");
