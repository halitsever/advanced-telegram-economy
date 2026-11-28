---
title: "Telegram Anti Spam Bot: Delete Links and Stickers"
titleTemplate: false
description: "How a Telegram anti spam bot works: admin rights, privacy mode, deleteMessage limits, link, sticker and word filters, and paid exceptions in an open source bot."
headline: "A self-hosted anti-spam filter for Telegram groups, in Node.js"
date: "2026-11-28"
keyword: "telegram anti spam bot"
faq: [{"q": "How do I add an anti-spam bot to a Telegram group?", "a": "Add the bot to the group and make it an administrator with the right to delete messages. Admin bots receive all messages, so privacy mode no longer hides ordinary messages from them."}, {"q": "Why can my Telegram bot not delete messages?", "a": "It needs to be an administrator, or have the can_delete_messages right in a supergroup. Telegram also refuses to delete messages older than 48 hours, and some service messages cannot be deleted."}, {"q": "Can Advanced Telegram Economy replace a full anti-spam bot?", "a": "No. It filters a few patterns: com, org and net links, stickers, photos and a list of Turkish swear words. It has no flood limits, captcha for new members or bans."}]
---

# A self-hosted anti-spam filter for Telegram groups, in Node.js

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Most anti-spam bots for Telegram are hosted services you add to a group. Advanced Telegram Economy includes a small filter of its own: it deletes links, stickers, photos and swear words, unless the sender bought the right to post them with in-game money. This post shows how that works in code, what Telegram requires before any bot can delete messages, and where this simple filter falls short.</p>

## What Telegram requires first

Two settings decide whether any moderation bot can work.

**Privacy mode.** By default a bot in a group only sees messages meant for it: commands addressed to it, replies to it, and a few others. The [Telegram bot features page](https://core.telegram.org/bots/features) adds the exception that matters here: bots added to a group as admins always receive all messages. Privacy mode can also be turned off in BotFather with `/setprivacy`, after which the bot has to be removed and added again for the change to apply.

**Delete rights.** From the `deleteMessage` section of the [Bot API reference](https://core.telegram.org/bots/api):

- a bot that is an administrator of a group can delete any message there,
- in a supergroup or channel it needs the `can_delete_messages` right,
- a message can only be deleted if it was sent less than 48 hours ago,
- service messages about creating a supergroup, channel or topic cannot be deleted.

So the setup is: add the bot, promote it to admin, and give it the delete permission.

## How the bot filters

Every message goes through five handlers in [src/index.js](https://github.com/halitsever/advanced-telegram-economy/blob/main/src/index.js):

```js
bot.on("message", async (ctx) => {
  await handleCaseEvent(ctx);
  await handleSticker(ctx);
  await handlePhoto(ctx);
  await handleUrl(ctx);
  await handleBadWords(ctx);
});
```

Each filter follows the same shape. The link filter, from [src/handlers/handle.link.js](https://github.com/halitsever/advanced-telegram-economy/blob/main/src/handlers/handle.link.js):

```js
if (await isUserHaveThisProduct({ id: ctx?.update?.message?.from?.id, productName: "LINK_SHARE_PASS" })) return;

const messageContent = ctx?.update?.message?.text;
const urlRegex = /\b(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+)\.(?:com|org|net)\b/g;
const isIncludesLink = messageContent ? messageContent.match(urlRegex) : null;

if (isIncludesLink) {
  ctx.reply(getString("URL_FORBIDDEN"));
  return ctx.deleteMessage();
}
```

1. If the sender owns the matching pass, the message is allowed.
2. Otherwise the text is tested against a pattern.
3. On a match the bot posts a warning and deletes the message.

The sticker and photo filters check `message.sticker` and `message.photo` instead of a pattern. The word filter tests a list of Turkish swear words and common spellings of them.

## Paid exceptions

What makes this filter different from a plain anti-spam bot is that the rules can be bought off. [src/products.js](https://github.com/halitsever/advanced-telegram-economy/blob/main/src/products.js) defines the passes users can buy with in-game money:

| Pass | Code | Price |
| --- | --- | --- |
| Profanity Sharing Right | `BADWORD_PASS` | 2 |
| Image Sharing Right | `IMAGE_SHARE_PASS` | 1 |
| Sticker Sharing Right | `STICKER_SHARE_PASS` | 1 |
| Link Sharing Right | `LINK_SHARE_PASS` | 2 |

Users earn money with the hourly `/salary` captcha and spend it in `/market` and `/buy`. The moderation rules become part of the game: posting a meme costs money, so people post fewer of them. The [game bot post](/blog/telegram-game-bot) covers the economy side.

## Where it falls short

This is a game feature, not a security product. From reading the code:

- The link pattern only matches `.com`, `.org` and `.net`. A `t.me/...` invite link, a `.io` domain or a link sent as a text link entity passes.
- Photos and stickers are filtered, but videos, GIFs, voice messages and files are not.
- The bot replies before it deletes, so every blocked message leaves a warning in the chat.
- There is no flood limit, no captcha for new members, and no ban or mute. Restricting members is a separate Bot API method, `restrictChatMember`, which this bot does not call.
- The filters query the database for every message in the group, so a very busy group means many SQLite reads. With one process that is fine, as the [database is locked post](/blog/sqlite-database-is-locked) explains.

For a large public group, a dedicated moderation bot is the better tool. For a friends' group that wants rules with a sense of humour, this is what the code does.

## Testing it safely

Telegram's own advice applies: create a second bot with BotFather for testing and run a separate instance with its token. Add it to a test group, make it admin, and send a `.com` link from an account without the pass. The [installation guide](/installation) shows how to start the bot with `TELEGRAM_BOT_TOKEN` and `LANG`.

## FAQ

### How do I add an anti-spam bot to a Telegram group?

Add the bot to the group and make it an administrator with the right to delete messages. Admin bots receive all messages, so privacy mode no longer hides ordinary messages from them.

### Why can my Telegram bot not delete messages?

It needs to be an administrator, or have the can_delete_messages right in a supergroup. Telegram also refuses to delete messages older than 48 hours, and some service messages cannot be deleted.

### Can Advanced Telegram Economy replace a full anti-spam bot?

No. It filters a few patterns: com, org and net links, stickers, photos and a list of Turkish swear words. It has no flood limits, captcha for new members or bans.

## Related posts

- [How a Telegram game bot runs an economy inside a group](/blog/telegram-game-bot)
- [Telegram bot commands: rules, the / menu and per-language lists](/blog/telegram-bot-commands)
- [Why a Telegram bot does not respond, and how to fix it](/blog/telegram-bot-not-responding)
- [All posts](/blog/)
