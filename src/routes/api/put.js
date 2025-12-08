const { Fragment } = require("../../model/fragment");
const logger = require("../../logger");

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    // Check if the Content-Type matches
    if (req.get("Content-Type") !== fragment.type) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Content-Type does not match fragment type",
        },
      });
    }

    await fragment.setData(req.body);
    logger.debug({ fragment }, "Fragment updated");

    res.status(200).json({
      status: "ok",
      fragment: fragment,
    });
  } catch {
    res.status(404).json({
      status: "error",
      error: {
        code: 404,
        message: "not found",
      },
    });
  }
};
