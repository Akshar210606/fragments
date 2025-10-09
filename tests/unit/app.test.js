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
