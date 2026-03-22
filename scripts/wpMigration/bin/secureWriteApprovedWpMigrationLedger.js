#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

function readFlag(argv, name, defaultValue) {
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const [key, inlineValue] = token.split('=');
    if (key === name && inlineValue !== undefined) return inlineValue;
    if (token === name && argv[i + 1]) return argv[i + 1];
  }
  return defaultValue;
}

function hasFlag(argv, name) {
  return argv.includes(name) || argv.some((token) => token.startsWith(`${name}=`));
}

function extractToken(secretString) {
  const raw = String(secretString || '').trim();
  if (!raw) return '';

  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const parsed = JSON.parse(raw);
      return String(
        parsed.SANITY_API_TOKEN ||
          parsed.GATSBY_SANITY_TOKEN ||
          parsed.token ||
          ''
      ).trim();
    } catch (error) {
      return raw;
    }
  }

  return raw;
}

function runAwsGetSecret({ profile, secretId, region }) {
  const args = ['secretsmanager', 'get-secret-value', '--profile', profile, '--secret-id', secretId, '--query', 'SecretString', '--output', 'text'];
  if (region) args.push('--region', region);

  return spawnSync('aws', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function runApprovedWrite({ token, ledgerFile, outputFile, limit, concurrency }) {
  const scriptPath = path.resolve(__dirname, 'writeApprovedWpMigrationLedger.js');
  const args = [
    scriptPath,
    '--ledger-file',
    ledgerFile,
    '--output-file',
    outputFile,
    '--no-dry-run',
    '--concurrency',
    String(concurrency),
  ];

  if (limit > 0) {
    args.push('--limit', String(limit));
  }

  return spawnSync('node', args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      SANITY_API_TOKEN: token,
    },
  });
}

function main(argv = process.argv.slice(2)) {
  const defaultLedgerFile = path.resolve(__dirname, '..', '..', 'wp-sanity-migration-ledger.json');
  const defaultOutputFile = path.resolve(
    __dirname,
    '..',
    '..',
    'wp-sanity-migration-ledger.result.json'
  );
  const profile = readFlag(argv, '--profile', process.env.AWS_PROFILE || 'bmw-club');
  const secretId = readFlag(argv, '--secret-id', process.env.SANITY_SECRET_ID || 'SANITY_API_TOKEN');
  const region = readFlag(argv, '--region', process.env.AWS_REGION || '');
  const ledgerFile = readFlag(argv, '--ledger-file', defaultLedgerFile);
  const outputFile = readFlag(argv, '--output-file', defaultOutputFile);
  const limit = Number(readFlag(argv, '--limit', '0')) || 0;
  const concurrency = Math.max(1, Number(readFlag(argv, '--concurrency', '1')) || 1);

  console.log(`Retrieving Sanity token from AWS Secrets Manager secret ${secretId} using profile ${profile}...`);
  const secretResult = runAwsGetSecret({ profile, secretId, region });
  if (secretResult.status !== 0) {
    process.stderr.write(secretResult.stderr || 'Failed to retrieve secret from AWS Secrets Manager.\n');
    process.exitCode = secretResult.status || 1;
    return;
  }

  const token = extractToken(secretResult.stdout);
  if (!token) {
    console.error('Secret did not contain a usable SANITY_API_TOKEN value.');
    process.exitCode = 1;
    return;
  }

  console.log('Token retrieved. Starting non-dry-run approved ledger write...');
  const writeResult = runApprovedWrite({
    token,
    ledgerFile,
    outputFile,
    limit,
    concurrency,
  });

  if (writeResult.status !== 0) {
    process.exitCode = writeResult.status || 1;
    return;
  }

  console.log('Approved ledger write completed successfully.');
}

main();
