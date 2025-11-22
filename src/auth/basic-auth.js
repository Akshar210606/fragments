const fs = require("fs");
const bcrypt = require("bcryptjs");
const { BasicStrategy } = require("passport-http");

const htpasswdFile = process.env.HTPASSWD_FILE;

if (!htpasswdFile) {
  console.error("❌ ERROR: HTPASSWD_FILE not set");
  process.exit(1);
}

// Load htpasswd users
const users = fs
  .readFileSync(htpasswdFile, "utf-8")
  .trim()
  .split("\n")
  .map((line) => {
    const [username, hash] = line.split(":");
    return { username, hash };
  });

module.exports = {
  name: "basic",
  strategy: new BasicStrategy((username, password, done) => {
    const user = users.find((u) => u.username === username);

    if (!user) {
      return done(null, false);
    }

    bcrypt.compare(password, user.hash, (err, result) => {
      if (err || !result) return done(null, false);

      return done(null, { username });
    });
  }),
};
