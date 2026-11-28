---
title: "Telegram Bot sendMessage: Examples in Node.js"
titleTemplate: false
description: "The Telegram Bot API sendMessage method in Node.js: ctx.reply vs telegram.sendMessage, parse modes, MarkdownV2 escaping, replies, topics and editing messages."
headline: "Telegram Bot API sendMessage, explained with Node.js examples"
date: "2026-11-28"
keyword: "telegram bot api sendmessage"
faq:
  [
    {
      "q": "What is the maximum length of a Telegram bot message?",
      "a": "The text parameter of sendMessage takes 1 to 4096 characters after entities parsing. Split longer text into several messages.",
    },
    {
      "q": "Should I use Markdown or MarkdownV2?",
      "a": "MarkdownV2 or HTML. Telegram keeps the old Markdown mode only for backward compatibility, and Telegraf marks replyWithMarkdown as deprecated in favour of replyWithMarkdownV2.",
    },
    {
      "q": "How fast can a bot send messages?",
      "a": "Telegram's Bot FAQ says to avoid more than one message per second in a single chat, and that bots cannot send more than 20 messages per minute to the same group.",
    },
  ]
---

# Telegram Bot API sendMessage, explained with Node.js examples

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">sendMessage is the Bot API method behind almost every bot reply. This post goes through its main parameters as Telegram documents them, then shows how Telegraf calls it and where the commands in Advanced Telegram Economy use it.</p>

## The raw method

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": 123456789, "text": "Hello from the Bot API"}'
```

On success the API returns the sent Message object, including its `message_id`. Keep that id if you want to edit or reply to the message later.

## Parameters you will use most

From the [Bot API reference](https://core.telegram.org/bots/api) for sendMessage:

| Parameter              | What it does                                                                   |
| ---------------------- | ------------------------------------------------------------------------------ |
| `chat_id`              | Target chat id, or `@username` of a channel or supergroup                      |
| `text`                 | Message text, 1 to 4096 characters after entities parsing (required)           |
| `parse_mode`           | `MarkdownV2`, `HTML` or the legacy `Markdown`                                  |
| `entities`             | Formatting as a list of entities, instead of `parse_mode`                      |
| `message_thread_id`    | Topic to post in, for forum supergroups                                        |
| `reply_parameters`     | The message to reply to (`message_id`, and `chat_id` if it is in another chat) |
| `reply_markup`         | Inline keyboard, custom keyboard, or a forced reply                            |
| `link_preview_options` | Turn link previews off or change how they look                                 |
| `disable_notification` | Deliver without sound                                                          |
| `protect_content`      | Block forwarding and saving of the message                                     |

## ctx.reply vs telegram.sendMessage in Telegraf

`ctx.reply(text, extra)` is a shortcut for sendMessage to the chat the current update came from. `ctx.telegram.sendMessage(chatId, text, extra)` lets you pick the chat yourself, for example to message a user in private from a group command.

```js
bot.command("ping", (ctx) => ctx.reply("pong"));

bot.command("dm", (ctx) => ctx.telegram.sendMessage(ctx.from.id, "This came to your private chat"));
```

The private message only arrives if the user has started the bot before. A bot cannot open a private chat on its own.

Every command in this bot answers with `ctx.reply`. The bank command sends a plain text line with the user's balance, and the ranking command uses `ctx.replyWithMarkdown` so each line can hold a profile link.

## Formatting: MarkdownV2, HTML and legacy Markdown

**MarkdownV2.** Pass `parse_mode: "MarkdownV2"`. Telegram lists the characters that must be escaped with a backslash outside entities:

```text
_ * [ ] ( ) ~ ` > # + - = | { } . !
```

Forgetting to escape a full stop or a dash is the usual reason for a `can't parse entities` error. Escape any user input before you put it into a MarkdownV2 message.

**HTML.** Pass `parse_mode: "HTML"` and use tags such as `<b>`, `<i>`, `<u>`, `<s>`, `<code>`, `<pre>`, `<a href="...">` and `<blockquote>`. Escape `<`, `>` and `&` in user text.

```js
ctx.replyWithHTML(`<b>Balance:</b> ${user.balance}`);
```

**Legacy Markdown.** Telegram keeps it only for backward compatibility: no nesting, no underline or strikethrough. `/ranking` and `/market` in this repo still use it through `ctx.replyWithMarkdown`, which Telegraf 4.16 marks as deprecated.

## Mentioning a user by id

The ranking command builds links like this:

```js
`[${getString("CLICK_TO_SEE_PROFILE")}](tg://user?id=${person.id})   -  ${person.balance}\n`;
```

Telegram documents `tg://user?id=` links as working only inside an inline link or an inline keyboard button, which is how the bot uses them. They are not clickable as plain text.

## Replying to a specific message

```js
ctx.reply("Got it", { reply_parameters: { message_id: ctx.message.message_id } });
```

To read which message a user replied to, use `ctx.message.reply_to_message`. `/sendmoney` takes the receiver from that field.

## Editing a message you sent

`editMessageText` needs the chat id and the message id of a message the bot sent. In Telegraf, `ctx.editMessageText` edits the message the current update points to. In a callback query that is the bot's message with the button. In a command handler it is the user's command, which a bot cannot edit. To update your own reply, keep the result of `ctx.reply`:

```js
const sent = await ctx.reply("Spinning...");
await ctx.telegram.editMessageText(sent.chat.id, sent.message_id, undefined, "Done");
```

## Limits

Telegram's [Bot FAQ](https://core.telegram.org/bots/faq) asks bots to avoid more than one message per second in a single chat and says a bot cannot send more than 20 messages per minute to the same group. A game command that edits its own message once, as above, stays far below that.

Next: build the bot around these calls with the [Node.js guide](/blog/how-to-make-a-telegram-bot).

## FAQ

### What is the maximum length of a Telegram bot message?

The text parameter of sendMessage takes 1 to 4096 characters after entities parsing. Split longer text into several messages.

### Should I use Markdown or MarkdownV2?

MarkdownV2 or HTML. Telegram keeps the old Markdown mode only for backward compatibility, and Telegraf marks replyWithMarkdown as deprecated in favour of replyWithMarkdownV2.

### How fast can a bot send messages?

Telegram's Bot FAQ says to avoid more than one message per second in a single chat, and that bots cannot send more than 20 messages per minute to the same group.

## Related posts

- [Make a Telegram bot in Node.js with Telegraf, step by step](/blog/how-to-make-a-telegram-bot)
- [Why a Telegram bot does not respond, and how to fix it](/blog/telegram-bot-not-responding)
- [How a Telegram game bot runs an economy inside a group](/blog/telegram-game-bot)
- [Finding a Telegram chat ID for private chats, groups and channels](/blog/telegram-chat-id)
- [All posts](/blog/)
