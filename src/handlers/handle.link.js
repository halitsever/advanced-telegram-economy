const { isUserHaveThisProduct } = require("../modules/product.module");
const { getString } = require("../lang/index");
const logger = require("../logger");

const handleUrl = async (ctx) => {
  try {
    if (await isUserHaveThisProduct({ id: ctx?.update?.message?.from?.id, productName: "LINK_SHARE_PASS" })) return;

    const messageContent = ctx?.update?.message?.text;
    const urlRegex = /\b(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+)\.(?:com|org|net)\b/g;
    const isIncludesLink = messageContent ? messageContent.match(urlRegex) : null;

    if (isIncludesLink) {
      ctx.reply(getString("URL_FORBIDDEN"));
      return ctx.deleteMessage();
    }
  } catch (err) {
    logger.error(err);
  }
};
module.exports = handleUrl;
