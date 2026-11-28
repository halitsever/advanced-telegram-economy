---
title: "Telegram Bot Guides for Node.js Developers"
titleTemplate: false
description: "Guides to building Telegram bots in Node.js: BotFather tokens, Telegraf, sendMessage, webhooks vs polling, serverless hosting and fixing a silent bot."
---

# Telegram bot guides

<p class="lead">Practical notes on building and running Telegram bots with Node.js. Each post is checked against Telegram's own documentation and uses the source of Advanced Telegram Economy, a self-hosted Telegraf bot, as the worked example.</p>

## [Make a Telegram bot in Node.js with Telegraf, step by step](/blog/how-to-make-a-telegram-bot)

Make a Telegram bot with Node.js and Telegraf: get a token from BotFather, answer commands, store data in SQLite, then run it in a group. Real code included.

## [Get a Telegram bot token from BotFather and keep it safe](/blog/telegram-bot-token)

Get a Telegram bot token from BotFather with /newbot, test it with getMe, keep it out of git with an env variable, and replace it with /token if it leaks.

## [Why a Telegram bot does not respond, and how to fix it](/blog/telegram-bot-not-responding)

Telegram bot not responding? Check the token, a second running copy, the webhook, privacy mode in groups, admin rights and the command language. With fixes.

## [Telegram Bot API sendMessage, explained with Node.js examples](/blog/telegram-bot-api-sendmessage)

The Telegram Bot API sendMessage method in Node.js: ctx.reply vs telegram.sendMessage, parse modes, MarkdownV2 escaping, replies, topics and editing messages.

## [Telegram bots: webhook or long polling?](/blog/telegram-bot-webhook-vs-polling)

Webhook vs long polling for Telegram bots in Node.js: how getUpdates and setWebhook work, ports and secret tokens, and why a SQLite bot is fine with polling.

## [How a Telegram game bot runs an economy inside a group](/blog/telegram-game-bot)

How a Telegram game bot can run an economy game in a group chat: salaries with a captcha, a central bank, a market, crates and rankings, explained from code.

## [What a Telegram bot is and how it works](/blog/what-is-a-telegram-bot)

What is a Telegram bot? A program that uses the Bot API to answer messages, run commands and manage groups. How bots work, what they can do and their limits.

## [Serverless Telegram bots: what works and what does not](/blog/serverless-telegram-bot)

Can a Telegram bot run serverless? Yes, with a webhook and external storage. Why a bot that keeps SQLite and in-memory state needs a small always-on server.
