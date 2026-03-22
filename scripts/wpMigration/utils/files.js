const fs = require('fs');
const path = require('path');

function resolveFile(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

function readJsonFile(filePath) {
  const resolved = resolveFile(filePath);
  return JSON.parse(fs.readFileSync(resolved, 'utf8'));
}

function writeJsonFile(filePath, payload) {
  const resolved = resolveFile(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, JSON.stringify(payload, null, 2), 'utf8');
  return resolved;
}

module.exports = {
  resolveFile,
  readJsonFile,
  writeJsonFile,
};