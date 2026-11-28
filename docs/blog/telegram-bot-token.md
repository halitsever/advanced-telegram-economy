---
title: "How to Get a Telegram Bot Token from BotFather"
titleTemplate: false
description: "Get a Telegram bot token from BotFather with /newbot, test it with getMe, keep it out of git with an env variable, and replace it with /token if it leaks."
headline: "Get a Telegram bot token from BotFather and keep it safe"
date: "2026-11-28"
keyword: "telegram bot token"
faq:
  [
    {
      "q": "Where do I find the token of a bot I already made?",
      "a": "Open @BotFather, send /mybots, pick the bot and open its API token entry. BotFather shows the current token there.",
    },
    {
      "q": "What does the number before the colon mean?",
      "a": "It is the bot's numeric user id. getMe returns the same number in its id field. The part after the colon is the secret.",
    },
    {
      "q": "What should I do if my bot token leaks?",
      "a": "Telegram's documentation says to use the /token command in BotFather to generate a new one when a token is compromised. Put the new token in your environment and restart the bot.",
    },
    {
      "q": "Can I change the bot username later?",
      "a": "No. Telegram's BotFather documentation says the username cannot be changed later, unlike the display name. Choose it carefully.",
    },
  ]
---

# Get a Telegram bot token from BotFather and keep it safe

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Every Telegram bot is identified by one secret string, its token. BotFather creates it, the Bot API expects it in every request URL, and anyone who has it can act as your bot. Here is how to get one, check that it works and keep it out of places it should not be.</p>

## Create a bot with /newbot

1. Open [@BotFather](https://t.me/BotFather) in Telegram and press Start.
2. Send `/newbot`.
3. Type the **name**. It is shown in the chat header and in contact details, and you can change it later with `/setname`.
4. Type the **username**. Telegram's [BotFather documentation](https://core.telegram.org/bots/features#botfather) sets the rules: 5 to 32 characters, Latin letters, numbers and underscores only, not case sensitive, and it must end in `bot` (like `tetris_bot` or `TetrisBot`). It cannot be changed later.
5. BotFather replies with the token.

The token looks like this (Telegram's own example):

```text
110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
```

The digits before the colon are the bot's id. The rest is the secret part.

If the username is taken or breaks a rule, BotFather asks again. The most common slip is a username that does not end in `bot`.

## How the token authorizes your bot

The [Bot API reference](https://core.telegram.org/bots/api) calls this "authorizing your bot". There is no login step: the token goes into the URL of every request.

```text
https://api.telegram.org/bot<token>/METHOD_NAME
```

Note the word `bot` directly in front of the token, with no slash in between. All requests must use HTTPS, and both GET and POST work.

## Test the token with getMe

`getMe` takes no parameters and returns information about the bot, so it is the quickest check:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"
```

A working token returns `"ok":true` with the bot's id and username. A wrong or revoked token returns `"ok":false` with error code 401 and `Unauthorized`. Telegraf calls `getMe` when the bot launches, so a bad token makes `bot.launch()` fail with the same 401.

## Keep the token out of your code

Never paste the token into a source file you commit. Advanced Telegram Economy reads it from the environment:

```js
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
```

You can set it per run:

```bash
TELEGRAM_BOT_TOKEN=123456:your-token LANG=en npm run start
```

or put it in a `.env` file next to `package.json`, which the bot loads through `dotenv` on start:

```bash
TELEGRAM_BOT_TOKEN=123456:your-token
LANG=en
```

The repo's `.gitignore` already lists `.env`, so the file stays out of commits. With Docker, `docker compose` passes `TELEGRAM_BOT_TOKEN` from your shell into the container, and the repo's `.dockerignore` keeps local builds of `node_modules` and the database out of the image. See the [installation guide](/installation) for every variable.

## If the token leaks

Telegram's documentation is short on this: if your token is compromised or lost, send `/token` to BotFather and pick the bot to generate a new one. Then:

1. Put the new token in `.env` or your host's secret settings.
2. Restart the bot.
3. Check your git history. A token that was ever committed is still in older commits, so rotating it is the fix, not deleting the line.

## Other BotFather settings worth setting now

- `/setcommands` sets the command list users see after typing `/`.
- `/setdescription` sets the text people see before they start the bot (up to 512 characters).
- `/setjoingroups` controls whether the bot can be added to groups.
- `/setprivacy` controls which group messages the bot receives. This bot reads every message, so make it a group admin instead; the [not responding guide](/blog/telegram-bot-not-responding) explains why.

With a working token, continue with [making the bot in Node.js](/blog/how-to-make-a-telegram-bot).

## FAQ

### Where do I find the token of a bot I already made?

Open @BotFather, send /mybots, pick the bot and open its API token entry. BotFather shows the current token there.

### What does the number before the colon mean?

It is the bot's numeric user id. getMe returns the same number in its id field. The part after the colon is the secret.

### What should I do if my bot token leaks?

Telegram's documentation says to use the /token command in BotFather to generate a new one when a token is compromised. Put the new token in your environment and restart the bot.

### Can I change the bot username later?

No. Telegram's BotFather documentation says the username cannot be changed later, unlike the display name. Choose it carefully.

## Related posts

- [Make a Telegram bot in Node.js with Telegraf, step by step](/blog/how-to-make-a-telegram-bot)
- [Why a Telegram bot does not respond, and how to fix it](/blog/telegram-bot-not-responding)
- [What a Telegram bot is and how it works](/blog/what-is-a-telegram-bot)
- [All posts](/blog/)
