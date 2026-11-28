<p align="center" class="logo-section">
<img src="https://github.com/halitsever/advanced-telegram-economy/blob/main/src/assets/bot-logo.png?raw=true" height="80" width="80" alt="Advanced Telegram Economy bot logo"/>
</br>
<img src="https://halitsever-api.vercel.app/api/repo-title?title=Advanced%20Telegram%20Economy">

<p align="center">
Self-hosted Telegram economy bot for Node.js, built with Telegraf (telegraf.js). Salaries, a central bank, a market, gambling and rankings for your Telegram chats, in English or Turkish.<br>
<br/>
<br/>
<img src="https://img.shields.io/github/sponsors/halitsever" alt="GitHub sponsors"/> 
<img src="https://img.shields.io/github/license/halitsever/advanced-telegram-economy" alt="License: MIT"/> 
</p>
<p align="center">
<a align="center" href="https://projects.halit.org/advanced-telegram-economy/">Documentation</a>
  </p>
</p>

<a align="center">
<img src="https://halitsever-api.vercel.app/api/details"/>
</a>

- [**Auto salary**](#) - User based salary with captcha secure
- [**Central bank**](#) - Dynamic central bank
- [**Market**](#) - Market with buyable items
- [**And more crazy stuff**](#) - Gambling, random events, ranking
- [**English and Turkish**](#) - Pick the bot language with the `LANG` variable
- [**SQLite storage**](#) - Bot data lives in a local SQLite file through TypeORM
- <del>[**TODO**](#) - Help command and more clear usage informations</del>

<a align="center" >
<img src="https://halitsever-api.vercel.app/api/installation"/>
</a>

Dependency installation:

```bash
npm install
```

Run with dev mode:

```bash
TELEGRAM_BOT_TOKEN=... LANG=<en|tr> npm run dev
```

Run with production mode:

```bash
TELEGRAM_BOT_TOKEN=... LANG=<en|tr> npm run start
```

Run with Docker:

```bash
TELEGRAM_BOT_TOKEN=... LANG=<en|tr> docker compose up -d --build
```

The database is kept in `/data-telegram-bot/data.sqlite` on the host. Older compose files mounted `/data-telegram-bot` as the database file itself. If yours is a file, move it into a folder before you upgrade so your balances carry over:

```bash
sudo mv /data-telegram-bot /data-telegram-bot.sqlite
sudo mkdir /data-telegram-bot
sudo mv /data-telegram-bot.sqlite /data-telegram-bot/data.sqlite
```

<a align="center" href="https://github.com/halitsever/advanced-telegram-economy/issues">
<img src="https://halitsever-api.vercel.app/api/issue"/>
</a>

<p align="center">
Found a bug or have an idea? Open an <a href="https://github.com/halitsever/advanced-telegram-economy/issues">issue</a>.<br/>
Read the <a href=".github/CONTRIBUTING.md">contributing guide</a> before sending a pull request.
</p>

<a align="center">
<img src="https://halitsever-api.vercel.app/api/sponsor"/>
</a>

<a align="center">
<img src="https://halitsever-api.vercel.app/api/license"/>
</a>

<p align="center">
  <a href="https://halit.org">Halit Sever</a> | MIT LICENSE 2024
</p>
