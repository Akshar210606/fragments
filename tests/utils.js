/**
/**
 * Creates a test user for authentication tests.
 * This should match the Basic Auth user format used in tests.
 */
function createTestUser() {
  return {
    username: "user1@email.com",
    password: "password",
  };
}

/**
 * Creates an HTTP Basic Auth header for a given test user.
 * @param {{ username: string, password: string }} user
 * @returns {string}
 */
function authHeader(user) {
  // ✅ Fix template literal syntax
  const token = Buffer.from(`${user.username}:${user.password}`).toString(
    "base64"
  );
  return `Basic ${token}`;
}

module.exports = { createTestUser, authHeader };
