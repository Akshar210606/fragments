const passport = require("passport");
const { BasicStrategy } = require("passport-http");
const authorize = require("./auth-middleware");

passport.use(
  new BasicStrategy((username, password, done) => {
    if (
      username === process.env.BASIC_USER &&
      password === process.env.BASIC_PASS
    ) {
      return done(null, { user: username });
    }
    return done(null, false);
  })
);

module.exports.authenticate = () => authorize("basic");
