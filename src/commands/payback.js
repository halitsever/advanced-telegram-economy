const { Composer } = require("telegraf");
const { getCommandName } = require("../lang");

module.exports = Composer.command(getCommandName("salary"), async (ctx) => {
  return ctx.scene.enter("salary");
});
