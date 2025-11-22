// src/routes/api/get-convert.js

const MarkdownIt = require("markdown-it");
const md = new MarkdownIt();
const { Fragment } = require("../../model/fragment");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ext = req.params.ext.replace(".", "");

    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();

    // MarkDown → HTML conversion support
    if (fragment.mimeType === "text/markdown" && ext === "html") {
      const html = md.render(data.toString());
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    }

    return res.status(415).json({
      status: "error",
      error: { code: 415, message: "conversion not supported" },
    });
  } catch {
    res.status(404).json({
      status: "error",
      error: { code: 404, message: "not found" },
    });
  }
};
