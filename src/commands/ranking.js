const { Composer } = require("telegraf");
const { Not } = require("typeorm");
const { findUser } = require("../modules/user.module");
const { getString, getCommandName } = require("../lang/index");

module.exports = Composer.command(getCommandName("ranking"), async (ctx) => {
  const mostRichestPeople = await findUser({
    // The bot's own record is the central bank reserve, not a member.
    where: { id: Not(ctx.botInfo.id) },
    order: {
      balance: "DESC",
    },
    take: 10,
  });

  let mostRichestPeopleAsText = "";

  for (const person of mostRichestPeople) {
    mostRichestPeopleAsText = mostRichestPeopleAsText + `💰 [${getString("CLICK_TO_SEE_PROFILE")}](tg://user?id=${person.id})   -  ${person.balance}\n`;
  }

  if (!mostRichestPeopleAsText) return ctx.reply(getString("RANKING_EMPTY"));
  return ctx.replyWithMarkdown(mostRichestPeopleAsText);
});
