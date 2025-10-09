// src/auth/index.js

// Default to basic for local/dev unless explicitly set to "cognito"
const STRATEGY = (process.env.AUTH_STRATEGY || "basic").toLowerCase();

if (STRATEGY === "cognito") {
  // Only load the cognito module when requested so we don't need aws-jwt-verify in dev
  module.exports = require("./cognito");
} else {
  module.exports = require("./basic-auth");
}
