const { Composer } = require("telegraf");
const { getCommandName } = require("../lang");

module.exports = Composer.command(getCommandName("payback"), async (ctx) => {
  return ctx.scene.enter("payback");
});
