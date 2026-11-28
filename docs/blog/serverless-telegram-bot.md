---
title: "Can a Telegram Bot Run Serverless?"
titleTemplate: false
description: "Can a Telegram bot run serverless? Yes, with a webhook and external storage. Why a bot that keeps SQLite and in-memory state needs a small always-on server."
headline: "Serverless Telegram bots: what works and what does not"
date: "2026-11-28"
keyword: "serverless telegram bot"
faq:
  [
    {
      "q": "Can I use long polling on a serverless platform?",
      "a": "Not in a useful way. Long polling needs a process that keeps calling getUpdates, and functions stop after each request. Serverless bots use webhooks.",
    },
    {
      "q": "Does Telegram wait for my function to finish?",
      "a": "Telegram treats a non-2XX answer as a failed delivery and repeats the request. Answer with a 2XX once the update is handled, and keep handlers short.",
    },
    {
      "q": "What is the smallest always-on setup for this bot?",
      "a": "Any machine that can run Node.js 22 and keep a file on disk, such as a small VPS or a home server. The repo's docker compose file builds and restarts the container automatically.",
    },
  ]
---

# Serverless Telegram bots: what works and what does not

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Yes, a Telegram bot can run on serverless functions, and some bots are a good fit. The catch is state. A function starts for one request and may be thrown away afterwards, so anything the bot remembers has to live somewhere else. Advanced Telegram Economy is a useful counterexample: it is built for one process that stays up.</p>

## How a serverless bot works

1. You call `setWebhook` with the function's HTTPS URL.
2. Telegram sends each update to that URL as a POST request.
3. The function handles the update, calls the Bot API (or replies with a method in the response body, which the Bot FAQ allows), and returns.

Polling is not an option here: it needs a process that keeps asking Telegram for updates, which is the opposite of a function. See [webhook vs long polling](/blog/telegram-bot-webhook-vs-polling) for how the two differ.

In Telegraf, `bot.webhookCallback(path)` or `createWebhook({ domain })` returns a request handler you can mount in a function's HTTP entry point instead of calling `bot.launch()`.

## Where state has to go

| State                     | Long-running bot            | Serverless bot                                   |
| ------------------------- | --------------------------- | ------------------------------------------------ |
| User data                 | Local file or database      | Hosted database reachable from every invocation  |
| Conversation steps        | In-memory session           | Session store in a database or key-value service |
| Timers                    | `setTimeout` in the process | Stored deadlines checked on the next update      |
| Counters between messages | Variables in memory         | Database rows                                    |

A stateless bot, for example one that converts a file or looks something up per command, fits functions well. A bot that remembers things between messages needs every row in that table moved out of the process.

## Why Advanced Telegram Economy needs a server

Reading the source, the bot depends on a long-running process in four places:

- **SQLite on local disk.** TypeORM opens `data.sqlite` in the working directory. On most serverless platforms the disk is temporary, so balances would vanish between invocations.
- **In-memory sessions.** Telegraf's `session()` keeps the salary captcha answer in memory. The next message could land on a different instance that never saw the question.
- **A 10 second timer.** The salary scene uses `setTimeout` to cancel the captcha. A function that has already returned cannot fire it.
- **Counters in memory.** The money crate counter and the last sender's id live in `src/store/` as module variables. Each new instance would start counting from zero.

It also uses `bot.launch()` without webhook options, which means long polling.

Porting it is possible: move data to a hosted database, sessions to a session store, replace the timer with a stored deadline, and keep counters in the database. That is a rewrite of the storage layer, not a config change.

## The simple answer for this bot

Run one small always-on process. The repo includes a `Dockerfile` and a compose file:

```bash
TELEGRAM_BOT_TOKEN=... LANG=en docker compose up -d --build
```

The container restarts automatically and the compose file mounts the database from the host, so balances survive rebuilds. The [installation guide](/installation) has the details, including running it directly with Node.js.

## FAQ

### Can I use long polling on a serverless platform?

Not in a useful way. Long polling needs a process that keeps calling getUpdates, and functions stop after each request. Serverless bots use webhooks.

### Does Telegram wait for my function to finish?

Telegram treats a non-2XX answer as a failed delivery and repeats the request. Answer with a 2XX once the update is handled, and keep handlers short.

### What is the smallest always-on setup for this bot?

Any machine that can run Node.js 22 and keep a file on disk, such as a small VPS or a home server. The repo's docker compose file builds and restarts the container automatically.

## Related posts

- [Make a Telegram bot in Node.js with Telegraf, step by step](/blog/how-to-make-a-telegram-bot)
- [Why a Telegram bot does not respond, and how to fix it](/blog/telegram-bot-not-responding)
- [Telegram bots: webhook or long polling?](/blog/telegram-bot-webhook-vs-polling)
- [Why SQLite says database is locked, and how WAL and timeouts help](/blog/sqlite-database-is-locked)
- [All posts](/blog/)
