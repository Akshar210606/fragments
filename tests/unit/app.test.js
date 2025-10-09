<<<<<<< HEAD
// tests/unit/app.test.js
const request = require("supertest");
const app = require("../../src/app");

describe("App error handler", () => {
  test("returns 500 JSON error payload when a route throws", async () => {
    // Add a test-only route that throws
    app.get("/__boom__", () => {
      throw new Error("boom");
    });

    const res = await request(app).get("/__boom__");
    expect(res.statusCode).toBe(500);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body.status).toBe("error");
    expect(res.body.error).toBeDefined();
    expect(typeof res.body.error.message).toBe("string");
    expect(typeof res.body.error.code).toBe("number");
  });
});
=======
//pass the test by making sure 404s are handled correctly for the app.js file
const request = require("supertest");
const app = require("../../src/app");

describe("app 404 handler", () => {
  test("unknown routes return 404", async () => {
    const res = await request(app).get("/route does not exit at all");

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("error");
    expect(res.body.error.code).toBe(404);
  });
});
// tests/unit/app.test.js
jest.mock("../../src/middleware/auth", () => ({
  authenticate: jest.fn(() => (req, res, next) => next()),
}));
>>>>>>> dcb2e7b (Assignment 1)
