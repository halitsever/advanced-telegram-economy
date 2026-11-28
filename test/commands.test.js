const { test, before, mock } = require("node:test");
const assert = require("node:assert/strict");
const { botInfo, databaseReady, makeCtx, run, person } = require("./helpers");
const { getUser, setUser, findUser } = require("../src/modules/user.module");
const en = require("../src/lang/strings.en");

const sendMoney = require("../src/commands/send-money");
const caseCommand = require("../src/commands/case");
const buy = require("../src/commands/buy");
const market = require("../src/commands/market");
const items = require("../src/commands/items");
const ranking = require("../src/commands/ranking");
const slot = require("../src/commands/slot");

before(databaseReady);

const totalMoney = async () => (await findUser({})).reduce((sum, u) => sum + u.balance, 0);

test("/sendmoney moves the amount and keeps the total", async () => {
  await setUser({ user: { id: 1, balance: 10 } });
  await getUser({ id: botInfo.id });
  const before = await totalMoney();
  const bankBefore = (await getUser({ id: botInfo.id })).balance;

  const { ctx } = makeCtx({ text: "/sendmoney 5", from: person(1), replyTo: person(2) });
  await run(sendMoney, ctx);

  assert.equal((await getUser({ id: 1 })).balance, 5);
  assert.equal((await getUser({ id: 2 })).balance, 4);
  assert.equal((await getUser({ id: botInfo.id })).balance, bankBefore + 1);
  assert.equal(await totalMoney(), before);
});

test("/sendmoney from a new user replies instead of throwing", async () => {
  const { ctx, replies } = makeCtx({ text: "/sendmoney 5", from: person(3), replyTo: person(1) });
  await run(sendMoney, ctx);
  assert.deepEqual(replies(), [en.NO_BALANCE]);
});

test("/case for a new user says there is no crate", async () => {
  const { ctx, replies } = makeCtx({ text: "/case", from: person(4) });
  await run(caseCommand, ctx);
  assert.deepEqual(replies(), [en.CASE_NOT_FOUND]);
});

test("/buy for a new user says the balance is too low", async () => {
  const { ctx, replies } = makeCtx({ text: "/buy 1", from: person(5) });
  await run(buy, ctx);
  assert.deepEqual(replies(), [en.NO_BALANCE]);
});

test("/buy without a number answers in the bot language", async () => {
  await setUser({ user: { id: 6, balance: 5 } });
  const { ctx, replies } = makeCtx({ text: "/buy", from: person(6) });
  await run(buy, ctx);
  assert.ok(en.INVALID_PRODUCT_ID);
  assert.deepEqual(replies(), [en.INVALID_PRODUCT_ID]);
});

test("/market sends only the product list", async () => {
  const { ctx, replies } = makeCtx({ text: "/market", from: person(1) });
  await run(market, ctx);
  assert.equal(replies().length, 1);
  assert.match(replies()[0], /Market/);
  assert.doesNotMatch(replies()[0], /test/);
});

test("/items with nothing owned says so", async () => {
  const { ctx, replies } = makeCtx({ text: "/items", from: person(7) });
  await run(items, ctx);
  assert.deepEqual(replies(), [en.ITEMS_EMPTY]);
});

test("/items lists owned products by name", async () => {
  await setUser({ user: { id: 8, balance: 5 } });
  await run(buy, makeCtx({ text: "/buy 2", from: person(8) }).ctx);
  const { ctx, replies } = makeCtx({ text: "/items", from: person(8) });
  await run(items, ctx);
  assert.match(replies()[0], /Image Sharing Right/);
});

test("/ranking leaves out the central bank", async () => {
  await setUser({ user: { id: botInfo.id, balance: 1000 } });
  const { ctx, replies } = makeCtx({ text: "/ranking", from: person(1) });
  await run(ranking, ctx);
  assert.doesNotMatch(replies()[0], new RegExp(`id=${botInfo.id}\\)`));
  assert.match(replies()[0], /id=1\)/);
});

const flush = async () => {
  for (let i = 0; i < 20; i++) await new Promise((resolve) => setImmediate(resolve));
};

test("/slot edits the bot's own message", async (t) => {
  await setUser({ user: { id: 10, balance: 10 } });
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { ctx, calls } = makeCtx({ text: "/slot", from: person(10) });
  await run(slot, ctx);
  const spinning = calls.find((c) => c.method === "sendMessage");

  t.mock.timers.tick(3000);
  await flush();

  const edit = calls.find((c) => c.method === "editMessageText");
  assert.ok(edit, "result was not shown");
  assert.equal(edit.payload.message_id, 1000);
  assert.equal(edit.payload.chat_id, spinning.payload.chat_id);
  assert.match(edit.payload.text, /Slot Machine/);
  assert.equal(edit.payload.from, undefined, "the sent message was passed as extra options");
});

test("/slot survives a failed edit", async (t) => {
  await setUser({ user: { id: 11, balance: 10 } });
  const rejections = [];
  const onRejection = (err) => rejections.push(err);
  process.on("unhandledRejection", onRejection);
  t.after(() => process.off("unhandledRejection", onRejection));
  t.mock.timers.enable({ apis: ["setTimeout"] });

  const { ctx } = makeCtx({ text: "/slot", from: person(11) });
  ctx.telegram.callApi = async (method, payload) => {
    if (method === "editMessageText") throw new Error("400: Bad Request: message to edit not found");
    return { message_id: 1000, date: 0, chat: { id: payload.chat_id, type: "group" }, text: payload.text };
  };
  await run(slot, ctx);
  t.mock.timers.tick(3000);
  await flush();

  assert.deepEqual(rejections, []);
});
