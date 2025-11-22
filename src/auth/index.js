const crypto = require("crypto");
const passport = require("passport");
const basic = require("./basic-auth");

// Register strategy
passport.use(basic.name, basic.strategy);

function authenticate(req, res, next) {
  passport.authenticate("basic", { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // Convert username/email to SHA256 hex (required ownerId format)
    req.user = crypto.createHash("sha256").update(user.username).digest("hex");

    next();
  })(req, res, next);
}

module.exports = { authenticate };
