const request = require("supertest");
const app = require("../../src/app");
const { Fragment } = require("../../src/model/fragment");

// Mock the Fragment model
jest.mock("../../src/model/fragment");

// Mock sharp
jest.mock("sharp", () => () => ({
  toFormat: () => ({
    toBuffer: () => Buffer.from("fake-png-data"),
  }),
}));

// Mock the auth middleware
jest.mock("../../src/auth", () => ({
  authenticate: (req, res, next) => {
    req.user = "test-owner"; // Set the user directly
    next();
  },
}));

describe("GET /v1/fragments/:id", () => {
  const userEmail = "user1@email.com";
  const fragmentId = "test-fragment-id";
  const fragmentData = Buffer.from("Hello World");

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test("authenticated user gets a fragment by id", async () => {
    const fragment = {
      id: fragmentId,
      ownerId: "test-owner",
      type: "text/plain",
      getData: jest.fn().mockResolvedValue(fragmentData),
      mimeType: "text/plain",
      formats: ["text/plain"],
    };
    Fragment.byId.mockResolvedValue(fragment);

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toEqual(expect.stringContaining("text/plain"));
    expect(res.text).toEqual("Hello World");
  });

  test("authenticated user gets fragment converted to .txt", async () => {
    const fragment = {
      id: fragmentId,
      ownerId: "test-owner",
      type: "application/json",
      getData: jest.fn().mockResolvedValue(Buffer.from('{"foo":"bar"}')),
    };
    Fragment.byId.mockResolvedValue(fragment);

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toEqual(expect.stringContaining("text/plain"));
    expect(res.text).toEqual('{"foo":"bar"}');
  });

  test("authenticated user gets fragment converted to .json", async () => {
    const fragment = {
      id: fragmentId,
      ownerId: "test-owner",
      type: "application/json",
      getData: jest.fn().mockResolvedValue(Buffer.from('{"foo":"bar"}')),
    };
    Fragment.byId.mockResolvedValue(fragment);

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.json`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toEqual(expect.stringContaining("application/json"));
    expect(res.body).toEqual({ foo: "bar" });
  });

  test("authenticated user gets fragment converted to .md", async () => {
    const fragment = {
      id: fragmentId,
      ownerId: "test-owner",
      type: "text/markdown",
      getData: jest.fn().mockResolvedValue(Buffer.from("# Hello")),
    };
    Fragment.byId.mockResolvedValue(fragment);

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.md`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toEqual(expect.stringContaining("text/markdown"));
    expect(res.text).toEqual("# Hello");
  });

  test("authenticated user gets fragment converted to .png", async () => {
    const fragment = {
      id: fragmentId,
      ownerId: "test-owner",
      type: "image/jpeg",
      getData: jest.fn().mockResolvedValue(Buffer.from("fake-image-data")),
    };
    Fragment.byId.mockResolvedValue(fragment);

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.png`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toEqual(expect.stringContaining("image/png"));
  });

  test("authenticated user gets 415 for unsupported extension", async () => {
    const fragment = {
      id: fragmentId,
      ownerId: "test-owner",
      type: "text/plain",
      getData: jest.fn().mockResolvedValue(Buffer.from("data")),
    };
    Fragment.byId.mockResolvedValue(fragment);

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.unsupported`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(415);
  });

  test("authenticated user gets 415 for invalid image conversion", async () => {
    const fragment = {
      id: fragmentId,
      ownerId: "test-owner",
      type: "text/plain", // Not an image
      getData: jest.fn().mockResolvedValue(Buffer.from("data")),
    };
    Fragment.byId.mockResolvedValue(fragment);

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.png`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(415);
  });

  test("authenticated user gets a 404 for non-existent fragment", async () => {
    Fragment.byId.mockRejectedValue(new Error("not found"));

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(404);
  });

  test("authenticated user gets fragment converted to .html", async () => {
    const markdownData = Buffer.from("# Hello");
    const fragment = {
      id: fragmentId,
      ownerId: "test-owner",
      type: "text/markdown",
      getData: jest.fn().mockResolvedValue(markdownData),
    };
    Fragment.byId.mockResolvedValue(fragment);

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toEqual(expect.stringContaining("text/html"));
    expect(res.text).toContain("<h1>Hello</h1>");
  });

  test("authenticated user gets 415 for unsupported conversion", async () => {
    const fragment = {
      id: fragmentId,
      ownerId: "test-owner",
      type: "text/plain",
      getData: jest.fn().mockResolvedValue(fragmentData),
    };
    Fragment.byId.mockResolvedValue(fragment);

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(415);
  });
});
