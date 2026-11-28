---
title: Installation
description: "Install and run the Advanced Telegram Economy bot: clone the repository, install dependencies and start it with your Telegram bot token."
---

# Install and run the bot with Node.js or Docker

This guide takes you from a fresh clone to a bot that answers commands in your Telegram group. You can run it directly with Node.js or build a Docker image from the included `Dockerfile`.

## Requirements

- Node.js and npm. The CI workflow and the Docker image both use Node.js 22.
- A bot token from [@BotFather](https://t.me/BotFather) on Telegram.
- A group where you can add the bot as an admin.

## Cloning the repository

```bash
git clone https://github.com/halitsever/advanced-telegram-economy.git
cd advanced-telegram-economy
```

## Dependency installation

```bash
npm install
```

This installs Telegraf for the Telegram API, TypeORM with `better-sqlite3` for storage, and `nodemon` for dev mode.

## Configuration

The bot reads its settings from environment variables. It also loads a `.env` file from the working directory through `dotenv`, so you can keep the token there instead of typing it on every start.

| Variable             | Required | Default       | Purpose                                                                                    |
| -------------------- | -------- | ------------- | ------------------------------------------------------------------------------------------ |
| `TELEGRAM_BOT_TOKEN` | Yes      | none          | Token from @BotFather                                                                      |
| `LANG`               | No       | English       | `tr` or a Turkish locale such as `tr_TR.UTF-8` gives Turkish. Anything else gives English. |
| `CASE_THRESHOLD`     | No       | `50`          | Number of counted messages between money crate drops                                       |
| `DATABASE_PATH`      | No       | `data.sqlite` | SQLite file path, relative to the directory you start the bot from                         |

`LANG` is the same variable your shell uses for its locale, so only the language prefix matters. The command names change with the language too: `/salary` in English is `/maas` in Turkish.

## Run with dev mode

```bash
TELEGRAM_BOT_TOKEN=... LANG=<en|tr> npm run dev
```

Dev mode runs the bot through `nodemon`, which restarts it whenever you save a file.

## Run with production mode

```bash
TELEGRAM_BOT_TOKEN=... LANG=<en|tr> npm run start
```

On start the bot logs each command and scene it loads, then prints "Telegram bot started" once it is connected.

## Run with Docker

```bash
TELEGRAM_BOT_TOKEN=... LANG=en docker compose up -d --build
```

The compose file builds the image locally from the `Dockerfile`, passes both variables into the container, mounts the host folder `/data-telegram-bot` at `/app/data`, keeps the database in `/data-telegram-bot/data.sqlite` and restarts the container automatically. No prebuilt image is published.

Older versions of the compose file mounted `/data-telegram-bot` as the database file itself. If yours is a file, move it into a folder of the same name before you start the new version, so your balances carry over:

```bash
sudo mv /data-telegram-bot /data-telegram-bot.sqlite
sudo mkdir /data-telegram-bot
sudo mv /data-telegram-bot.sqlite /data-telegram-bot/data.sqlite
```

If `/data-telegram-bot` is already a folder, Docker created it on the first start, the old version could not open a database there and there is no data to move.

## Add the bot to your group

Add the bot to your group and make it an admin with permission to delete messages. The bot removes links, photos, stickers and swear words from members who have not bought the matching right in `/market`, and it needs that permission to do so.

## Where data is stored

Balances, owned products and salary times are saved in `data.sqlite` in the directory you start the bot from, or in the file `DATABASE_PATH` names. With Docker that is `/data-telegram-bot/data.sqlite` on the host. TypeORM creates and updates the tables on start, so there is no migration step. Back up that file to keep your group's economy.

## Troubleshooting

- **"An error occurred. Please try again."** The bot sends this when a database read or write fails. Check the bot's log for the error.
- **Salary cannot be deposited.** The central bank reserve is empty. It refills from purchases, slot losses, transfer tax and money crates. Check it with `/centralbank`.
- **No reply to commands.** Check that `TELEGRAM_BOT_TOKEN` is set and that the bot logged "Telegram bot started".

See the [home page](/) for how each part of the economy works and the full command list.
