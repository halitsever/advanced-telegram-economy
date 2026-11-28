---
title: "Nodemon: Auto-Restart a Node.js Bot While You Code"
titleTemplate: false
description: "What nodemon does and how to use it: npm run dev, watched extensions, ignore rules, the app crashed message, rs restarts and the node --watch alternative."
headline: "Nodemon for a Telegram bot: restarts, crashes and node --watch"
date: "2026-11-28"
keyword: "nodemon"
faq: [{"q": "What is nodemon?", "a": "A command-line tool that starts a Node.js script and restarts it when files in the folder change. It replaces node in a development command, for example nodemon src/index.js."}, {"q": "What does nodemon app crashed waiting for file changes before starting mean?", "a": "Your script exited with an error. nodemon does not restart it in a loop; it waits until you save a file or type rs. Read the error printed just above the message."}, {"q": "Do I still need nodemon with node --watch?", "a": "Not always. Node.js has a stable --watch flag since version 22 that restarts on changes to the entry file and the modules it loads. nodemon adds config files, extension lists, ignore rules, delays and the rs command."}]
---

# Nodemon for a Telegram bot: restarts, crashes and node --watch

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">nodemon runs your Node.js script and restarts it whenever a watched file changes. Advanced Telegram Economy uses it for npm run dev, so every edit to a command reloads the bot. Here is what it does, what its messages mean, and when Node's built-in watch mode is enough.</p>

## How the bot uses it

From the repository's `package.json`:

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js"
}
```

`npm start` runs the bot once. `npm run dev` runs the same file under nodemon (3.1.14 in the lockfile, also the latest on npm on 28 November 2026). The [installation guide](/installation) uses the dev script for local work and `start` for servers and Docker.

nodemon sits in `dependencies`, not `devDependencies`, so production installs pull it in even though production never calls it. Moving it to `devDependencies` and installing with `npm ci --omit=dev` in production would keep it out.

## What you see when it starts

We ran `npx nodemon src/index.js` in a node:22-alpine container:

```text
[nodemon] 3.1.14
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node src/index.js`
```

Every line nodemon prints itself starts with `[nodemon]`. Everything else is your program's own output.

## app crashed - waiting for file changes before starting

We started it without `TELEGRAM_BOT_TOKEN` on purpose. The bot loaded its scenes and commands, then Telegraf's `launch()` called `getMe` and threw `TelegramError: 401: Bot Token is required`. nodemon then printed:

```text
[nodemon] app crashed - waiting for file changes before starting...
```

This is not a nodemon error. It means your script exited with an error, and nodemon will not restart it in a loop. Read the stack trace above the message, fix the cause, and save a file or type `rs` and Enter. For this bot the usual causes are a missing token, a token from the wrong bot, or a native module built for another Node.js version (see the [better-sqlite3 post](/blog/better-sqlite3)).

If the script exits without an error, the README says nodemon keeps watching and runs it again on the next change.

## What it watches

By default nodemon watches the current folder, and in our run the extensions `js,mjs,cjs,json`. That has a useful side effect here: `data.sqlite` changes on every balance update, but `.sqlite` is not a watched extension, so database writes do not restart the bot.

To change the defaults:

```bash
nodemon --watch src --ext js,json src/index.js
nodemon --ignore 'logs/*' src/index.js
nodemon --delay 2 src/index.js
```

The README warns that ignore rules match the full absolute path, so a wildcard pattern needs `**`, as in `--ignore '**/test/**'`.

The same options can live in a `nodemon.json` next to `package.json`, or in a `nodemonConfig` block inside `package.json`:

```json
{
  "watch": ["src"],
  "ext": "js,json",
  "delay": 2000
}
```

In `nodemon.json`, `delay` is always milliseconds.

## Restarts and the Telegram connection

Every restart stops the bot and starts it again. Telegram keeps updates the bot has not fetched yet for up to 24 hours, so messages sent during a restart arrive once polling resumes. [src/index.js](https://github.com/halitsever/advanced-telegram-economy/blob/main/src/index.js) calls `bot.stop` on `SIGINT` and `SIGTERM`, but nodemon restarts with `SIGUSR2`, which the bot does not handle, so the old process is simply ended. The README shows how to catch `SIGUSR2` when a script needs cleanup before it exits.

If files change but nothing restarts, for example inside some Docker volume setups, the README's answer is legacy polling: `nodemon -L`.

## node --watch

Node.js has its own watch mode. The Node.js 22 CLI docs mark `--watch` stable since v22.0.0:

```bash
node --watch src/index.js
```

It restarts when the entry file or any module it requires changes, and `--watch-path` adds folders. It has no config file, extension list, ignore rules or `rs`. For this bot, which loads every command with `require`, `node --watch` would pick up command edits too. nodemon is still the more flexible tool, and the one the repository ships with.

## Not for production

nodemon is for the edit loop. On a server, use `npm start` under something that restarts on crashes and on boot: Docker's `restart: always` as in the repository's compose file, a systemd service, or a process manager.

## FAQ

### What is nodemon?

A command-line tool that starts a Node.js script and restarts it when files in the folder change. It replaces node in a development command, for example nodemon src/index.js.

### What does nodemon app crashed waiting for file changes before starting mean?

Your script exited with an error. nodemon does not restart it in a loop; it waits until you save a file or type rs. Read the error printed just above the message.

### Do I still need nodemon with node --watch?

Not always. Node.js has a stable --watch flag since version 22 that restarts on changes to the entry file and the modules it loads. nodemon adds config files, extension lists, ignore rules, delays and the rs command.

## Related posts

- [Make a Telegram bot in Node.js with Telegraf, step by step](/blog/how-to-make-a-telegram-bot)
- [Using better-sqlite3 in a Node.js bot, and fixing its install errors](/blog/better-sqlite3)
- [Why a Telegram bot does not respond, and how to fix it](/blog/telegram-bot-not-responding)
- [All posts](/blog/)
