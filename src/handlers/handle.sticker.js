const { isUserHaveThisProduct } = require("../modules/product.module");
const { getString } = require("../lang/index");
const logger = require("../logger");

const handleSticker = async (ctx) => {
  try {
    if (await isUserHaveThisProduct({ id: ctx?.update?.message?.from?.id, productName: "STICKER_SHARE_PASS" })) return;
    const isMessageIncludesSticker = ctx?.update?.message?.sticker;

    if (isMessageIncludesSticker) {
      ctx.reply(getString("STICKER_FORBIDDEN"));
      return ctx.deleteMessage();
    }
  } catch (err) {
    logger.error(err);
  }
};

module.exports = handleSticker;
