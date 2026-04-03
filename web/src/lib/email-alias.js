export const EMAIL_ALIAS_DOMAIN = "bmw-club-psr.org";

export const buildEmailAliasAddress = (aliasName) => {
  const normalized = String(aliasName || "").trim().toLowerCase();
  if (!normalized) return "";
  return `${normalized}@${EMAIL_ALIAS_DOMAIN}`;
};
