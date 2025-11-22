// src/model/data/index.js

// If the environment sets an AWS Region, we'll use AWS backend
// services (S3, DynamoDB); otherwise, we'll use an in-memory db.
module.exports = process.env.AWS_REGION
  ? require("./aws")
  : require("./memory"); // Determine which backend to use
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
    console.log("✅ Using AWS backend");
    module.exports = require("./aws");
    break;

  default:
    throw new Error(`❌ Unknown storage backend: ${backend}`);
}
