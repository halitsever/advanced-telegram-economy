const { test, before } = require("node:test");
const assert = require("node:assert/strict");
const { botInfo, databaseReady, makeCtx, run, person } = require("./helpers");
const { getUser } = require("../src/modules/user.module");
const { getBankInfo, increaseBankAmount } = require("../src/modules/bank.module");
const centralBank = require("../src/commands/central-bank");
const en = require("../src/lang/strings.en");

before(databaseReady);

test("getUser creates a missing user and returns it", async () => {
  const user = await getUser({ id: 42 });
  assert.equal(user?.id, 42);
  assert.equal(user.balance, 0);
});

test("the central bank works before the bot has a record", async () => {
  const { ctx } = makeCtx({ text: "/centralbank", from: person(1) });
  assert.equal((await getBankInfo({ ctx }))?.balance, 0);
  await increaseBankAmount({ ctx, increaseAmount: 3 });
  assert.equal((await getUser({ id: botInfo.id })).balance, 3);
});

test("/centralbank shows the reserve", async () => {
  const { ctx, replies } = makeCtx({ text: "/centralbank", from: person(1) });
  await run(centralBank, ctx);
  assert.match(replies()[0], /: 3 /);
});

test("bank errors follow the bot language", async () => {
  const { ctx, replies } = makeCtx({ text: "/x", from: person(1) });
  await increaseBankAmount({ ctx, increaseAmount: -1 });
  assert.deepEqual(replies(), [en.DATABASE_LOCK]);
});
