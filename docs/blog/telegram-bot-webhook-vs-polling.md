---
title: "Webhook vs Long Polling for Telegram Bots"
titleTemplate: false
description: "Webhook vs long polling for Telegram bots in Node.js: how getUpdates and setWebhook work, ports and secret tokens, and why a SQLite bot is fine with polling."
headline: "Telegram bots: webhook or long polling?"
date: "2026-11-28"
keyword: "telegram bot getupdates polling vs webhook node.js"
faq:
  [
    {
      "q": "Is a webhook faster than long polling?",
      "a": "With long polling Telegram answers the open request as soon as an update arrives, so a single bot process gets messages without a fixed polling delay. Webhooks matter more when you need many parallel connections or have no long-running process at all.",
    },
    { "q": "How long does Telegram keep updates?", "a": "The Bot API says incoming updates are stored on the server until the bot receives them, but not longer than 24 hours." },
    {
      "q": "Which method does Advanced Telegram Economy use?",
      "a": "Long polling. It calls bot.launch() without webhook options, so Telegraf deletes any webhook and polls getUpdates.",
    },
  ]
---

# Telegram bots: webhook or long polling?

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">A bot can receive updates in two ways: it asks Telegram for them (getUpdates, usually with long polling), or Telegram sends them to a URL (a webhook). The Bot API says the two are mutually exclusive. Here is how each works and which one fits which kind of bot.</p>

## Long polling with getUpdates

The bot calls `getUpdates` with a `timeout` in seconds. Telegram holds the request open until an update arrives or the timeout runs out, then the bot calls again. A timeout of 0 (the default) is short polling, which wastes requests; libraries set a positive value for you.

The bot confirms what it has processed by passing `offset` as the last `update_id` plus one. Telegram keeps unconfirmed updates for up to 24 hours.

What polling needs:

- An outgoing internet connection. No public IP, domain or certificate.
- One running process per token. A second process polling the same token gets a 409 Conflict error.

## Webhooks with setWebhook

You give Telegram an HTTPS URL with `setWebhook`, and it sends each update there as a POST request. From the [Bot API reference](https://core.telegram.org/bots/api) and the [Bot FAQ](https://core.telegram.org/bots/faq):

- The URL must use HTTPS with a valid certificate. A self-signed one works if you upload its public key with the `certificate` parameter.
- Supported ports are 443, 80, 88 and 8443.
- `secret_token` (1 to 256 characters) comes back in the `X-Telegram-Bot-Api-Secret-Token` header, so your server can reject requests that are not from Telegram.
- `max_connections` sets how many connections Telegram opens at once, from 1 to 100 (default 40).
- If your server does not answer with a 2XX status, Telegram repeats the request and gives up after a reasonable number of attempts.
- `getWebhookInfo` shows the URL, `pending_update_count` and `last_error_message`.

While a webhook is set, `getUpdates` does not work. `deleteWebhook` switches back.

## The same choice in Telegraf

```js
// Long polling: Telegraf calls deleteWebhook, then polls getUpdates
bot.launch();

// Webhook: Telegraf calls setWebhook and starts an HTTP server on the port
bot.launch({ webhook: { domain: "bot.example.com", port: 8443, secretToken: process.env.WEBHOOK_SECRET } });
```

The webhook form expects HTTPS to reach that port, either through `tlsOptions` or a reverse proxy in front.

## Side by side

|                                 | Long polling             | Webhook                                           |
| ------------------------------- | ------------------------ | ------------------------------------------------- |
| Needs a public HTTPS URL        | No                       | Yes                                               |
| Works behind NAT or on a laptop | Yes                      | No, unless tunnelled                              |
| Process model                   | One long-running process | Any server that answers HTTP, including functions |
| Parallel delivery               | One stream of updates    | Up to `max_connections` at once                   |
| Setup in Telegraf               | `bot.launch()`           | `bot.launch({ webhook })` or `createWebhook`      |

## Why this bot uses polling

Advanced Telegram Economy keeps parts of its game state in the running process:

- The money crate counter and the id of the last sender live in memory (`src/store/`).
- The salary captcha uses Telegraf's in-memory `session()` to remember the answer and the 10 second timer.
- Balances are in `data.sqlite`, a file on the local disk.

All of that assumes one process that stays up, which is what long polling gives you. A webhook would work too, as long as it is one always-on server process. It would not change the hosting requirement, only add a certificate and a public port. The [serverless post](/blog/serverless-telegram-bot) covers what breaks if you try to run this kind of bot as functions.

## Switching later

To move a polling bot to a webhook, call `setWebhook` (or launch Telegraf with webhook options). To go back, stop the webhook server and start polling: Telegraf's `bot.launch()` removes the webhook for you. If messages stop arriving after a switch, [check getWebhookInfo](/blog/telegram-bot-not-responding).

## FAQ

### Is a webhook faster than long polling?

With long polling Telegram answers the open request as soon as an update arrives, so a single bot process gets messages without a fixed polling delay. Webhooks matter more when you need many parallel connections or have no long-running process at all.

### How long does Telegram keep updates?

The Bot API says incoming updates are stored on the server until the bot receives them, but not longer than 24 hours.

### Which method does Advanced Telegram Economy use?

Long polling. It calls bot.launch() without webhook options, so Telegraf deletes any webhook and polls getUpdates.

## Related posts

- [Make a Telegram bot in Node.js with Telegraf, step by step](/blog/how-to-make-a-telegram-bot)
- [Why a Telegram bot does not respond, and how to fix it](/blog/telegram-bot-not-responding)
- [Serverless Telegram bots: what works and what does not](/blog/serverless-telegram-bot)
- [All posts](/blog/)
