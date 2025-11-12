// src/routes/api/get.js

const { Fragment } = require("../../model/fragment");

module.exports = async (req, res) => {
  try {
    const expand = req.query.expand === "1";
    const fragments = await Fragment.byUser(req.user, expand);

    res.status(200).json({
      status: "ok",
      fragments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      error: { code: 500, message: "server error" },
    });
  }
};
