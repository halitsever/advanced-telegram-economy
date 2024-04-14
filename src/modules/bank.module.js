const { getUser, setUser } = require("./user.module");
const strings = require("../lang/strings.tr");

const increaseBankAmount = async ({ ctx, increaseAmount }) => {
  if (increaseAmount < 0 || !increaseAmount) return ctx.reply(strings.DATABASE_LOCK);
  const bankInfo = await getUser({ id: ctx?.botInfo.id });
  bankInfo.balance = bankInfo.balance + parseInt(increaseAmount);
  await setUser({ user: bankInfo });
};

const decreaseBankAmount = async ({ ctx, decreaseAmont }) => {
  if (decreaseAmont < 0 || !decreaseAmont) return ctx.reply(strings.DATABASE_LOCK);
  const bankInfo = await getUser({ id: ctx?.botInfo.id });
  bankInfo.balance = bankInfo.balance - parseInt(decreaseAmont);
  await setUser({ user: bankInfo });
};

const getBankInfo = async ({ ctx }) => {
  const bankInfo = await getUser({ id: ctx?.botInfo.id });
  return bankInfo;
};

module.exports = { increaseBankAmount, getBankInfo, decreaseBankAmount };
