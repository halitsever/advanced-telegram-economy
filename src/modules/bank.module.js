const { getUser, setUser } = require("./user.module");
const { getString } = require("../lang/index");

const increaseBankAmount = async ({ ctx, increaseAmount }) => {
  if (increaseAmount < 0 || !increaseAmount) return ctx.reply(getString("DATABASE_LOCK"));
  const bankInfo = await getUser({ id: ctx?.botInfo?.id });
  if (!bankInfo) return ctx.reply(getString("DATABASE_LOCK"));
  bankInfo.balance = bankInfo.balance + parseInt(increaseAmount);
  await setUser({ user: bankInfo });
};

const decreaseBankAmount = async ({ ctx, decreaseAmont }) => {
  if (decreaseAmont < 0 || !decreaseAmont) return ctx.reply(getString("DATABASE_LOCK"));
  const bankInfo = await getUser({ id: ctx?.botInfo?.id });
  if (!bankInfo) return ctx.reply(getString("DATABASE_LOCK"));
  bankInfo.balance = bankInfo.balance - parseInt(decreaseAmont);
  await setUser({ user: bankInfo });
};

const getBankInfo = async ({ ctx }) => {
  return await getUser({ id: ctx?.botInfo?.id });
};

module.exports = { increaseBankAmount, getBankInfo, decreaseBankAmount };
