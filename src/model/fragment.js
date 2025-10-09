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
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);

    // If expand is true, the underlying data backend returns serialized
    // fragment objects (strings). Parse and return Fragment instances.
    if (expand) {
      // fragments may be an array of serialized JSON strings
      return fragments.map((serialized) => {
        const obj =
          typeof serialized === "string" ? JSON.parse(serialized) : serialized;
        return new Fragment(obj);
      });
    }

    // If not expanded, the backend returns an array of ids (or an empty array)
    return fragments || [];
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) throw new Error("not found");
    // fragment may already be an object
    const obj = typeof fragment === "string" ? JSON.parse(fragment) : fragment;
    return new Fragment(obj);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  save() {
    // Update the updated timestamp
    this.updated = new Date().toISOString();
    // Persist metadata to the DB
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    // Validate input
    if (!data || !Buffer.isBuffer(data))
      throw new Error("data must be a Buffer");

    // Write raw data
    await writeFragmentData(this.ownerId, this.id, data);

    // Update metadata size and updated timestamp
    this.size = data.length;
    this.updated = new Date().toISOString();

    // Persist metadata
    await writeFragment(this);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType && this.mimeType.startsWith("text/");
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    // For now we only support returning the base mime type
    return [this.mimeType];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    if (!value || typeof value !== "string") return false;
    try {
      const { type } = contentType.parse(value);
      // Only support text/* for now
      return type.startsWith("text/");
    } catch {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;
