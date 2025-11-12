const express = require("express");
const router = express.Router();

router.get("/fragments", require("./get"));
router.post("/fragments", require("./post"));

router.get("/fragments/:id/info", require("./get-info"));
router.get("/fragments/:id.:ext", require("./get-convert"));
router.get("/fragments/:id", require("./get-id"));

module.exports = router;
