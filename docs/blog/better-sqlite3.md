---
title: "better-sqlite3 in Node.js: Setup, Errors and WAL"
titleTemplate: false
description: "better-sqlite3 for Node.js: install, prepare and run, WAL mode, TypeORM's better-sqlite3 driver, and fixes for bindings file and Node upgrade errors."
headline: "Using better-sqlite3 in a Node.js bot, and fixing its install errors"
date: "2026-11-28"
keyword: "better-sqlite3"
faq: [{"q": "What is better-sqlite3?", "a": "A Node.js library for SQLite with a synchronous API. Its README calls it the fastest and simplest library for SQLite in Node.js. It compiles or downloads a native addon when you install it."}, {"q": "How do I fix better-sqlite3 could not locate the bindings file?", "a": "The native addon was never built or was deleted. Run npm rebuild better-sqlite3, or delete node_modules and reinstall, on the same machine and Node.js version that will run the code."}, {"q": "Does better-sqlite3 work with Node 24?", "a": "Yes, but an addon built for one Node.js version does not load in another. After upgrading Node.js, run npm rebuild better-sqlite3. Version 13 of the package requires Node.js 22 or later."}]
---

# Using better-sqlite3 in a Node.js bot, and fixing its install errors

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">better-sqlite3 is the SQLite driver behind Advanced Telegram Economy's balances, items and bank. It is synchronous, it ships native code, and that native part is where almost every problem comes from. This post covers how the bot uses it, the API in a few lines, and the two install errors we reproduced while writing it.</p>

## How the bot uses it

The bot never imports better-sqlite3 directly. It goes through TypeORM, which supports it as a driver. From [src/database/index.js](https://github.com/halitsever/advanced-telegram-economy/blob/main/src/database/index.js):

```js
const dataSource = new typeorm.DataSource({
  type: "better-sqlite3",
  database: "data.sqlite",
  synchronize: true,
  entities: [require("./entity/user.entitiy"), require("./entity/product.entity"), require("./entity/coupon.entity")],
});
```

`database: "data.sqlite"` is a path relative to the working directory, so the file appears wherever you start the bot. `synchronize: true` makes TypeORM create and alter tables to match the entities on every start. That is convenient for a hobby bot and risky for data you care about, because a renamed column can be dropped.

The lockfile pins better-sqlite3 12.11.1. On npm the current release on 28 November 2026 is 13.2.0, which declares `node >= 22`.

## The API in five lines

```js
const Database = require("better-sqlite3");
const db = new Database("data.sqlite");
db.pragma("journal_mode = WAL");
db.prepare("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, balance INTEGER)").run();
const user = db.prepare("SELECT * FROM users WHERE id = ?").get(42);
```

`prepare()` compiles a statement once. `run()` executes it, `get()` returns the first row, `all()` every row, `iterate()` one at a time. Everything returns immediately, with no promises. The README argues that this gives better concurrency than an async API, because SQLite work is serialised anyway. Use `?` placeholders for values instead of building SQL strings.

The one line the README calls generally important is `journal_mode = WAL`. The [database is locked post](/blog/sqlite-database-is-locked) shows what it changes.

## Error 1: Could not locate the bindings file

better-sqlite3 is JavaScript plus a compiled file, `build/Release/better_sqlite3.node`. If that file is missing, `require` fails like this, which we reproduced in a node:22-alpine container by moving the build folder away:

```text
Could not locate the bindings file. Tried:
 → /app/node_modules/better-sqlite3/build/better_sqlite3.node
 → /app/node_modules/better-sqlite3/build/Debug/better_sqlite3.node
```

Common causes:

- `npm install --ignore-scripts`, which skips the step that fetches or builds the addon.
- A failed native build that npm reported and you missed. The [troubleshooting guide](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md) lists the usual ones: an unsupported Node.js version, missing build tools on Windows, spaces or special characters in the project path.
- `node_modules` copied from another machine.

The fix is to rebuild where the code runs:

```bash
npm rebuild better-sqlite3
```

## Error 2: it worked until you upgraded Node.js

A native addon is built against one Node.js version. We installed the bot's dependencies under Node.js 22, then loaded them under Node.js 24 with the same `node_modules`. The error was not the usual friendly version message but a linker failure:

```text
Error relocating /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node: _ZN2v86String9Utf8ValueC1EPNS_7IsolateENS_5LocalINS_5ValueEEE: symbol not found
```

On glibc systems the same mismatch usually reads `was compiled against a different Node.js version using NODE_MODULE_VERSION`. Either way, `npm rebuild better-sqlite3` under the new Node.js fixed it in our run, and a query returned `{ x: 1 }` afterwards.

## Docker: two things to watch

The repository's Dockerfile uses `node:22-alpine` and runs `npm install` inside the image, which is right: the addon is built for the image's Node.js and C library. In our run the install found a prebuilt binary for Alpine and needed no compiler.

Two details in the repository need care, though:

- There is no `.dockerignore`, and the Dockerfile copies the whole folder. A `node_modules` built on your Mac would be copied into the image before `npm install` runs. Add a `.dockerignore` with `node_modules` in it.
- `docker-compose.yml` mounts `/data-telegram-bot` onto `/app/data.sqlite`. If that host path does not exist, Docker creates it as a folder, and the database path inside the container becomes a folder too. We mounted an empty folder there and better-sqlite3 failed with `SQLITE_CANTOPEN: unable to open database file`. Mount a folder onto a folder instead and point `database` at a file inside it.

## When SQLite is the wrong choice

The README is honest about limits: many concurrent writes, many concurrent reads of large blobs, or a database near a terabyte call for a server database such as PostgreSQL. A group chat economy is nowhere near those. One process writing small rows is the case SQLite handles best, which is also why the [serverless post](/blog/serverless-telegram-bot) argues for one small always-on machine.

## FAQ

### What is better-sqlite3?

A Node.js library for SQLite with a synchronous API. Its README calls it the fastest and simplest library for SQLite in Node.js. It compiles or downloads a native addon when you install it.

### How do I fix better-sqlite3 could not locate the bindings file?

The native addon was never built or was deleted. Run npm rebuild better-sqlite3, or delete node_modules and reinstall, on the same machine and Node.js version that will run the code.

### Does better-sqlite3 work with Node 24?

Yes, but an addon built for one Node.js version does not load in another. After upgrading Node.js, run npm rebuild better-sqlite3. Version 13 of the package requires Node.js 22 or later.

## Related posts

- [Why SQLite says database is locked, and how WAL and timeouts help](/blog/sqlite-database-is-locked)
- [Nodemon for a Telegram bot: restarts, crashes and node --watch](/blog/nodemon)
- [Make a Telegram bot in Node.js with Telegraf, step by step](/blog/how-to-make-a-telegram-bot)
- [All posts](/blog/)
