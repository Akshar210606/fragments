// src/auth/basic-auth.js
const fs = require("fs");
const path = require("path");
const { BasicStrategy } = require("passport-http");
const bcrypt = require("bcryptjs");
const authorize = require("./auth-middleware");

// Load an Apache htpasswd file into a Map(username -> hash)
function loadHtpasswd(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const map = new Map();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf(":");
    if (i <= 0) continue;
    const user = line.slice(0, i);
    const hash = line.slice(i + 1);
    map.set(user, hash);
  }
  return map;
}

// Support bcrypt ($2a/$2b/$2y) and {SHA} legacy
function verifyHtpasswd(password, storedHash) {
  if (!storedHash) return false;

  if (storedHash.startsWith("$2")) {
    try {
      return bcrypt.compareSync(password, storedHash);
    } catch {
      return false;
    }
  }

  if (storedHash.startsWith("{SHA}")) {
    const crypto = require("crypto");
    const base64 = storedHash.slice(5);
    const sha = crypto
      .createHash("sha1")
      .update(password, "utf8")
      .digest("base64");
    return sha === base64;
  }

  return false; // other schemes not supported here
}

let cachedUsers = null;
function getUsers() {
  if (cachedUsers) return cachedUsers;

  const htpasswd = process.env.HTPASSWD_FILE;
  if (!htpasswd) throw new Error("missing expected env var: HTPASSWD_FILE");

  const file = path.resolve(htpasswd);
  if (!fs.existsSync(file))
    throw new Error(`HTPASSWD_FILE not found at: ${file}`);

  cachedUsers = loadHtpasswd(file);
  return cachedUsers;
}

module.exports.strategy = () =>
  new BasicStrategy((username, password, done) => {
    try {
      const users = getUsers();
      const storedHash = users.get(username);
      if (!storedHash) return done(null, false);
      if (!verifyHtpasswd(password, storedHash)) return done(null, false);
      return done(null, username); // pass email/username through
    } catch (err) {
      return done(err);
    }
  });

// Use our custom wrapper so req.userId becomes the hashed email
module.exports.authenticate = () => authorize("basic");
