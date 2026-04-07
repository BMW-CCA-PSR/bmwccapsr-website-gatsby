/**
 * Backfill migration: converts old poc.contact (string) on event documents
 * into the new poc.contact array format.
 *
 * If the old email address matches an existing emailAlias (local-part@domain),
 * an emailAliasReferenceRecipient is created instead of a raw address entry.
 *
 * Old shape:
 *   poc: { name: "...", contact: "tours@bmw-club-psr.org", alias: { ... } }
 *
 * New shape (alias match):
 *   poc: { name: "...", contact: [ { _type: "emailAliasReferenceRecipient", alias: { _ref: "..." } } ] }
 *
 * New shape (no match):
 *   poc: { name: "...", contact: [ { _type: "emailAliasAddressRecipient", email: "..." } ] }
 *
 * Usage:
 *   DRY RUN (default):  node studio/migrations/backfill-poc-contact.mjs
 *   COMMIT:             node studio/migrations/backfill-poc-contact.mjs --commit
 */

import { createClient } from "@sanity/client";

const PROJECT_ID = "clgsgxc0";
const DATASET = "production";
const API_VERSION = "2024-01-01";

const commit = process.argv.includes("--commit");

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: false,
  token: process.env.SANITY_TOKEN,
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateKey() {
  return Math.random().toString(36).slice(2, 10);
}

async function buildAliasLookup() {
  // Fetch the site domain from siteSettings
  const domain = await client.fetch(
    `coalesce(*[_id == "siteSettings"][0].domain, "")`,
  );

  // Fetch all email aliases with their local-part name and _id
  const aliases = await client.fetch(
    `*[_type == "emailAlias" && defined(name)]{_id, name}`,
  );

  // Build a map of full email address → alias _id
  const lookup = new Map();
  const normalizedDomain = String(domain || "").trim().toLowerCase();

  for (const alias of aliases) {
    const localPart = String(alias.name || "").trim().toLowerCase();
    if (localPart && normalizedDomain) {
      lookup.set(`${localPart}@${normalizedDomain}`, alias._id);
    }
  }

  console.log(`Loaded ${lookup.size} alias address(es) from domain "${normalizedDomain}".\n`);
  return lookup;
}

async function migrate() {
  const aliasLookup = await buildAliasLookup();

  // Find events where poc.contact is still a plain string (not yet an array).
  const query = `*[_type == "event" && defined(poc.contact) && !defined(poc.contact[]._type)]{
    _id,
    poc
  }`;

  const events = await client.fetch(query);
  console.log(`Found ${events.length} event(s) to migrate.\n`);

  if (events.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  const transaction = client.transaction();

  for (const event of events) {
    const { poc } = event;
    const oldEmail = typeof poc.contact === "string" ? poc.contact.trim() : "";
    const newContact = [];
    let matchType = "none";

    if (oldEmail) {
      const aliasId = aliasLookup.get(oldEmail.toLowerCase());

      if (aliasId) {
        matchType = "alias";
        newContact.push({
          _type: "emailAliasReferenceRecipient",
          _key: generateKey(),
          alias: {
            _type: "reference",
            _ref: aliasId,
            _weak: true,
          },
        });
      } else if (emailPattern.test(oldEmail)) {
        matchType = "email";
        newContact.push({
          _type: "emailAliasAddressRecipient",
          _key: generateKey(),
          email: oldEmail,
        });
      } else {
        matchType = "skipped (not an email)";
      }
    }

    console.log(`[${commit ? "PATCH" : "DRY RUN"}] ${event._id}`);
    console.log(`  name:        ${poc.name || "(none)"}`);
    console.log(`  old contact: ${oldEmail || "(empty)"}`);
    console.log(`  match:       ${matchType}`);
    console.log(`  new contact: ${JSON.stringify(newContact)}`);
    console.log();

    if (commit) {
      transaction.patch(event._id, (p) =>
        p.set({ "poc.contact": newContact }).unset(["poc.alias"]),
      );
    }
  }

  if (commit) {
    const result = await transaction.commit();
    console.log(`Committed ${result.results.length} patch(es).`);
  } else {
    console.log("Dry run complete. Re-run with --commit to apply changes.");
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
