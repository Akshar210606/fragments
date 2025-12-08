const request = require("supertest");
const app = require("../../src/app");
const { Fragment } = require("../../src/model/fragment");

jest.mock("../../src/model/fragment");

// Mock the auth middleware
jest.mock("../../src/auth", () => ({
  authenticate: (req, res, next) => {
    req.user = "test-owner";
    next();
  },
}));

describe("PUT /v1/fragments/:id", () => {
  const userEmail = "user1@email.com";
  const fragmentId = "test-fragment-id";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("authenticated user updates a fragment", async () => {
    const fragment = {
      id: fragmentId,
      ownerId: "test-owner",
      type: "text/plain",
      setData: jest.fn().mockResolvedValue(),
    };
    Fragment.byId.mockResolvedValue(fragment);

    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, "password123")
      .set("Content-Type", "text/plain")
      .send("Updated content");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(fragment.setData).toHaveBeenCalled();
  });

  test("authenticated user cannot update fragment with mismatched type", async () => {
    const fragment = {
      id: fragmentId,
      ownerId: "test-owner",
      type: "text/plain",
    };
    Fragment.byId.mockResolvedValue(fragment);

    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, "password123")
      .set("Content-Type", "application/json")
      .send('{"foo":"bar"}');

    expect(res.statusCode).toBe(400);
  });

  test("authenticated user gets 404 for non-existent fragment", async () => {
    Fragment.byId.mockRejectedValue(new Error("not found"));

    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, "password123")
      .set("Content-Type", "text/plain")
      .send("content");

    expect(res.statusCode).toBe(404);
  });
});
