<<<<<<< HEAD
// src/auth/cognito.js
=======
// src/auth.js
>>>>>>> dcb2e7b (Assignment 1)

// Configure a JWT token strategy for Passport based on
// Identity Token provided by Cognito. The token will be
// parsed from the Authorization header (i.e., Bearer Token).

<<<<<<< HEAD
const passport = require("passport");
const BearerStrategy = require("passport-http-bearer").Strategy;
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const logger = require("../logger");
=======
//const passport = require('passport');
const BearerStrategy = require("passport-http-bearer").Strategy;
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const logger = require("../logger");
const authorize = require("./auth-middleware");
>>>>>>> dcb2e7b (Assignment 1)

// We expect AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID to be defined.
if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  throw new Error(
    "missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID"
  );
}

<<<<<<< HEAD
// Log that we're using Cognito
logger.info("Using AWS Cognito for auth");

=======
>>>>>>> dcb2e7b (Assignment 1)
// Create a Cognito JWT Verifier, which will confirm that any JWT we
// get from a user is valid and something we can trust. See:
// https://github.com/awslabs/aws-jwt-verify#cognitojwtverifier-verify-parameters
const jwtVerifier = CognitoJwtVerifier.create({
<<<<<<< HEAD
=======
  // These variables must be set in the .env
>>>>>>> dcb2e7b (Assignment 1)
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  // We expect an Identity Token (vs. Access Token)
  tokenUse: "id",
});

<<<<<<< HEAD
// At startup, download and cache the public keys (JWKS) we need in order to
// verify our Cognito JWTs, see https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
// You can try this yourself using:
// curl https://cognito-idp.us-east-1.amazonaws.com/<user-pool-id>/.well-known/jwks.json
jwtVerifier
  .hydrate()
  .then(() => {
    logger.info("Cognito JWKS cached");
=======
logger.info("Configured to use AWS Cognito for Authorization");

// At startup, download and cache the public keys (JWKS) we need in order to
// verify our Cognito JWTs, see https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
jwtVerifier
  .hydrate()
  .then(() => {
    logger.info("Cognito JWKS successfully cached");
>>>>>>> dcb2e7b (Assignment 1)
  })
  .catch((err) => {
    logger.error({ err }, "Unable to cache Cognito JWKS");
  });

module.exports.strategy = () =>
  // For our Passport authentication strategy, we'll look for the Bearer Token
  // in the Authorization header, then verify that with our Cognito JWT Verifier.
  new BearerStrategy(async (token, done) => {
    try {
      // Verify this JWT
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, "verified user token");

<<<<<<< HEAD
      // Create a user, but only bother with their email
=======
      // Create a user, but only bother with their email. We could
      // also do a lookup in a database, but we don't need it.
>>>>>>> dcb2e7b (Assignment 1)
      done(null, user.email);
    } catch (err) {
      logger.error({ err, token }, "could not verify token");
      done(null, false);
    }
  });
<<<<<<< HEAD

module.exports.authenticate = () =>
  passport.authenticate("bearer", { session: false });
=======
module.exports.authenticate = () => authorize("bearer");
>>>>>>> dcb2e7b (Assignment 1)
