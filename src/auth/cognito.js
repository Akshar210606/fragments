// src/auth/cognito.js
const { Strategy: BearerStrategy } = require("passport-http-bearer");
const logger = require("../logger");
const { verifyCognitoToken } = require("./verify-cognito");

// ✅ Create a proper Bearer strategy instance
const strategy = new BearerStrategy(async (token, done) => {
  try {
    const user = await verifyCognitoToken(token);
    if (!user) {
      logger.warn("Invalid token: no user");
      return done(null, false);
    }

    // Successfully authenticated user
    return done(null, user);
  } catch (err) {
    logger.error({ err }, "Error verifying Cognito token");
    return done(null, false);
  }
});

module.exports = {
  name: "bearer", // ✅ Name of the strategy
  strategy, // ✅ Actual Passport strategy instance
};
