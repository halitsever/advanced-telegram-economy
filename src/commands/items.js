const { Composer } = require("telegraf");
const { getUserProduct } = require("../modules/product.module");
const products = require("../products");
const { getCommandName } = require("../lang");

module.exports = Composer.command(getCommandName("items"), async (ctx) => {
  let productString = "";
  const products = await getUserProduct({
    id: ctx?.update?.message?.from?.id,
  });
  if (!products) return ctx.reply(strings.DATABASE_LOCK);
  // TODO: This not returning the original names of the product
  products.forEach((el) => {
    productString = productString + `✅ ${el.product}\n`;
  });
  return ctx.reply(productString);
});
