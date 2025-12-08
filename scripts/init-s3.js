const { S3Client, CreateBucketCommand } = require("@aws-sdk/client-s3");

async function init() {
  const client = new S3Client({
    endpoint: "http://localhost:4566",
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
  });

  const params = {
    Bucket: "fragments",
  };

  try {
    console.log("Creating S3 bucket 'fragments'...");
    const command = new CreateBucketCommand(params);
    await client.send(command);
    console.log("✅ Bucket created successfully.");
  } catch (err) {
    if (err.name === "BucketAlreadyOwnedByYou" || err.name === "BucketAlreadyExists") {
      console.log("⚠️ Bucket already exists.");
    } else {
      console.error("❌ Error creating bucket:", err);
    }
  }
}

init();
