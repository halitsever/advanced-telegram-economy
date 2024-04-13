const { getUser, setUser } = require("./user.module");
const strings = require("../lang/strings.tr");
const database = require("../database/index");
const userEntity = require("../database/entity/user.entitiy");

const increaseBankAmount = async ({ ctx, increaseAmount }) => {
  if (increaseAmount < 0 || !increaseAmount) return ctx.reply(strings.DATABASE_LOCK);
  const bankInfo = await getUser({ id: ctx?.botInfo.id });
  bankInfo.balance = bankInfo.balance + increaseAmount;
  await setUser({ user: bankInfo });
};

const decreaseBankAmount = async ({ ctx, decreaseAmont }) => {
  if (decreaseAmont < 0 || !decreaseAmont) return ctx.reply(strings.DATABASE_LOCK);
  const bankInfo = await getUser({ id: ctx?.botInfo.id });
  bankInfo.balance = bankInfo.balance - decreaseAmont;
  await setUser({ user: bankInfo });
};

const getBankInfo = async ({ ctx }) => {
  const bankInfo = await getUser({ id: ctx?.botInfo.id });
  return bankInfo;
};

module.exports = { increaseBankAmount, getBankInfo, decreaseBankAmount };
