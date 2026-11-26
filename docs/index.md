---
layout: home
title: Advanced Telegram Economy
titleTemplate: Self-hosted Telegram economy bot

hero:
  name: "Advanced"
  text: "Telegram Economy"
  tagline: A telegram economy bot written with telegraf.js
  actions:
    - theme: brand
      text: Installation
      link: /installation
    - theme: alt
      text: Source Code
      link: https://github.com/halitsever/advanced-telegram-economy

features:
  - title: Auto Salary
    icon: 💰
    details: User based salary with captcha secure
  - title: Central Bank
    icon: 🏦
    details: Dynamic central bank
  - title: And more crazy stuff
    icon: 📈
    details: Gambling, random events, ranking
---

## What it is

Advanced Telegram Economy is a Telegram bot that runs a small virtual economy inside your group chat. Members earn money by claiming a salary and by being active, spend it in a market, gamble it on a slot machine, send it to each other and compete on a ranking. You host the bot yourself with Node.js, and all balances are stored in a local SQLite file, so no outside service sees your chat data.

It suits community groups that want a light game layer, or anyone who wants a working Telegraf, TypeORM and SQLite bot to study or extend. Every command lives in its own file under `src/commands/`, and the bot speaks English or Turkish depending on the `LANG` variable.

## How the economy works

- **Central bank.** The bot keeps one shared reserve. Market purchases, slot losses, transfer tax and money crates add to it, and salaries are paid out of it. When the reserve is empty, nobody can claim a salary.
- **Salary.** `/salary` asks you to type the number marked with a green circle out of five random numbers. Answer within 10 seconds and 1 unit moves from the central bank to your balance. You can claim once per hour.
- **Money crates.** The bot counts group messages, skipping repeated messages from the same person. Every 50 messages (set with `CASE_THRESHOLD`) the sender gets a crate, which `/case` opens for 1 to 3 units.
- **Market.** By default the bot deletes links, photos, stickers and Turkish swear words. `/market` lists the rights that lift each restriction, and `/buy <number>` buys one.
- **Slot machine.** `/slot` costs 2 units. Three matching fruits win 5, two matching win 1, and a loss sends the 2 units to the central bank.
- **Transfers.** Reply to someone's message with `/sendmoney <amount>`. The amount must be more than 2, and 1 unit goes to the central bank as tax.

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

Ready to run it? Follow the [installation guide](/installation).
