// src/model/data/index.js

// Determine which backend to use
const backend =
  process.env.STORAGE_BACKEND || (process.env.AWS_REGION ? "aws" : "memory");

switch (backend) {
  case "memory":
    console.log("✅ Using in-memory backend");
    module.exports = require("./memory");
    break;

  case "local":
    console.log(
      `✅ Using local filesystem backend: ${process.env.FRAGMENTS_DATA_DIR || "/tmp/fragments"}`
    );
    module.exports = require("./local");
    break;

  case "aws":
    console.log("✅ Using AWS backend (not yet implemented)");
    module.exports = require("./aws");
    break;

  default:
    throw new Error(`❌ Unknown storage backend: ${backend}`);
}
