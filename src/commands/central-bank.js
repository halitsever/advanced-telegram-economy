const { Composer } = require("telegraf");
const { getBankInfo } = require("../modules/bank.module");
const { getString, getCommandName } = require("../lang/index");

module.exports = Composer.command(getCommandName("centralbank"), async (ctx) => {
  const bankInfo = await getBankInfo({ ctx });
  ctx.reply(`${getString("TOTAL_AMOUNT")} ${bankInfo.balance} 💰 ${getString("BANK_INFO")} `);
});
