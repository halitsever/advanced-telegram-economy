const { Composer } = require("telegraf");
const { getUserProduct } = require("../modules/product.module");
const products = require("../products");
const { getString, getCommandName, getLanguage } = require("../lang");

/** Owned rows store the product code, so look up the name shown in the market. */
const productName = (code) => products.find((product) => product.code === code)?.name[getLanguage()] ?? code;

module.exports = Composer.command(getCommandName("items"), async (ctx) => {
  const owned = await getUserProduct({
    id: ctx?.update?.message?.from?.id,
  });
  if (!owned.length) return ctx.reply(getString("ITEMS_EMPTY"));
  return ctx.reply(owned.map((el) => `✅ ${productName(el.product)}`).join("\n"));
});
