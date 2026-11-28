const { test } = require("node:test");
const assert = require("node:assert/strict");
const products = require("../src/products");

const languages = {
  en: { strings: require("../src/lang/strings.en"), commands: require("../src/lang/commands.en") },
  tr: { strings: require("../src/lang/strings.tr"), commands: require("../src/lang/commands.tr") },
};

for (const [lang, { strings, commands }] of Object.entries(languages)) {
  test(`${lang}: the crate message names the real command`, () => {
    assert.ok(strings.CASE_DROP.includes(`/${commands.case} `), strings.CASE_DROP);
  });

  test(`${lang}: the salary tip matches the one-hour limit`, () => {
    assert.doesNotMatch(strings.EARN_MONEY_TIP, /4/);
    assert.ok(strings.EARN_MONEY_TIP.includes(`/${commands.salary}`));
  });

  test(`${lang}: every string key exists in both languages`, () => {
    const other = lang === "en" ? languages.tr.strings : languages.en.strings;
    assert.deepEqual(Object.keys(strings).sort(), Object.keys(other).sort());
  });
}

test("en: the tax message describes the 1 unit tax", () => {
  assert.doesNotMatch(languages.en.strings.TAX_INFO, /half/);
  assert.match(languages.en.strings.TAX_INFO, /1 unit/);
});

test("the market has no test product", () => {
  assert.equal(
    products.find((p) => p.code === "TEST"),
    undefined,
  );
});
