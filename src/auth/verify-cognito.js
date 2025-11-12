// src/auth/verify-cognito.js
const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_COGNITO_POOL_ID}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

async function verifyCognitoToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        audience: process.env.AWS_COGNITO_CLIENT_ID,
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            email: decoded.email,
            sub: decoded.sub,
          });
        }
      }
    );
  });
}

module.exports = { verifyCognitoToken };
