// src/auth/auth-middleware.js

const passport = require("passport");
const crypto = require("crypto");

/**
 * Wrap passport authentication with our own logic for converting the
 * authenticated user into a hashed userId (req.user.id).
 */
module.exports = (strategyName) => {
  return (req, res, next) => {
    passport.authenticate(strategyName, { session: false }, (err, user) => {
      if (err || !user) {
        // Authentication failed
        return res.status(401).json({
          status: "error",
          error: { code: 401, message: "Unauthorized" },
        });
      }

      // SUCCESS – convert username/email → hashed ownerId
      const userId = crypto
        .createHash("sha256")
        .update(user.user)
        .digest("hex");

      req.user = { id: userId };

      return next();
    })(req, res, next);
  };
};
