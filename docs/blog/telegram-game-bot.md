---
title: "Telegram Game Bots: Build an Economy Game"
titleTemplate: false
description: "How a Telegram game bot can run an economy game in a group chat: salaries with a captcha, a central bank, a market, crates and rankings, explained from code."
headline: "How a Telegram game bot runs an economy inside a group"
date: "2026-11-28"
keyword: "telegram game bots"
faq:
  [
    {
      "q": "Is this the same as Telegram's HTML5 games?",
      "a": "No. Telegram's Gaming Platform games are created with /newgame in BotFather and open an HTML5 page. This bot is played entirely with chat commands and has no game page.",
    },
    {
      "q": "Can members cheat the salary?",
      "a": "The salary needs a typed answer within 10 seconds and is limited to once per hour per user. It stops simple command spam, not a determined person; it is a group game, not a security system.",
    },
    { "q": "Where are balances stored?", "a": "In data.sqlite in the directory the bot is started from, through TypeORM. Back up that file to keep the group's economy." },
  ]
---

# How a Telegram game bot runs an economy inside a group

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Telegram game bots come in two kinds. Some use Telegram's Gaming Platform to open an HTML5 game. Others are the game themselves and are played with commands in the chat. Advanced Telegram Economy is the second kind: a group economy where members earn, spend and compete. This post explains how its mechanics are built, straight from the source.</p>

## Two kinds of game bots

Telegram's [BotFather documentation](https://core.telegram.org/bots/features#botfather) describes bots as gaming platforms: you register a game with `/newgame`, and players open an HTML5 page from the chat. That suits arcade games with graphics.

A chat game needs none of that. The game state lives in the bot's database, and every move is a command. That is how Advanced Telegram Economy works, and why it fits groups that are already chatting.

## The money supply: a central bank

Everything starts with one balance: the bot's own account. The bank module stores the reserve as the user record whose id is the bot's id:

```js
const getBankInfo = async ({ ctx }) => {
  const bankInfo = await getUser({ id: ctx?.botInfo.id });
  return bankInfo;
};
```

Money flows into the reserve from market purchases, lost slot spins, the transfer tax and each money crate drop (5 units). Salaries flow out of it. When it is empty, salaries stop. The game is a closed loop: members pay for perks and lose bets, and that money later pays everyone's salary.

## Earning: salary with a captcha

`/salary` enters a Telegraf scene that shows five random numbers, one marked green. Type the green one within 10 seconds and one unit moves from the bank to you. The scene checks `last_payback_time` and refuses a second claim within an hour (`3_600_000` ms). The captcha keeps people from earning by pasting the command in a loop.

## Earning: money crates

Every message in the group passes through `handleCaseEvent`. It skips bots and repeated messages from the same person, then counts. When the count reaches `CASE_THRESHOLD` (50 by default), the sender gets a crate and the counter resets. `/case` opens it for 1 to 3 random units. Active chat is rewarded, but only when people take turns.

## Spending: a market of chat rights

By default the bot deletes links, photos, stickers and a list of Turkish swear words. The market sells the rights to post them:

| Item                    | Price |
| ----------------------- | ----- |
| Image sharing right     | 1     |
| Sticker sharing right   | 1     |
| Link sharing right      | 2     |
| Profanity sharing right | 2     |

`/buy <number>` takes the price from your balance and adds it to the central bank. A purchase is permanent and recorded in the `products` table. This turns moderation into the thing people save up for.

## Risk: the slot machine

`/slot` costs 2 units. Three random fruits are drawn from five. Three of a kind wins 5, any pair wins 1 (you also get your 2 back), and a loss sends the 2 units to the central bank. Gambling here is only play money that exists inside the group; it cannot be bought or cashed out.

## Trading: transfers with tax

Reply to someone's message with `/sendmoney <amount>`. The amount must be more than 2. As the code stands, the sender pays the amount plus 1, the receiver gets the amount minus 1 and the bank gets 1, so one unit disappears with every transfer, and the bot's tax message still says half goes to tax. Both are open bugs. Reading the receiver from the replied-to message means nobody has to type user ids.

## Competition: the ranking

`/ranking` lists the ten largest balances, each with a link to the member's profile. A ranking gives the economy a goal beyond buying perks.

## Language as a setting

Every command name and message comes from `src/lang/`, in English and Turkish. `LANG=tr` turns `/salary` into `/maas` and `/ranking` into `/enzengin`. The group plays in one language, chosen by whoever hosts the bot.

## Run it in your group

The bot is self-hosted: you run it with your own token from BotFather. The [self-hosted Telegram gaming bot](/telegram-gaming-bot/) lists every command, and the [installation guide](/installation) gets it running in three commands.

## FAQ

### Is this the same as Telegram's HTML5 games?

No. Telegram's Gaming Platform games are created with /newgame in BotFather and open an HTML5 page. This bot is played entirely with chat commands and has no game page.

### Can members cheat the salary?

The salary needs a typed answer within 10 seconds and is limited to once per hour per user. It stops simple command spam, not a determined person; it is a group game, not a security system.

### Where are balances stored?

In data.sqlite in the directory the bot is started from, through TypeORM. Back up that file to keep the group's economy.

## Related posts

- [Make a Telegram bot in Node.js with Telegraf, step by step](/blog/how-to-make-a-telegram-bot)
- [Telegram Bot API sendMessage, explained with Node.js examples](/blog/telegram-bot-api-sendmessage)
- [What a Telegram bot is and how it works](/blog/what-is-a-telegram-bot)
- [A self-hosted anti-spam filter for Telegram groups, in Node.js](/blog/telegram-anti-spam-bot)
- [Telegram bot commands: rules, the / menu and per-language lists](/blog/telegram-bot-commands)
- [All posts](/blog/)
