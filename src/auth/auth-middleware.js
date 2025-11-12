// src/auth/auth-middleware.js
const passport = require("passport");
const hash = require("../hash");

module.exports = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(401).json({
          status: "error",
          error: "Unauthorized",
        });
      }

      // user may be an object like { user: 'email' }
      const email = typeof user === "string" ? user : user.user;
      req.user = hash(email);

      return next();
    })(req, res, next);
  };
};
