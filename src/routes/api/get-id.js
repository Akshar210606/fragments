const express = require("express");
const router = express.Router();
const { Fragment } = require("../../model/fragment");
const path = require("path");
const markdownIt = require("markdown-it");
const sharp = require("sharp");

const md = markdownIt();

router.get("/:id", async (req, res) => {
  try {
    // Parse the ID and extension
    // If the ID is "123.html", name="123", ext=".html"
    // If the ID is "123", name="123", ext=""
    const { name: id, ext } = path.parse(req.params.id);

    const fragment = await Fragment.byId(req.user, id);
    let data = await fragment.getData();

    // If an extension is provided, try to convert
    if (ext) {
      const desiredExt = ext.toLowerCase();
      const currentType = fragment.type;

      // Text conversions
      if (desiredExt === ".html") {
        if (currentType === "text/markdown") {
          data = md.render(data.toString());
          res.setHeader("Content-Type", "text/html");
        } else if (currentType === "text/html") {
          res.setHeader("Content-Type", "text/html");
        } else {
          return res.status(415).json({
            status: "error",
            error: { code: 415, message: "Unsupported conversion" },
          });
        }
      } else if (desiredExt === ".txt") {
        if (currentType.startsWith("text/") || currentType === "application/json") {
          res.setHeader("Content-Type", "text/plain");
          // For JSON, we might want to stringify if it's not already a string/buffer representation
          // But data is a Buffer.
        } else {
           return res.status(415).json({
            status: "error",
            error: { code: 415, message: "Unsupported conversion" },
          });
        }
      } else if (desiredExt === ".md") {
          if (currentType === "text/markdown") {
              res.setHeader("Content-Type", "text/markdown");
          } else {
               return res.status(415).json({
                status: "error",
                error: { code: 415, message: "Unsupported conversion" },
              });
          }
      } else if (desiredExt === ".json") {
          if (currentType === "application/json") {
              res.setHeader("Content-Type", "application/json");
          } else {
               return res.status(415).json({
                status: "error",
                error: { code: 415, message: "Unsupported conversion" },
              });
          }
      }
      // Image conversions
      else if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"].includes(desiredExt)) {
        if (!currentType.startsWith("image/")) {
          return res.status(415).json({
            status: "error",
            error: { code: 415, message: "Unsupported conversion" },
          });
        }

        try {
          // Convert using sharp
          const format = desiredExt.substring(1) === "jpg" ? "jpeg" : desiredExt.substring(1);
          data = await sharp(data).toFormat(format).toBuffer();
          res.setHeader("Content-Type", `image/${format}`);
        } catch {
          return res.status(415).json({
            status: "error",
            error: { code: 415, message: "Unsupported conversion" },
          });
        }
      } else {
        // Unknown extension
        return res.status(415).json({
          status: "error",
          error: { code: 415, message: "Unsupported extension" },
        });
      }
    } else {
      // No extension, return original type
      res.setHeader("Content-Type", fragment.type);
    }

    res.status(200).send(data);
  } catch {
    res.status(404).json({
      status: "error",
      error: { code: 404, message: "not found" },
    });
  }
});

module.exports = router;
