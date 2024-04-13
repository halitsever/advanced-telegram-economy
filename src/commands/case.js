const { Composer } = require("telegraf");
const { getUser, setUser } = require("../modules/user.module");
const { getString, getCommandName } = require("../lang/index");
const { dirname } = require("path");

module.exports = Composer.command(getCommandName("case"), async (ctx) => {
  const user = await getUser({ id: ctx?.update?.message?.from?.id });
  if (!user) return ctx.reply(getString("DATABASE_LOCK"));

  const appDir = dirname(require.main.filename);

  if (!user?.case) return ctx.reply(getString("CASE_NOT_FOUND"));
  const randomAmount = Math.floor(Math.random() * 3) + 1;

  user.balance = user?.balance + randomAmount;
  user.case = false;

  await setUser({ user });

  return ctx.replyWithPhoto({ source: `${appDir}/assets/case.png` }, { caption: `${getString("CASE_OPEN")} ${randomAmount}` });
});
