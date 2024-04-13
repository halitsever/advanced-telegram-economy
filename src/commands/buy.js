const { getString, getCommandName } = require("../lang/index");
const { Composer } = require("telegraf");
const { isUserHaveThisProduct } = require("../modules/product.module");
const { increaseBankAmount } = require("../modules/bank.module");
const { getUser, setUser } = require("../modules/user.module");
const database = require("../database/index.js");
const productEntity = require("../database/entity/product.entity.js");
const productRepository = database.getRepository(productEntity);
const products = require("../products.js");
const logger = require("../logger");

module.exports = Composer.command(getCommandName("buy"), async (ctx) => {
  try {
    const option = ctx?.update?.message?.text.split(" ")[1];
    const user = await getUser({ id: ctx?.update?.message?.from?.id });
    if (!user) return ctx.reply(getString("DATABASE_LOCK"));

    if (!option) return ctx.reply("🔴 Girdiğiniz ürün idsi geçerli değil!");
    let selectedProduct;
    for (let [index, product] of products.entries()) {
      if (index + 1 == option) selectedProduct = product;
    }

    if (!selectedProduct) return ctx.reply(getString("PRODUCT_NOT_AVAILABLE"));

    if (await isUserHaveThisProduct({ id: ctx?.update?.message?.from?.id, productName: selectedProduct.code })) return ctx.reply(getString("ALREADY_BOUGHT"));
    if (user?.balance < selectedProduct?.price || !user?.balance) return ctx.reply(getString("NO_BALANCE"));

    await increaseBankAmount({ ctx, increaseAmount: selectedProduct?.price });

    user.balance = user?.balance - selectedProduct?.price;

    const productItem = {
      product: selectedProduct.code,
      user: user.id,
    };

    await productRepository.save(productItem);
    await setUser({ user });
    return ctx.reply(getString("BUY_PRODUCT_SUCCESS"));
  } catch (err) {
    logger.error(err);
    return ctx.reply(getString("DATABASE_LOCK"));
  }
});
