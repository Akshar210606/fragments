// src/model/data/local/index.js

const fs = require("fs");
const path = require("path");

const dataDir = process.env.FRAGMENTS_DATA_DIR || "/tmp/fragments";
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function userDir(ownerId) {
  return path.join(dataDir, ownerId);
}

// ✅ Must match what Fragment.js calls
async function writeFragmentData(ownerId, id, data) {
  const dir = userDir(ownerId);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${id}.data`);
  fs.writeFileSync(filePath, data);
}

async function readFragmentData(ownerId, id) {
  const filePath = path.join(userDir(ownerId), `${id}.data`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}

async function writeFragmentMeta(ownerId, id, fragment) {
  const dir = userDir(ownerId);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(fragment, null, 2));
}

async function readFragmentMeta(ownerId, id) {
  const filePath = path.join(userDir(ownerId), `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function listFragments(ownerId) {
  const dir = userDir(ownerId);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.basename(f, ".json"));
}

async function deleteFragment(ownerId, id) {
  const dir = userDir(ownerId);
  fs.rmSync(dir, { recursive: true, force: true });
}

module.exports = {
  writeFragmentData,
  readFragmentData,
  writeFragmentMeta,
  readFragmentMeta,
  listFragments,
  deleteFragment,
};
