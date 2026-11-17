const enStrings = require("./strings.en");
const trStrings = require("./strings.tr");
const enCommandNames = require("./commands.en");
const trCommandNames = require("./commands.tr");

const supportedLanguages = ["tr", "en"];
const fallbackLanguage = "en";
const strings = { en: enStrings, tr: trStrings };
const commandNames = { en: enCommandNames, tr: trCommandNames };

/** LANG is usually a shell locale such as tr_TR.UTF-8, so only the language prefix counts. */
const getRequestedLanguage = () => (process.env.LANG || "").split(/[_.@-]/)[0].toLowerCase();

const checkLanguageIsAvailable = () => {
  return supportedLanguages.includes(getRequestedLanguage());
};

const getLanguage = () => {
  return checkLanguageIsAvailable() ? getRequestedLanguage() : fallbackLanguage;
};

const getCommandName = (stringName) => {
  return commandNames[getLanguage()][stringName];
};

const getString = (stringName) => {
  return strings[getLanguage()][stringName];
};

module.exports = { getString, getCommandName, checkLanguageIsAvailable, getLanguage };
