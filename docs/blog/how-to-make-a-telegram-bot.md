---
title: "How to Make a Telegram Bot with Node.js"
titleTemplate: false
description: "Make a Telegram bot with Node.js and Telegraf: get a token from BotFather, answer commands, store data in SQLite, then run it in a group. Real code included."
headline: "Make a Telegram bot in Node.js with Telegraf, step by step"
date: "2026-11-28"
keyword: "how to make telegram bot"
faq:
  [
    {
      "q": "Do I need a server to make a Telegram bot?",
      "a": "Not to start. With long polling the bot asks Telegram for new messages, so it runs on any computer with internet access. It only answers while that process is running, so a bot for real users ends up on a machine that stays on.",
    },
    {
      "q": "Which Node.js library should I use?",
      "a": "This guide uses Telegraf, the library Advanced Telegram Economy is built on (version 4.16). It wraps every Bot API method and adds commands, sessions and scenes. You can also call the HTTPS API directly with fetch.",
    },
    {
      "q": "Is it free to make a Telegram bot?",
      "a": "Creating a bot with BotFather and using the Bot API costs nothing. You only pay for wherever you host the process, if you host it somewhere other than your own computer.",
    },
  ]
---

# Make a Telegram bot in Node.js with Telegraf, step by step

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">A Telegram bot is a program that talks to Telegram's Bot API over HTTPS. You do not need a server framework or a public URL to start: a token from BotFather, Node.js and one library are enough. This guide builds a small bot first, then shows how Advanced Telegram Economy grows the same pattern into a full group game.</p>

## What you need

- **Node.js and npm.** This project's CI and Docker image use Node.js 22.
- **A Telegram account** to talk to [@BotFather](https://t.me/BotFather).
- **A bot token.** BotFather gives you one when you create the bot. The [token guide](/blog/telegram-bot-token) walks through every prompt.

## 1. Create the bot in BotFather

Send `/newbot` to @BotFather. It asks for a display name, then a username that must end in `bot`, and replies with a token that looks like `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw` (the example from Telegram's [BotFather documentation](https://core.telegram.org/bots/features#botfather)). Anyone who has the token controls the bot, so treat it like a password.

## 2. Start a Node.js project

```bash
mkdir my-bot && cd my-bot
npm init -y
npm install telegraf
```

## 3. Answer your first command

Create `index.js`:

```js
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => ctx.reply("Hello! Send /ping to test me."));
bot.command("ping", (ctx) => ctx.reply("pong"));

bot.launch(() => console.log("Bot started"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
```

Run it with the token in the environment:

```bash
TELEGRAM_BOT_TOKEN=123456:your-token node index.js
```

Open your bot in Telegram, press Start and send `/ping`. `bot.launch()` uses long polling: Telegraf removes any webhook, then keeps asking Telegram for new updates. `ctx.reply` sends a message back to the chat the update came from. The two `process.once` lines stop polling cleanly when you press Ctrl+C or when Docker stops the container. They are the same lines that close [`src/index.js`](https://github.com/halitsever/advanced-telegram-economy/blob/main/src/index.js) in this repo.

## 4. Keep each command in its own file

A one-file bot gets crowded quickly. Advanced Telegram Economy keeps every command in `src/commands/` and loads the folder at startup:

```js
const loadCommands = async (bot) => {
  const commandsList = fs.readdirSync(__dirname + "/commands");
  const commands = [];
  for (const command of commandsList) commands.push(require(`./commands/${command}`));
  bot.use(Composer.compose(commands));
};
```

Each file exports one handler, for example `/bank`:

```js
module.exports = Composer.command(getCommandName("bank"), async (ctx) => {
  const user = await getUser({ id: ctx?.update?.message?.from?.id });
  ctx.reply(`Bank | ${ctx?.update?.message?.from?.first_name} ...`);
});
```

`getCommandName` returns the English or Turkish command name depending on the `LANG` variable, so the same file serves `/bank` and `/banka`.

## 5. Store data that survives a restart

Variables in memory are lost when the process stops. This bot stores balances in SQLite through TypeORM, with a schema written in plain JavaScript:

```js
module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: { primary: true, type: "int" },
    balance: { default: 0, type: "int" },
    last_payback_time: { default: 0, type: "int" },
    case: { default: false, type: "boolean" },
  },
});
```

The data source points at `data.sqlite` in the working directory with `synchronize: true`, so the tables are created on the first start. There is no migration step, which also means a schema change alters the live database on the next start.

## 6. Ask follow-up questions with scenes

Some commands need a second message from the user. `/salary` in this bot asks you to type the number marked green out of five random numbers and waits 10 seconds. Telegraf handles this with `session()` and a `Scenes.BaseScene`: the command calls `ctx.scene.enter("salary")`, and the scene's own text handler checks the answer. See [`src/scenes/salary.js`](https://github.com/halitsever/advanced-telegram-economy/blob/main/src/scenes/salary.js).

## 7. Add the bot to a group

Bots in groups run in privacy mode by default and only see commands, replies to them and service messages. A bot that reads every message, like this one (it counts messages for money crates and deletes links, photos and stickers), needs to be an admin with permission to delete messages. Telegram's docs say bot admins always receive all messages.

## Next steps

- Replies, formatting and editing: [sendMessage examples](/blog/telegram-bot-api-sendmessage).
- Choosing how updates arrive: [webhook vs long polling](/blog/telegram-bot-webhook-vs-polling).
- If the bot stays silent: [common fixes](/blog/telegram-bot-not-responding).
- The finished example: the [self-hosted Telegram gaming bot](/telegram-gaming-bot/) and its [installation guide](/installation).

## FAQ

### Do I need a server to make a Telegram bot?

Not to start. With long polling the bot asks Telegram for new messages, so it runs on any computer with internet access. It only answers while that process is running, so a bot for real users ends up on a machine that stays on.

### Which Node.js library should I use?

This guide uses Telegraf, the library Advanced Telegram Economy is built on (version 4.16). It wraps every Bot API method and adds commands, sessions and scenes. You can also call the HTTPS API directly with fetch.

### Is it free to make a Telegram bot?

Creating a bot with BotFather and using the Bot API costs nothing. You only pay for wherever you host the process, if you host it somewhere other than your own computer.

## Related posts

- [Get a Telegram bot token from BotFather and keep it safe](/blog/telegram-bot-token)
- [Telegram Bot API sendMessage, explained with Node.js examples](/blog/telegram-bot-api-sendmessage)
- [Telegram bots: webhook or long polling?](/blog/telegram-bot-webhook-vs-polling)
- [All posts](/blog/)
