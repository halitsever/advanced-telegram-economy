---
title: "Telegram Bot Not Responding? Common Fixes"
titleTemplate: false
description: "Telegram bot not responding? Check the token, a second running copy, the webhook, privacy mode in groups, admin rights and the command language. With fixes."
headline: "Why a Telegram bot does not respond, and how to fix it"
date: "2026-11-28"
keyword: "telegram bot not responding"
faq:
  [
    {
      "q": "My bot answers in private chat but not in the group. Why?",
      "a": "Privacy mode. In a group, a bot that is not an admin only receives commands meant for it, replies to its messages and service messages. Make it an admin, or turn privacy off with /setprivacy and add the bot to the group again.",
    },
    {
      "q": "What does 409 Conflict mean?",
      "a": "Another process is calling getUpdates with the same token, so Telegram ends one of the requests. Stop the second copy of the bot, for example an old terminal or a container still running.",
    },
    {
      "q": "How do I check which message a user replied to?",
      "a": "The incoming message has a reply_to_message field. In Telegraf it is ctx.message.reply_to_message. The /sendmoney command in this bot reads it to find who receives the money.",
    },
  ]
---

# Why a Telegram bot does not respond, and how to fix it

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">A bot that stays silent usually fails at one of a few points: the token, the way updates are delivered, what Telegram lets the bot see in a group, or the bot's own logic. Work through them in this order. The examples use Advanced Telegram Economy, but most checks apply to any bot.</p>

## 1. Is the process running and connected?

Look at the terminal or container logs first. Advanced Telegram Economy logs each command and scene it loads and then prints `Telegram bot started`. If that last line never appears, the bot never reached Telegram.

## 2. Is the token valid?

Telegraf calls `getMe` on launch. A wrong, truncated or replaced token gives `401: Unauthorized` and the bot stops before it polls. Test the token on its own:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"
```

If it fails, copy the token again from BotFather (`/mybots`, then the bot, then API token). Watch for quotes or a trailing space pasted into `.env`. The [token guide](/blog/telegram-bot-token) has the details.

## 3. Is a second copy running?

Only one process can read updates with long polling. If you start the bot in two terminals, or a Docker container keeps running next to `npm run dev`, Telegram ends one of the `getUpdates` calls with a 409 Conflict error and messages go to whichever copy wins. Stop every copy but one. With Docker, `docker compose ps` shows whether the container is still up; the repo's compose file uses `restart: always`, so it comes back after a reboot.

## 4. Is a webhook set?

The [Bot API reference](https://core.telegram.org/bots/api) says getting updates by polling and by webhook are mutually exclusive, and `getUpdates` does not work while a webhook is set. Check:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

An empty `url` means no webhook. If a URL is set, `last_error_message` tells you why Telegram could not deliver updates. Telegraf's `bot.launch()` without webhook options calls `deleteWebhook` before polling, so this bot clears an old webhook by itself. Bots built with other tools may not. More in [webhook vs long polling](/blog/telegram-bot-webhook-vs-polling).

## 5. Can the bot see the group's messages?

Telegram's [BotFather documentation](https://core.telegram.org/bots/features#botfather) says bots in groups run in privacy mode by default. In that mode a bot receives commands meant for it, replies to its own messages, service messages, and all messages in private chats. It does not see ordinary chat messages. Privacy mode is off for bots that were added as admins.

This matters for Advanced Telegram Economy: it counts every message for money crates and deletes links, photos, stickers and swear words from members who have not bought the matching right. Make it an admin with permission to delete messages. If you change `/setprivacy` instead, Telegram's docs say the bot has to be removed and added to the group again before the change applies.

## 6. Are you typing the right command?

This bot renames its commands with the language. With `LANG=tr`, or a Turkish shell locale such as `tr_TR.UTF-8`, `/salary` becomes `/maas`, `/bank` becomes `/banka` and `/sendmoney` becomes `/paragonder`. An English command sent to a Turkish bot gets no answer. The full table is on the [home page](/). Set `LANG=en` explicitly if your server's locale is Turkish.

## 7. Does the bot answer, but with an error?

Some replies look like failures but are the bot's own rules:

- **An error occurred. Please try again.** The bot sends this when a database read fails, including the first command from someone who has no account record yet. The record is created on that first call, so the second try works.
- **Salary cannot be deposited.** The central bank reserve is empty. Salaries are paid out of it, and it refills from market purchases, slot losses, transfer tax and money crates. Check it with `/centralbank`.
- **No answer to /salary.** The captcha waits 10 seconds for the green number. A late or wrong answer ends the scene.

## 8. Replies: detecting which message was answered

`/sendmoney` only works as a reply, because the receiver is taken from the replied-to message:

```js
const targetUser = ctx.update.message?.reply_to_message?.from;
if (!targetUser) return ctx.reply(getString("DATABASE_LOCK"));
```

Sending `/sendmoney 5` without replying to someone gets the generic error. Reply to a message from the person you want to pay, then send the command.

## Still silent?

Run the bot in the foreground with `npm run dev` and send a command while you watch the log. Errors from the handlers are logged there. The [installation guide](/installation) lists the variables and the troubleshooting notes for this bot.

## FAQ

### My bot answers in private chat but not in the group. Why?

Privacy mode. In a group, a bot that is not an admin only receives commands meant for it, replies to its messages and service messages. Make it an admin, or turn privacy off with /setprivacy and add the bot to the group again.

### What does 409 Conflict mean?

Another process is calling getUpdates with the same token, so Telegram ends one of the requests. Stop the second copy of the bot, for example an old terminal or a container still running.

### How do I check which message a user replied to?

The incoming message has a reply_to_message field. In Telegraf it is ctx.message.reply_to_message. The /sendmoney command in this bot reads it to find who receives the money.

## Related posts

- [Make a Telegram bot in Node.js with Telegraf, step by step](/blog/how-to-make-a-telegram-bot)
- [Get a Telegram bot token from BotFather and keep it safe](/blog/telegram-bot-token)
- [Telegram bots: webhook or long polling?](/blog/telegram-bot-webhook-vs-polling)
- [All posts](/blog/)
