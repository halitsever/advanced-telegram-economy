---
title: "What Is a Telegram Bot? A Short Explainer"
titleTemplate: false
description: "What is a Telegram bot? A program that uses the Bot API to answer messages, run commands and manage groups. How bots work, what they can do and their limits."
headline: "What a Telegram bot is and how it works"
date: "2026-11-28"
keyword: "what is a telegram bot"
faq:
  [
    {
      "q": "Are Telegram bots safe?",
      "a": "A bot only sees what Telegram sends it: private messages to the bot, and in groups either commands or, for admin bots, all messages. Whoever runs the bot can read and store that data, so add bots you trust, or host one yourself.",
    },
    { "q": "Can a bot message me first?", "a": "No. A user has to start a private chat with the bot before it can send messages there." },
    { "q": "Do Telegram bots cost money?", "a": "Creating a bot and using the Bot API is free. The owner pays only for hosting the program." },
  ]
---

# What a Telegram bot is and how it works

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">A Telegram bot is an account run by a program instead of a person. People message it, add it to groups and tap its buttons; the program behind it decides what to answer. This explainer covers how that works and uses one real bot, Advanced Telegram Economy, as the example.</p>

## A bot is an account plus a program

Every bot has a username ending in `bot`, created through [@BotFather](https://t.me/BotFather), and a token that lets a program control it. The program talks to Telegram's Bot API over HTTPS. It receives updates (new messages, button presses, members joining) and calls methods such as `sendMessage` to respond.

The program can run anywhere: a laptop, a small server, a container. Telegram only sees the API calls.

## What bots can do

Telegram's [bot platform overview](https://core.telegram.org/bots) lists the uses: custom tools, integrations with other services, payments, games, Mini Apps with web interfaces, and AI assistants. In practice most bots do one of these:

- **Answer commands.** `/weather Berlin`, `/bank`, `/help`. Commands start with a slash, and BotFather's `/setcommands` shows them in a menu.
- **Manage groups.** Delete spam, welcome members, enforce rules. This needs admin rights.
- **Run a game.** Either an HTML5 game from Telegram's Gaming Platform, or a game played through commands.
- **Open a Mini App.** A web page inside Telegram, for shops or dashboards.

## How bots differ from user accounts

- A bot cannot start a conversation. The user has to open the chat first.
- In groups, bots run in privacy mode by default and only receive commands meant for them, replies to their messages and service messages. Admin bots receive all messages.
- Bots cannot see messages from other bots in most cases.
- There are sending limits: Telegram's FAQ asks for no more than one message per second in a chat and 20 per minute in a group.

## A worked example

Advanced Telegram Economy is a group bot written in Node.js with the Telegraf library. Added to a group as an admin, it:

1. Reads every message to count activity and drop money crates.
2. Deletes links, photos, stickers and swear words unless the sender bought the right in `/market`.
3. Answers commands such as `/salary`, `/bank`, `/slot` and `/ranking` from a SQLite database.

Each of those is an ordinary Bot API call: it receives a message update, decides, then calls `sendMessage` or `deleteMessage`. The [game bot post](/blog/telegram-game-bot) explains the economy rules.

## Hosted bots and self-hosted bots

Most bots you meet are run by someone else, who sees what the bot sees. A self-hosted bot is code you run with your own token, so the data stays on your machine. Advanced Telegram Economy is self-hosted: balances live in a `data.sqlite` file on your server.

## Making one

You need a token from BotFather and a small program. The [token guide](/blog/telegram-bot-token) and the [Node.js tutorial](/blog/how-to-make-a-telegram-bot) take you from nothing to a bot that answers `/ping`.

## FAQ

### Are Telegram bots safe?

A bot only sees what Telegram sends it: private messages to the bot, and in groups either commands or, for admin bots, all messages. Whoever runs the bot can read and store that data, so add bots you trust, or host one yourself.

### Can a bot message me first?

No. A user has to start a private chat with the bot before it can send messages there.

### Do Telegram bots cost money?

Creating a bot and using the Bot API is free. The owner pays only for hosting the program.

## Related posts

- [Make a Telegram bot in Node.js with Telegraf, step by step](/blog/how-to-make-a-telegram-bot)
- [Get a Telegram bot token from BotFather and keep it safe](/blog/telegram-bot-token)
- [How a Telegram game bot runs an economy inside a group](/blog/telegram-game-bot)
- [All posts](/blog/)
