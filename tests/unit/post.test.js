const request = require("supertest");
const app = require("../../src/index");

describe("POST /v1/fragments", () => {
  test("creates a text/plain fragment and returns 201 with Location header", async () => {
    const res = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/plain")
      .send("hello world");

    expect(res.status).toBe(201);
    expect(res.headers).toHaveProperty("location");
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body.fragment).toHaveProperty("id");
  });

  test("returns 415 for unsupported content type", async () => {
    const res = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "application/octet-stream")
      .send(Buffer.from([1, 2, 3]));

    expect(res.status).toBe(415);
  });
});
