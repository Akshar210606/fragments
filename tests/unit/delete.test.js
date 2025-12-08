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

describe("DELETE /v1/fragments/:id", () => {
  const userEmail = "user1@email.com";
  const fragmentId = "test-fragment-id";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("authenticated user deletes a fragment", async () => {
    Fragment.delete.mockResolvedValue();

    const res = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(Fragment.delete).toHaveBeenCalled();
  });

  test("authenticated user gets 404 when deleting non-existent fragment", async () => {
    Fragment.delete.mockRejectedValue(new Error("not found"));

    const res = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, "password123");

    expect(res.statusCode).toBe(404);
  });
});
