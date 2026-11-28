---
title: Self-Hosted Telegram Gaming Bot for Group Chats
titleTemplate: false
description: A self-hosted Telegram gaming bot for groups. Members earn salaries, open crates, play slots, buy chat rights and climb a ranking. English or Turkish.
faq:
  - q: Is there a ready bot I can add without hosting anything?
    a: No. Advanced Telegram Economy is source code you run with your own bot token. There is no public instance to invite.
  - q: Can players buy or cash out the in-game money?
    a: No. Balances exist only in the bot's SQLite file. They are earned in the chat and spent in the chat.
  - q: Does it use Telegram's HTML5 game platform?
    a: No. The whole game is played with chat commands. Nothing opens outside the chat.
  - q: Which language does the bot speak?
    a: English or Turkish, set with the LANG variable when you start it. Command names change with the language, so /salary becomes /maas in Turkish.
---

# Self-hosted Telegram gaming bot: an economy game for your group

Advanced Telegram Economy turns a Telegram group into a small economy game. Members earn money by solving a quick captcha and by chatting, then spend it on chat rights, gamble it on a slot machine, send it to each other and compete for the top of the ranking. You run the bot yourself, with your own token, and all game data stays in a SQLite file on your machine.

**[Install the bot](/installation)** or read the [source on GitHub](https://github.com/halitsever/advanced-telegram-economy).

## What your group gets

| Game part    | How it plays                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| Salary       | `/salary` shows five numbers. Type the green one within 10 seconds to earn 1 unit, once per hour.                 |
| Money crates | Every 50 counted messages (set with `CASE_THRESHOLD`) the sender gets a crate. `/case` opens it for 1 to 3 units. |
| Central bank | One shared reserve pays all salaries. Purchases, slot losses, tax and crates refill it.                           |
| Market       | Links, photos, stickers and swear words are deleted until the sender buys the right with `/buy`.                  |
| Slot machine | `/slot` costs 2 units. Three matching fruits win 5, a pair wins 1.                                                |
| Transfers    | Reply to someone with `/sendmoney <amount>`. One unit goes to the central bank as tax.                            |
| Ranking      | `/ranking` lists the 10 largest balances with profile links.                                                      |

## Commands

| English        | Turkish          | What it does                         |
| -------------- | ---------------- | ------------------------------------ |
| `/bank`        | `/banka`         | Shows your balance                   |
| `/salary`      | `/maas`          | Starts the salary captcha            |
| `/case`        | `/kasa`          | Opens a money crate                  |
| `/centralbank` | `/merkezbankasi` | Shows the central bank reserve       |
| `/market`      | `/market`        | Lists products and prices            |
| `/buy`         | `/satinal`       | Buys a product by its number         |
| `/items`       | `/esyalar`       | Lists the products you own           |
| `/slot`        | `/slot`          | Plays the slot machine               |
| `/sendmoney`   | `/paragonder`    | Sends money to the user you reply to |
| `/ranking`     | `/enzengin`      | Shows the 10 richest members         |

## Set it up in three steps

1. **Create a bot.** Send `/newbot` to [@BotFather](https://t.me/BotFather) and copy the token. The [token guide](/blog/telegram-bot-token) covers each prompt.
2. **Start it.** With Node.js 22:

   ```bash
   git clone https://github.com/halitsever/advanced-telegram-economy.git
   cd advanced-telegram-economy
   npm install
   TELEGRAM_BOT_TOKEN=... LANG=en npm run start
   ```

   Or with Docker: `TELEGRAM_BOT_TOKEN=... LANG=en docker compose up -d --build`.

3. **Add it to your group as an admin** with permission to delete messages. The bot reads every message to count crates and enforce the market rules, and Telegram only gives all messages to admin bots by default.

The [installation guide](/installation) lists every variable and the troubleshooting notes.

## English or Turkish

`LANG=en` or `LANG=tr` picks the language of every message and command name. A Turkish shell locale such as `tr_TR.UTF-8` also gives Turkish, and anything else falls back to English.

## What it is not

- **Not a hosted bot.** There is no public instance to invite. You run the code.
- **Not real money.** Balances cannot be bought or withdrawn.
- **Not an HTML5 game.** Telegram's Gaming Platform opens game pages; this bot is played entirely with chat commands. The difference is explained in [Telegram game bots](/blog/telegram-game-bot).

## Built with

Node.js, [Telegraf](https://telegraf.js.org/) 4.16 for the Bot API, and TypeORM with `better-sqlite3` for storage. Every command is one file in `src/commands/`, so adding a game mechanic means adding a file. The MIT license lets you change it for your group.

## FAQ

### Is there a ready bot I can add without hosting anything?

No. Advanced Telegram Economy is source code you run with your own bot token. There is no public instance to invite.

### Can players buy or cash out the in-game money?

No. Balances exist only in the bot's SQLite file. They are earned in the chat and spent in the chat.

### Does it use Telegram's HTML5 game platform?

No. The whole game is played with chat commands. Nothing opens outside the chat.

### Which language does the bot speak?

English or Turkish, set with the `LANG` variable when you start it. Command names change with the language, so `/salary` becomes `/maas` in Turkish.

## Guides

- [How to make a Telegram bot with Node.js](/blog/how-to-make-a-telegram-bot)
- [Telegram bot not responding? Common fixes](/blog/telegram-bot-not-responding)
- [All Telegram bot guides](/blog/)
