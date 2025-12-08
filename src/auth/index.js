const crypto = require("crypto");
const passport = require("passport");
const basic = require("./basic-auth");
const cognito = require("./cognito");
const logger = require("../logger");

// Register strategies
passport.use(basic.name, basic.strategy);
passport.use(cognito.name, cognito.strategy);

module.exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // If we have an Authorization header with 'Bearer', use Cognito
  const strategyName = (process.env.AWS_COGNITO_POOL_ID && authHeader && authHeader.startsWith("Bearer ")) 
    ? cognito.name 
    : basic.name;

  logger.info({ strategyName, hasAuthHeader: !!authHeader }, "Authenticating request");

  passport.authenticate(strategyName, { session: false }, (err, user) => {
    if (err) {
      logger.error({ err }, "Authentication error");
    }
    if (!user) {
      logger.warn("Authentication failed: no user");
    }

    if (err || !user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // Convert username/email to SHA256 hex (required ownerId format)
    // Basic Auth returns { username: ... }, Cognito returns { email: ... }
    const username = user.username || user.email;
    req.user = crypto.createHash("sha256").update(username).digest("hex");

    next();
  })(req, res, next);
};
