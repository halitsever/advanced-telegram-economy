const enStrings = require("./strings.en");
const trStrings = require("./strings.tr");
const enCommandNames = require("./commands.en");
const trCommandNames = require("./commands.tr");

const supportedLanguages = ["tr", "en"];

const checkLanguageIsAvailable = () => {
  return supportedLanguages.includes(process.env.LANG);
};

const getCommandName = (stringName) => {
  return process.env.LANG === "tr" ? trCommandNames[stringName] : enCommandNames[stringName];
};

const getString = (stringName) => {
  return process.env.LANG === "tr" ? trStrings[stringName] : enStrings[stringName];
};

module.exports = { getString, getCommandName, checkLanguageIsAvailable };
