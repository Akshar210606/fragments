const express = require("express");
const router = express.Router();

router.use("/fragments", require("./post"));
router.use("/fragments", require("./get"));
router.use("/fragments", require("./get-id"));
module.exports = router;
