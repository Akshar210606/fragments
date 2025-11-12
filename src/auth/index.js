// src/auth/index.js
const passport = require("passport");

const STRATEGY = (process.env.AUTH_STRATEGY || "basic").toLowerCase();
let strategyModule;
let strategyName;

if (STRATEGY === "cognito") {
  console.log("✅ Using Cognito authentication strategy");
  strategyModule = require("./cognito");
  strategyName = "bearer";
} else {
  console.log("✅ Using Basic authentication strategy");
  strategyModule = require("./basic-auth");
  strategyName = "basic";
}

// ✅ Register strategy instance with Passport
passport.use(strategyName, strategyModule.strategy);

// ✅ Export middleware
module.exports = {
  authenticate: () => passport.authenticate(strategyName, { session: false }),
};
