const { isUserHaveThisProduct } = require("../modules/product.module");
const { getString } = require("../lang/index");
const logger = require("../logger");

const handlePhoto = async (ctx) => {
  try {
    if (await isUserHaveThisProduct({ id: ctx?.update?.message?.from?.id, productName: "IMAGE_SHARE_PASS" })) return;
    const isMessageIncludesPhoto = ctx?.update?.message?.photo;

    if (isMessageIncludesPhoto) {
      ctx.reply(getString("IMAGE_FORBIDDEN"));
      return ctx.deleteMessage();
    }
  } catch (err) {
    logger.error(err);
  }
};

module.exports = handlePhoto;
