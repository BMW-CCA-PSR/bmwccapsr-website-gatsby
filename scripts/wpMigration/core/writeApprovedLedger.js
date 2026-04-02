const pLimit = require('p-limit');
const {parseWriteArgs} = require('../utils/cli');
const {readJsonFile, writeJsonFile} = require('../utils/files');
const {createSanityWriteClient, createOrReplaceDocument} = require('../services/sanity');

function cloneLedger(ledger) {
  return JSON.parse(JSON.stringify(ledger));
}

async function runWriteApprovedLedger(argv = process.argv.slice(2)) {
  const args = parseWriteArgs(argv);
  const ledger = cloneLedger(readJsonFile(args.ledgerFile));

  if (!Array.isArray(ledger.ledger)) {
    throw new Error('Ledger file is missing a ledger array. Export a Migration Ledger JSON from the approval UI first.');
  }

  const eligible = ledger.ledger.filter(
    (row) => row.approval === 'approved' && row.migrationStatus !== 'migrated' && row.sanityDraft
  );
  const rows = args.limit > 0 ? eligible.slice(0, args.limit) : eligible;
  const client = args.dryRun ? null : createSanityWriteClient();
  const limit = pLimit(Math.max(1, args.concurrency));

  await Promise.all(
    rows.map((row) =>
      limit(async () => {
        row.lastAttemptAt = new Date().toISOString();
        try {
          if (!args.dryRun) {
            const result = await createOrReplaceDocument(client, row.sanityDraft);
            row.migrationStatus = 'migrated';
            row.migratedAt = new Date().toISOString();
            row.sanityDraftId = result && result._id ? result._id : row.sanityDraft._id;
            row.lastError = null;
          } else {
            row.migrationStatus = 'dry-run-ready';
            row.lastError = null;
          }
        } catch (error) {
          row.migrationStatus = 'failed';
          row.lastError = String(error && error.message ? error.message : error);
        }
      })
    )
  );

  ledger.generatedAt = new Date().toISOString();
  ledger.summary = {
    dryRun: args.dryRun,
    processed: rows.length,
    migrated: rows.filter((row) => row.migrationStatus === 'migrated').length,
    failed: rows.filter((row) => row.migrationStatus === 'failed').length,
  };

  const outputPath = writeJsonFile(args.outputFile, ledger);
  console.log(JSON.stringify({ outputPath, summary: ledger.summary }, null, 2));
}

module.exports = {
  runWriteApprovedLedger,
};