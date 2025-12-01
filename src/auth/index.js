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
  if (process.env.AWS_COGNITO_POOL_ID && authHeader && authHeader.startsWith("Bearer ")) {
    passport.authenticate(cognito.name, { session: false })(req, res, next);
  } else {
    // Otherwise, use Basic Auth
    passport.authenticate(basic.name, { session: false })(req, res, next);
  }
};
