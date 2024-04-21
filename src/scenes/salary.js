const { Scenes } = require("telegraf");
const { message } = require("telegraf/filters");
const { getCaptcha } = require("../modules/captcha.module");
const { setUser, getUser } = require("../modules/user.module");
const { getBankInfo, decreaseBankAmount } = require("../modules/bank.module");
const { getString } = require("../lang/index");
const logger = require("../logger");

const salaryScene = new Scenes.BaseScene("salary");

salaryScene.enter((ctx) => {
  const captchaTimeout = setTimeout(() => {
    ctx.reply(getString("TIMEOUT_ERROR"));
    return ctx.scene.leave();
  }, 10_000);
  const { numbers, answer } = getCaptcha();

  let captchaString = `${getString("CAPTCHA_HINT")}\n`;

  ctx.session.answer = answer;
  ctx.session.timeout = captchaTimeout;
  for (const number of numbers) {
    captchaString = number === answer ? `${captchaString}🟢 ${number}\n` : captchaString + `🔴 ${number}\n`;
  }

  ctx.reply(captchaString);
});

salaryScene.on(message("text"), async (ctx) => {
  const answer = String(ctx.session.answer);

  const userResponse = ctx.message.text;

  if (answer === userResponse) {
    clearTimeout(ctx.session.timeout);
    await giveSalaryToUser({ ctx });
    return ctx.scene.leave();
  }
  ctx.reply(getString("CAPTCHA_RESPONSE_ERROR"));
  clearTimeout(ctx.session.timeout);
  return ctx.scene.leave();
});

const giveSalaryToUser = async ({ ctx }) => {
  try {
    const bankInfo = await getBankInfo({ ctx });

    if (bankInfo.balance <= 0) return await ctx.reply(getString("MONEY_NOT_AVAILABLE"));

    const user = await getUser({ id: ctx?.update?.message?.from?.id });
    const limitAsMs = 3_600_000;

    if (!user) return await ctx.reply(getString("DATABASE_LOCK"));

    if (Date.now() - user?.last_payback_time <= limitAsMs) return await ctx.reply(getString("SALARY_ERROR"));

    user.balance = user?.balance + 1;
    user.last_payback_time = Date.now();

    await decreaseBankAmount({ ctx, decreaseAmont: 1 });
    await setUser({ user });
    return await ctx.reply(getString("SALARY_OK"));
  } catch (err) {
    logger.error(err);
    return await ctx.reply(getString("DATABASE_LOCK"));
  }
};

module.exports = salaryScene;
