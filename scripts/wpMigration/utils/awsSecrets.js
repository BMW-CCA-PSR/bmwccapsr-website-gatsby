const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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
  const args = [
    'secretsmanager',
    'get-secret-value',
    '--profile',
    profile,
    '--secret-id',
    secretId,
    '--query',
    'SecretString',
    '--output',
    'text',
  ];
  if (region) args.push('--region', region);

  return spawnSync('aws', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function parseDotEnv(contents) {
  const out = {};
  String(contents || '')
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx < 1) return;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      out[key] = value;
    });
  return out;
}

function loadDotEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  const parsed = parseDotEnv(fs.readFileSync(envPath, 'utf8'));
  Object.entries(parsed).forEach(([key, value]) => {
    if (!process.env[key]) process.env[key] = value;
  });
}

function upsertDotEnvValue(envPath, key, value) {
  const resolved = path.resolve(envPath);
  const current = fs.existsSync(resolved) ? fs.readFileSync(resolved, 'utf8') : '';
  const lines = current ? current.split(/\r?\n/) : [];
  const nextLine = `${key}=${String(value || '').trim()}`;
  let replaced = false;

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i].trim();
    if (!raw || raw.startsWith('#')) continue;
    if (raw.startsWith(`${key}=`)) {
      lines[i] = nextLine;
      replaced = true;
      break;
    }
  }

  const output = replaced ? lines : [...lines, nextLine];
  const normalized = output.filter((_, idx) => !(idx === output.length - 1 && output[idx] === '')).join('\n') + '\n';
  fs.writeFileSync(resolved, normalized, { encoding: 'utf8', mode: 0o600 });
  try {
    fs.chmodSync(resolved, 0o600);
  } catch (error) {
    // Best effort: chmod can fail on some FS mounts.
  }
}

module.exports = {
  readFlag,
  hasFlag,
  extractToken,
  runAwsGetSecret,
  loadDotEnvFile,
  upsertDotEnvValue,
};
