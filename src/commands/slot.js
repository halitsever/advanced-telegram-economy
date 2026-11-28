const { Composer } = require("telegraf");
const { increaseBankAmount } = require("../modules/bank.module");
const { getString, getCommandName } = require("../lang/index");
const { getUser, setUser } = require("../modules/user.module");
const logger = require("../logger");

module.exports = Composer.command(getCommandName("slot"), async (ctx) => {
  try {
    const user = await getUser({ id: ctx?.update?.message?.from?.id });

    if (!user || user?.balance < 2) return ctx.reply(getString("NO_BALANCE"));

    user.balance = user?.balance - 2;

    await setUser({ user });

    let slots = ["🍎", "🍌", "🍊", "🍐", "🍒"];
    let result1 = Math.floor(Math.random() * slots.length);
    let result2 = Math.floor(Math.random() * slots.length);
    let result3 = Math.floor(Math.random() * slots.length);

    const slot = await ctx.reply(`${getString("SLOT_SPINNING")}`);
    const win =
      slots[result1] === slots[result2] && slots[result2] === slots[result3]
        ? 5
        : slots[result1] === slots[result2] || slots[result2] === slots[result3] || slots[result1] === slots[result3]
          ? 1
          : null;

    if (win) {
      user.balance = user.balance + (win + 2);
      await setUser({ user });
    } else {
      await increaseBankAmount({ ctx, increaseAmount: 2 });
    }

    setTimeout(() => {
      // Nothing awaits this timer, so a failed edit (message deleted, rate limit) must not become an unhandled rejection.
      ctx.telegram
        .editMessageText(
          slot.chat.id,
          slot.message_id,
          undefined,
          `${getString("SLOT_MACHINE")}:\n${slots[result1]} | ${slots[result2]} | ${slots[result3]}\n ${win ? `🤑 ${getString("SLOT_WIN")} ${win}` : `🥶 ${getString("SLOT_LOSS")} 2`}`,
        )
        .catch((err) => logger.error(err));
    }, 3000);
  } catch (err) {
    logger.error(err);
    return ctx.reply(getString("DATABASE_LOCK"));
  }
});
