---
title: "Telegram Bot Commands: Menus, Scopes and Languages"
titleTemplate: false
description: "Telegram bot commands explained: naming rules, setMyCommands and BotFather, scopes for groups and admins, language lists, and handling /cmd@bot in Telegraf."
headline: "Telegram bot commands: rules, the / menu and per-language lists"
date: "2026-11-28"
keyword: "telegram bot commands"
faq: [{"q": "How do I add commands to a Telegram bot?", "a": "Handle them in your code, then publish the list so users see suggestions: send /setcommands to BotFather, or call setMyCommands from the bot with an array of command and description pairs."}, {"q": "What characters can a Telegram bot command use?", "a": "In setMyCommands, a command is 1 to 32 characters of lowercase English letters, digits and underscores. The description is 1 to 256 characters."}, {"q": "Can a Telegram bot show different commands to different users?", "a": "Yes. setMyCommands takes a scope, such as all group chats or the administrators of one chat, and a two-letter language_code. Telegram picks the most specific list that exists for each user."}]
---

# Telegram bot commands: rules, the / menu and per-language lists

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Commands are the /words a Telegram bot reacts to. Telegram highlights them in messages, suggests them when a user types a slash, and can show them behind a menu button, but only if the bot publishes its list. This post covers the rules, the two ways to publish a list, and how Advanced Telegram Economy switches every command name between English and Turkish.</p>

## The rules

From the [Telegram bot features page](https://core.telegram.org/bots/features) and the [Bot API reference](https://core.telegram.org/bots/api):

- A command starts with `/` and has up to 32 characters.
- In `setMyCommands`, the command text is 1 to 32 characters of lowercase English letters, digits and underscores, and the description is 1 to 256 characters. At most 100 commands per list.
- Telegram asks every bot to support `/start` and `/help`, and `/settings` where it makes sense. Users see a Start button the first time they open the chat.
- Prefer specific commands: the docs give `/newlocation` and `/newrule` as better than a `/new` that needs a parameter.

Advanced Telegram Economy does not implement `/start` or `/help` today. Its commands are the economy itself: `/salary`, `/bank`, `/market`, `/buy`, `/case`, `/slot` and others.

## Handling a command in Telegraf

Each file in [src/commands](https://github.com/halitsever/advanced-telegram-economy/blob/main/src/commands) exports one handler:

```js
module.exports = Composer.command(getCommandName("salary"), async (ctx) => {
  // ...
});
```

and [src/index.js](https://github.com/halitsever/advanced-telegram-economy/blob/main/src/index.js) loads every file in the folder and composes them. A few behaviours come from Telegraf (4.16.3 here) rather than from the bot:

- The command must be the first entity in the message. `hello /salary` does not trigger it.
- In groups people often write `/salary@your_bot`. Telegraf accepts that when the name after `@` is this bot (compared case-insensitively) and ignores commands addressed to other bots.
- Text after the command is on `ctx.payload`. The bot's `/sendmoney` instead splits the message text on spaces to read the amount.

## Two languages, two command sets

The bot reads `LANG` once at start, and [src/lang/index.js](https://github.com/halitsever/advanced-telegram-economy/blob/main/src/lang/index.js) maps each internal name to a command per language:

| Internal name | English | Turkish |
| --- | --- | --- |
| salary | `/salary` | `/maas` |
| bank | `/bank` | `/banka` |
| buy | `/buy` | `/satinal` |
| case | `/case` | `/kasa` |
| centralbank | `/centralbank` | `/merkezbankasi` |
| items | `/items` | `/esyalar` |
| ranking | `/ranking` | `/enzengin` |
| sendmoney | `/sendmoney` | `/paragonder` |
| market, slot | `/market`, `/slot` | `/market`, `/slot` |

All of them fit Telegram's rules: lowercase Latin letters, no Turkish characters, under 32 characters. A Turkish name such as `/maaş` would not be accepted by `setMyCommands`. One instance speaks one language, so a Turkish group and an English group need two instances with two tokens.

## Publishing the list: BotFather

Send `/setcommands` to @BotFather, pick the bot, and paste one command per line:

```text
salary - Collect your hourly salary
bank - Show your balance
market - List items for sale
```

The bot does not do this itself, so without this step users get no suggestions when they type `/`.

## Publishing the list: setMyCommands

The same from code, with Telegraf:

```js
await bot.telegram.setMyCommands([
  { command: "salary", description: "Collect your hourly salary" },
  { command: "bank", description: "Show your balance" },
]);
```

Two optional parameters make it more useful:

- **scope.** Seven scopes exist, from `default` and `all_private_chats` through `all_group_chats` and `all_chat_administrators` to one `chat`, that chat's administrators, or one member.
- **language_code.** A two-letter ISO 639-1 code. A list set with `language_code: "tr"` is shown to users whose app language is Turkish.

For each user, Telegram walks from the most specific list to the default and shows the first one that exists. In a group, for example, it checks the member scope, then chat administrators, then the chat, then all chat administrators, then all group chats, then default, each first with the user's language and then without.

## Check commands on the server too

The features page is blunt about one thing: updates do not tell you which scope a command came from, and they can contain commands that do not exist at all. Hiding an admin command from regular users is not access control. Check who sent it before acting, for example with `getChatMember` and the member's status.

## FAQ

### How do I add commands to a Telegram bot?

Handle them in your code, then publish the list so users see suggestions: send /setcommands to BotFather, or call setMyCommands from the bot with an array of command and description pairs.

### What characters can a Telegram bot command use?

In setMyCommands, a command is 1 to 32 characters of lowercase English letters, digits and underscores. The description is 1 to 256 characters.

### Can a Telegram bot show different commands to different users?

Yes. setMyCommands takes a scope, such as all group chats or the administrators of one chat, and a two-letter language_code. Telegram picks the most specific list that exists for each user.

## Related posts

- [Make a Telegram bot in Node.js with Telegraf, step by step](/blog/how-to-make-a-telegram-bot)
- [Finding a Telegram chat ID for private chats, groups and channels](/blog/telegram-chat-id)
- [How a Telegram game bot runs an economy inside a group](/blog/telegram-game-bot)
- [All posts](/blog/)
