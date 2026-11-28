const { Composer } = require("telegraf");
const { getBankInfo } = require("../modules/bank.module");
const { getString, getCommandName } = require("../lang/index");

module.exports = Composer.command(getCommandName("centralbank"), async (ctx) => {
  const bankInfo = await getBankInfo({ ctx });
  if (!bankInfo) return ctx.reply(getString("DATABASE_LOCK"));
  return ctx.reply(`${getString("TOTAL_AMOUNT")} ${bankInfo.balance} 💰 ${getString("BANK_INFO")} `);
});
