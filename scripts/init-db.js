const { DynamoDBClient, CreateTableCommand } = require("@aws-sdk/client-dynamodb");

async function init() {
  const client = new DynamoDBClient({
    endpoint: "http://localhost:8000",
    region: "us-east-1",
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
  });

  const params = {
    TableName: "fragments",
    AttributeDefinitions: [
      { AttributeName: "ownerId", AttributeType: "S" },
      { AttributeName: "id", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "ownerId", KeyType: "HASH" },
      { AttributeName: "id", KeyType: "RANGE" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 5,
    },
  };

  try {
    console.log("Creating DynamoDB table 'fragments'...");
    const command = new CreateTableCommand(params);
    await client.send(command);
    console.log("✅ Table created successfully.");
  } catch (err) {
    if (err.name === "ResourceInUseException") {
      console.log("⚠️ Table already exists.");
    } else {
      console.error("❌ Error creating table:", err);
    }
  }
}

init();
