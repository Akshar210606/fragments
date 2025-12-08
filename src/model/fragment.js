// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require("crypto");

// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require("content-type");

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require("./data");

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // Validate required fields
    if (!ownerId) throw new Error("ownerId is required");
    if (!type) throw new Error("type is required");

    // Validate size
    if (typeof size !== "number") throw new Error("size must be a number");
    if (size < 0) throw new Error("size must be >= 0");

    // Validate supported type
    if (!Fragment.isSupportedType(type)) throw new Error("unsupported type");

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size || 0;
    this.created = created || new Date().toISOString();
    this.updated = updated || this.created;
  }

  /**
   * Get all fragments (id or full) for the given user
   */
  static async byUser(ownerId, expand = false, type) {
    const fragments = await listFragments(ownerId, expand, type);

    if (expand) {
      return fragments.map((serialized) => {
        const obj =
          typeof serialized === "string" ? JSON.parse(serialized) : serialized;
        return new Fragment(obj);
      });
    }

    return fragments || [];
  }

  /**
   * Gets a fragment for the user by the given id.
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) throw new Error("not found");

    const obj = typeof fragment === "string" ? JSON.parse(fragment) : fragment;
    return new Fragment(obj);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves updated metadata
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Get fragment data
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set raw data + update metadata
   */
  async setData(data) {
    if (!data || !Buffer.isBuffer(data)) {
      throw new Error("data must be a Buffer");
    }

    // Store fragment data
    await writeFragmentData(this.ownerId, this.id, data);

    // Update metadata
    this.size = data.length;
    this.updated = new Date().toISOString();

    // Store metadata (IMPORTANT)
    await writeFragment(this);
  }

  /**
   * Get mime type without parameters
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  get isText() {
    return this.mimeType.startsWith("text/");
  }

  get formats() {
    return [this.mimeType];
  }

  /**
   * Returns true if we support the Content-Type
   */
  static isSupportedType(value) {
    if (!value || typeof value !== "string") return false;

    try {
      // Parse only the type part (e.g., text/plain or application/json)
      const { type } = contentType.parse(value);

      const baseType = type.split(";")[0].trim();

      return baseType === "application/json" || baseType.startsWith("text/");
    } catch {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;
