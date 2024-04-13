const { isUserHaveThisProduct } = require("../modules/product.module");
const { getString } = require("../lang/index");
const logger = require("../logger");

const handleBadWords = async (ctx) => {
  try {
    if (await isUserHaveThisProduct({ id: ctx?.update?.message?.from?.id, productName: "BADWORD_PASS" })) return;

    const messageContent = ctx?.update?.message?.text;
    const urlRegex =
      /\b(?:aq|o[çc]|mq|k0yar1m|4mk|s1k|bagirta|sikcm|porna|porno|amedekoyim|sokacam|sokarım|sokarim|anani|siktim|amk|orospu|amini|siktir|sikim|yarrak|seks|çocuğu|ananı|ibne|piç|yavşak|m.q|a.q|a.m.k|mk|s[iı]ker[iım]+)\b/g;
    const isIncludesBadWords = messageContent ? messageContent.match(urlRegex) : null;

    if (isIncludesBadWords) {
      ctx.reply(getString("BADWORD_FORBIDDEN"));
      return ctx.deleteMessage();
    }
  } catch (err) {
    logger.error(err);
  }
};

module.exports = handleBadWords;
