const { Composer } = require("telegraf");
const { getString, getCommandName, getLanguage } = require("../lang/index");
const products = require("../products");

module.exports = Composer.command(getCommandName("market"), async (ctx) => {
  let productsAsText = "\n";
  products.forEach((el, index) => {
    productsAsText = productsAsText + `*${index + 1}*-${el.name[getLanguage()]}: ${el.price} ${el.currency}\n`;
  });
  await ctx.reply(getString("DATABASE_LOCK"));
  await ctx.replyWithMarkdown(`🏬 Market ${productsAsText}\n${getString("HOW_TO_BUY")}\n\n${getString("EARN_MONEY_TIP")}\n\n${getString("CURRENCY_INFO")}`);
});
