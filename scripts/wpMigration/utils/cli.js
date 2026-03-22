const {
  DEFAULT_WP_API_BASE,
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  DEFAULT_PREVIEW_LIMIT,
  DEFAULT_INSECURE,
  DEFAULT_OUTPUT_FILE,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_EMBED,
  DEFAULT_LEDGER_FILE,
  DEFAULT_LEDGER_RESULT_FILE,
} = require('./constants');

function readFlag(argv, name) {
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const [key, inlineValue] = token.split('=');
    if (key === name && inlineValue !== undefined) return inlineValue;
    if (token === name && argv[i + 1]) return argv[i + 1];
  }
  return undefined;
}

function hasFlag(argv, name) {
  return argv.includes(name) || argv.some((token) => token.startsWith(`${name}=`));
}

function parseReviewArgs(argv) {
  return {
    baseUrl: readFlag(argv, '--base-url') || DEFAULT_WP_API_BASE,
    page: Number(readFlag(argv, '--page') || DEFAULT_PAGE),
    perPage: Number(readFlag(argv, '--per-page') || DEFAULT_PER_PAGE),
    previewLimit: Number(readFlag(argv, '--preview-limit') || DEFAULT_PREVIEW_LIMIT),
    insecure: hasFlag(argv, '--insecure') || DEFAULT_INSECURE,
    outputFile: readFlag(argv, '--output-file') || DEFAULT_OUTPUT_FILE,
    timeoutMs: Number(readFlag(argv, '--timeout-ms') || DEFAULT_TIMEOUT_MS),
    embed: hasFlag(argv, '--embed') || DEFAULT_EMBED,
  };
}

function parseWriteArgs(argv) {
  return {
    ledgerFile: readFlag(argv, '--ledger-file') || DEFAULT_LEDGER_FILE,
    outputFile: readFlag(argv, '--output-file') || DEFAULT_LEDGER_RESULT_FILE,
    limit: Number(readFlag(argv, '--limit') || 0),
    dryRun: !hasFlag(argv, '--no-dry-run'),
    concurrency: Number(readFlag(argv, '--concurrency') || 1),
  };
}

module.exports = {
  parseReviewArgs,
  parseWriteArgs,
};