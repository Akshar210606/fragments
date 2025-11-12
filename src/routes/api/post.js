const express = require("express");
const contentType = require("content-type");
const { Fragment } = require("../../model/fragment");
const {
  createErrorResponse,
  createSuccessResponse,
} = require("../../response");

// Raw body for only supported types, up to 5MB
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: "5mb",
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });

module.exports = [
  rawBody(),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body)) {
      return res
        .status(415)
        .json(createErrorResponse(415, "unsupported content type"));
    }

    const { type } = contentType.parse(req);
    if (!Fragment.isSupportedType(type)) {
      return res.status(415).json(createErrorResponse(415, "unsupported type"));
    }

    try {
      // ✅ FIX: Always convert user ID to string
      // Cognito attaches user info under req.user (an object with sub, email, etc.)
      const ownerId = String(req.user?.sub || req.user?.email || req.user);

      const frag = new Fragment({ ownerId, type });
      await frag.setData(req.body);

      // Build absolute Location header
      const host = req.headers.host;
      const base =
        process.env.API_URL ||
        (host ? `http://${host}` : "http://localhost:8080");

      const location = `${base.replace(/\/$/, "")}/v1/fragments/${frag.id}`;

      res.setHeader("Location", location);
      res.status(201).json(
        createSuccessResponse({
          id: frag.id,
          fragment: {
            id: frag.id,
            ownerId: frag.ownerId,
            type: frag.type,
            size: frag.size,
            created: frag.created,
            updated: frag.updated,
          },
        })
      );
    } catch (e) {
      console.error("❌ Error creating fragment:", e);
      res
        .status(500)
        .json(createErrorResponse(500, e.message || "server error"));
    }
  },
];
