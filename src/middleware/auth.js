// src/middleware/auth.js
const auth = require("../auth/");
const bcrypt = require("bcryptjs");
const fs = require("fs");

function basicAuth(req, res, next) {
  const credentials = auth(req);

  if (!credentials || !credentials.name || !credentials.pass) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Access to the API"');
    return res.status(401).json({ error: "Missing Authorization Header" });
  }

  const htpasswdPath = process.env.HTPASSWD_FILE || ".htpasswd";
  if (!fs.existsSync(htpasswdPath)) {
    return res.status(500).json({ error: "HTPASSWD file not found" });
  }

  const lines = fs.readFileSync(htpasswdPath, "utf-8").split("\n");
  for (const line of lines) {
    if (!line.includes(":")) continue;
    const [user, hash] = line.split(":");
    if (
      user === credentials.name &&
      bcrypt.compareSync(credentials.pass, hash.trim())
    ) {
      req.user = credentials.name;
      return next();
    }
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Access to the API"');
  res.status(401).json({ error: "Invalid username or password" });
}

// ✅ Export a single function that returns a middleware
module.exports.authenticate = () => {
  return basicAuth;
};
