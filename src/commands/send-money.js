const { Composer } = require("telegraf");
const { getUser, setUser } = require("../modules/user.module");
const { getString, getCommandName } = require("../lang/index");
const { increaseBankAmount } = require("../modules/bank.module");

module.exports = Composer.command(getCommandName("sendmoney"), async (ctx) => {
  const taxRate = 1;
  const targetUser = ctx.update.message?.reply_to_message?.from;
  if (!targetUser) return ctx.reply(`${getString("DATABASE_LOCK")}`);

  const moneyAmount = parseInt(ctx?.update?.message?.text.split(" ")[1]);

  const user = await getUser({ id: ctx?.update?.message?.from?.id });

  if (user.id === targetUser.id) return ctx.reply(`${getString("SELF_SEND")}`);

  if (!user) return ctx.reply(`${getString("DATABASE_LOCK")}`);

  if (isNaN(moneyAmount) || moneyAmount > user?.balance || moneyAmount <= 0) return ctx.reply(`${getString("NO_BALANCE")}`);

  if (moneyAmount <= (taxRate + 1)) return ctx.reply(`${getString("TAX_INFO")}`);

  user.balance = user.balance - (moneyAmount + taxRate);

  await setUser({ user });

  const targetUserEntity = await getUser({ id: targetUser.id });

  targetUserEntity.balance = targetUserEntity.balance + (moneyAmount - taxRate);

  await setUser({ user: targetUserEntity });

  await await increaseBankAmount({ ctx, increaseAmount: taxRate });

  return ctx.reply(`💰 ${getString("SENDED_AMOUNT")} ${moneyAmount} \n📈 ${getString("TAX_AMOUNT")}: ${taxRate}`);
});
