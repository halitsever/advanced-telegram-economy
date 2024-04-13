const { Scenes } = require("telegraf");
const { message } = require("telegraf/filters");
const { getCaptcha } = require("../modules/captcha.module");
const { setUser, getUser } = require("../modules/user.module");
const { getBankInfo, decreaseBankAmount } = require("../modules/bank.module");
const { getString } = require("../lang/index");
const logger = require("../logger");

const paybackScene = new Scenes.BaseScene("payback");

paybackScene.enter((ctx) => {
  const captchaTimeout = setTimeout(() => {
    ctx.reply(getString("TIMEOUT_ERROR"));
    return ctx.scene.leave();
  }, 10_000);
  const { numbers, answer } = getCaptcha();

  let captchaString = `${getString("CAPTCHA_HINT")}\n`;

  ctx.session.answer = answer;
  ctx.session.timeout = captchaTimeout;
  for (const number of numbers) {
    if (number === answer) captchaString = captchaString + `🟢 ${number}\n`;
    else captchaString = captchaString + `🔴 ${number}\n`;
  }

  ctx.reply(captchaString);
});

paybackScene.on(message("text"), async (ctx) => {
  const answer = String(ctx.session.answer);

  const userResponse = ctx.message.text;

  if (answer !== userResponse) {
    ctx.reply(getString("CAPTCHA_RESPONSE_ERROR"));
    clearTimeout(ctx.session.timeout);
    return ctx.scene.leave();
  } else {
    clearTimeout(ctx.session.timeout);
    await paybackUser({ ctx });
    return ctx.scene.leave();
  }
});

const paybackUser = async ({ ctx }) => {
  try {
    const bankInfo = await getBankInfo({ ctx });

    if (bankInfo.balance <= 0) return ctx.reply();

    const user = await getUser({ id: ctx?.update?.message?.from?.id });
    const limitAsMs = 3_600_000;

    if (!user) return ctx.reply(getString("DATABASE_LOCK"));

    if (Date.now() - user?.last_payback_time <= limitAsMs) return ctx.reply(getString("PAYBACK_ERROR"));

    user.balance = user?.balance + 1;
    user.last_payback_time = Date.now();

    await decreaseBankAmount({ ctx, decreaseAmont: 1 });
    await setUser({ user });
    ctx.reply(getString("PAYBACK_OK"));
  } catch (err) {
    logger.error(err);
    ctx.reply(getString("DATABASE_LOCK"));
  }
};

module.exports = paybackScene;
