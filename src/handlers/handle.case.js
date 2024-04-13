const { getUser, setUser } = require("../modules/user.module");
const messageStore = require("../store/message.store");
const caseStore = require("../store/case.store");
const { increaseBankAmount } = require("../modules/bank.module");
const { getString } = require("../lang/index");

const handleCaseEvent = async (ctx) => {
  const user = await getUser({ id: ctx?.update?.message?.from?.id });
  if (ctx?.update?.message?.from?.is_bot) return;
  if (!user) return;

  const latestUserId = messageStore.get("latest_user_id");
  if (latestUserId === user?.id) return;

  const caseCount = caseStore.get();

  if (caseCount >= (process.env.CASE_THRESHOLD || 50)) {
    caseStore.reset();
    if (!latestUserId) return;
    user.case = true;
    await increaseBankAmount({ ctx, increaseAmount: 5 });
    await setUser({ user });
    return ctx.reply(getString("CASE_DROP"));
  }

  caseStore.increase();

  messageStore.set("latest_user_id", user?.id);
};

module.exports = handleCaseEvent;
