const fs = require("fs");
const path = require("path");

const dataDir = process.env.FRAGMENTS_DATA_DIR || "/tmp/fragments";

function ensureUserDir(ownerId) {
  const userDir = path.join(dataDir, String(ownerId));
  fs.mkdirSync(userDir, { recursive: true });
  return userDir;
}

// ✅ FIX: Always convert id to a string before joining
async function writeFragmentData(ownerId, id, data) {
  const userDir = ensureUserDir(ownerId);
  const filePath = path.join(userDir, String(id)); // convert id to string
  await fs.promises.writeFile(filePath, data);
}

async function readFragmentData(ownerId, id) {
  const filePath = path.join(ensureUserDir(ownerId), String(id));
  return fs.promises.readFile(filePath);
}

async function listFragments(ownerId) {
  const userDir = ensureUserDir(ownerId);
  return fs.promises.readdir(userDir);
}

async function deleteFragmentData(ownerId, id) {
  const filePath = path.join(ensureUserDir(ownerId), String(id));
  await fs.promises.unlink(filePath);
}

module.exports = {
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragmentData,
};
