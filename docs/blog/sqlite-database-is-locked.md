---
title: "SQLite Database Is Locked: Causes and Fixes in Node"
titleTemplate: false
description: "Fix SQLite database is locked (SQLITE_BUSY) in Node.js: what holds the lock, busy timeouts, WAL mode, short transactions and one writer per file."
headline: "Why SQLite says database is locked, and how WAL and timeouts help"
date: "2026-11-28"
keyword: "sqlite database is locked"
faq: [{"q": "What causes SQLite database is locked?", "a": "A connection tried to write, or start a write transaction, while another connection held the write lock, and its busy timeout ran out. The other connection can be in another process, another thread, or the same program."}, {"q": "How do I fix SQLITE_BUSY in better-sqlite3?", "a": "Keep write transactions short, run one writing process per database file, turn on WAL mode with db.pragma('journal_mode = WAL'), and raise the timeout option if waits are expected. The default timeout is 5 seconds."}, {"q": "Does WAL mode stop database is locked errors?", "a": "It stops readers and the writer from blocking each other, but there is still only one writer at a time. Two connections writing at once can still get SQLITE_BUSY."}]
---

# Why SQLite says database is locked, and how WAL and timeouts help

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">SQLITE_BUSY: database is locked means one connection wanted to write while another held the write lock, and it gave up waiting. It is the most common SQLite error in small Node.js apps, Telegram bots included. We reproduced it with better-sqlite3 to show exactly when it happens and what each fix changes.</p>

## What the lock is

SQLite allows many readers but only one writer per database file at a time. A connection that wants to write must take the write lock. If another connection already has it, SQLite waits up to the busy timeout and then returns `SQLITE_BUSY`, which drivers show as `database is locked`.

## Reproducing it

Two better-sqlite3 connections to the same file, in one Node.js 24 process, run in a container on 28 November 2026:

```js
const Database = require("better-sqlite3");
const a = new Database("l.db");
const b = new Database("l.db", { timeout: 1000 });
a.exec("CREATE TABLE users (id INT, balance INT)");

a.exec("BEGIN IMMEDIATE");                       // a takes the write lock
a.prepare("INSERT INTO users VALUES (1, 0)").run();
b.prepare("INSERT INTO users VALUES (2, 0)").run(); // b waits, then throws
```

What we saw:

| Step | Result |
| --- | --- |
| `b` writes while `a` holds the lock | `SQLITE_BUSY: database is locked` after 1000 ms |
| `b` reads while `a` holds the lock (default rollback journal) | the read worked and returned the committed rows |
| Same write test with no `timeout` option | failed after 5 seconds, better-sqlite3's default |

The default journal mode on the new file was `delete`, SQLite's classic rollback journal.

## Fix 1: keep write transactions short

The lock is held from the first write until `COMMIT` or `ROLLBACK`. Anything slow inside a transaction, an HTTP call, a Telegram API request, a `setTimeout`, holds it the whole time. Do the slow work first, then open the transaction, write, and commit. In better-sqlite3, `db.transaction(fn)` wraps a function in `BEGIN` and `COMMIT` and rolls back on an exception, which makes short transactions the easy path.

## Fix 2: one writer per file

Most real-world locks are two processes on one file. With this bot that happens if you leave `npm run dev` running and start the Docker container against the same `data.sqlite`, or run two copies with the same token. Two copies of one bot also fight over `getUpdates`, so they are wrong for more than one reason. One process per database file avoids the whole class of problem.

## Fix 3: WAL mode

```js
db.pragma("journal_mode = WAL");
```

In write-ahead log mode, readers no longer wait for the writer and the writer no longer waits for readers. In our run, after switching to WAL, `b` could read while `a` held an open write transaction, and a second writer still failed with `SQLITE_BUSY`. So WAL helps mixed reads and writes, but it does not allow two writers. The setting is stored in the database file, so it stays on for later connections. WAL adds two files next to the database, `-wal` and `-shm`. Back up all three, or use SQLite's backup API, which better-sqlite3 exposes as `db.backup()`.

The better-sqlite3 README calls WAL generally important for performance, and its [performance doc](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md) covers checkpoints for files that grow.

## Fix 4: a longer timeout

```js
const db = new Database("data.sqlite", { timeout: 10000 });
```

The timeout is how long a connection waits for the lock before throwing. Raising it turns short collisions into short waits. It does not fix a transaction that never ends. Note that better-sqlite3 is synchronous, so while it waits, the whole Node.js event loop waits with it: the bot answers nobody in the meantime.

## What this bot calls a lock

Advanced Telegram Economy has a string named `DATABASE_LOCK`, but it is a general error message ("An error occurred. Please try again.") rather than an SQLite lock. Reading [src/modules/user.module.js](https://github.com/halitsever/advanced-telegram-economy/blob/main/src/modules/user.module.js) shows one reason a user may see it: `getUser` creates a missing user and then returns the old empty result, so commands such as the salary scene reply with that error the first time a new user tries them. A second try finds the user. That is a bug in the bot, not SQLite. The same check sits in the case, buy and send money commands, which the [game bot post](/blog/telegram-game-bot) describes.

## Checklist

1. Find who else has the file open (`lsof data.sqlite` on Linux and macOS).
2. Make sure only one process writes to it.
3. Keep transactions free of network calls.
4. Turn on WAL.
5. Raise `timeout` only after the first four.

## FAQ

### What causes SQLite database is locked?

A connection tried to write, or start a write transaction, while another connection held the write lock, and its busy timeout ran out. The other connection can be in another process, another thread, or the same program.

### How do I fix SQLITE_BUSY in better-sqlite3?

Keep write transactions short, run one writing process per database file, turn on WAL mode with db.pragma('journal_mode = WAL'), and raise the timeout option if waits are expected. The default timeout is 5 seconds.

### Does WAL mode stop database is locked errors?

It stops readers and the writer from blocking each other, but there is still only one writer at a time. Two connections writing at once can still get SQLITE_BUSY.

## Related posts

- [Using better-sqlite3 in a Node.js bot, and fixing its install errors](/blog/better-sqlite3)
- [Why a Telegram bot does not respond, and how to fix it](/blog/telegram-bot-not-responding)
- [Serverless Telegram bots: what works and what does not](/blog/serverless-telegram-bot)
- [All posts](/blog/)
