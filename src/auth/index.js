// src/auth/index.js
const passport = require("passport");
const authorize = require("./auth-middleware");

const STRATEGY = (process.env.AUTH_STRATEGY || "basic").toLowerCase();
let strategyModule;

if (STRATEGY === "cognito") {
  console.log("✅ Using Cognito authentication strategy");
  strategyModule = require("./cognito"); // must export { name, strategy }
} else {
  console.log("✅ Using Basic authentication strategy");
  strategyModule = require("./basic-auth"); // must export { name, strategy }
}

// Register strategy with its name
passport.use(strategyModule.name, strategyModule.strategy);

// Export the authenticate() middleware using our custom wrapper
module.exports = {
  authenticate: authorize(strategyModule.name),
};
