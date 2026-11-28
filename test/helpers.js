process.env.LANG = "en";
process.env.DATABASE_PATH = ":memory:";

const { Context, Telegram } = require("telegraf");

const botInfo = { id: 999, is_bot: true, first_name: "Economy", username: "economy_bot" };

const database = require("../src/database");

/** Resolves once TypeORM has opened the database. */
const databaseReady = async () => {
  for (let i = 0; i < 200 && !database.isInitialized; i++) await new Promise((resolve) => setTimeout(resolve, 10));
  if (!database.isInitialized) throw new Error("database did not initialize");
};

/** A real Telegraf context whose API calls are recorded instead of sent. Like Telegram, it refuses to edit messages the bot did not send. */
const makeCtx = ({ text, from, replyTo }) => {
  const calls = [];
  const sentIds = new Set();
  let nextMessageId = 1000;
  const telegram = new Telegram("123:test");
  telegram.callApi = async (method, payload) => {
    calls.push({ method, payload });
    if (method === "editMessageText" && !sentIds.has(payload.message_id)) {
      throw new Error("400: Bad Request: message can't be edited");
    }
    if (method === "sendMessage" && !payload.text) throw new Error("400: Bad Request: message text is empty");
    if (method.startsWith("send")) {
      const message_id = nextMessageId++;
      sentIds.add(message_id);
      return { message_id, date: 0, chat: { id: payload.chat_id, type: "group" }, from: botInfo, text: payload.text };
    }
    return true;
  };
  const command = text.split(" ")[0];
  const update = {
    update_id: 1,
    message: {
      message_id: 1,
      date: 0,
      chat: { id: -100, type: "group" },
      from,
      text,
      entities: command.startsWith("/") ? [{ type: "bot_command", offset: 0, length: command.length }] : [],
      ...(replyTo ? { reply_to_message: { message_id: 2, date: 0, chat: { id: -100, type: "group" }, from: replyTo, text: "hi" } } : {}),
    },
  };
  const ctx = new Context(update, telegram, botInfo);
  const replies = () => calls.filter((c) => c.method.startsWith("send")).map((c) => c.payload.text ?? c.payload.caption);
  return { ctx, calls, replies };
};

const run = (middleware, ctx) => middleware(ctx, async () => {});

const person = (id) => ({ id, is_bot: false, first_name: `User ${id}` });

module.exports = { botInfo, database, databaseReady, makeCtx, run, person };
