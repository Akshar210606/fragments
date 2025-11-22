// XXX: temporary use of memory-db until we add DynamoDB
const MemoryDB = require("../memory/memory-db");

// Create two in-memory databases: one for fragment metadata and the other for raw data
const metadata = new MemoryDB();

const s3Client = require("./s3Client");
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

// ------------------------------------------------------------
// Write fragment metadata (unchanged - still memory DB)
// ------------------------------------------------------------
function writeFragment(fragment) {
  const serialized = JSON.stringify(fragment);
  return metadata.put(fragment.ownerId, fragment.id, serialized);
}

// ------------------------------------------------------------
// Read fragment metadata (unchanged)
// ------------------------------------------------------------
async function readFragment(ownerId, id) {
  const serialized = await metadata.get(ownerId, id);
  return typeof serialized === "string" ? JSON.parse(serialized) : serialized;
}

// ------------------------------------------------------------
// Write fragment DATA to S3 (NEW REPLACEMENT)
// ------------------------------------------------------------
async function writeFragmentData(ownerId, id, data) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    console.error({ err, Bucket, Key }, "Error uploading fragment data to S3");
    throw new Error("unable to upload fragment data");
  }
}

// ------------------------------------------------------------
// Convert a stream into a Buffer (helper function)
// ------------------------------------------------------------
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });

// ------------------------------------------------------------
// Read fragment DATA from S3 (NEW REPLACEMENT)
// ------------------------------------------------------------
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new GetObjectCommand(params);

  try {
    const data = await s3Client.send(command);
    return streamToBuffer(data.Body); // returns Buffer
  } catch (err) {
    const { Bucket, Key } = params;
    console.error(
      { err, Bucket, Key },
      "Error streaming fragment data from S3"
    );
    throw new Error("unable to read fragment data");
  }
}

// ------------------------------------------------------------
// List fragment IDs or full metadata
// ------------------------------------------------------------
async function listFragments(ownerId, expand = false) {
  const fragments = await metadata.query(ownerId);

  if (expand || !fragments) {
    return fragments;
  }

  return fragments.map((fragment) => JSON.parse(fragment).id);
}

// ------------------------------------------------------------
// Delete fragment (metadata + S3 object)
// ------------------------------------------------------------
async function deleteFragment(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new DeleteObjectCommand(params);

  try {
    // 1. Delete S3 data
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    console.error({ err, Bucket, Key }, "Error deleting fragment data from S3");
    throw new Error("unable to delete fragment data");
  }

  // 2. Delete metadata from MemoryDB
  return metadata.del(ownerId, id);
}

// ------------------------------------------------------------
// Export functions
// ------------------------------------------------------------
module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
