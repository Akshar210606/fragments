// src/auth/basic-auth.js
const { BasicStrategy } = require("passport-http");

// Create a Basic authentication strategy using environment variables
// BASIC_USER and BASIC_PASS for the single allowed user.
const strategy = new BasicStrategy((username, password, done) => {
  if (
    username === process.env.BASIC_USER &&
    password === process.env.BASIC_PASS
  ) {
    // What we return here gets passed to auth-middleware, which will hash it
    return done(null, { user: username });
  }
  return done(null, false);
});

module.exports = {
  name: "basic",
  strategy,
};
