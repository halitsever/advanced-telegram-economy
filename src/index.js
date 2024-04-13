const { Telegraf, Composer, session, Scenes } = require("telegraf");
const logger = require("./logger");
const dotenv = require("dotenv");
const fs = require("fs");
const handleUrl = require("./handlers/handle.link");
const handleBadWords = require("./handlers/handle.badword");
const handlePhoto = require("./handlers/handle.photo");
const handleSticker = require("./handlers/handle.sticker");
const handleCaseEvent = require("./handlers/handle.case");

const loadCommands = async (bot) => {
  logger.info(`Commands loading...`);
  const commandsList = fs.readdirSync(__dirname + "/commands");
  const commands = [];
  for (const command of commandsList) {
    commands.push(require(`./commands/${command}`));
    logger.success(`${command} command loaded`);
  }
  bot.use(Composer.compose(commands));
  logger.info(`All commands loaded`);
};

const loadScenes = async (bot) => {
  logger.info(`Scenes loading...`);
  const scenesList = fs.readdirSync(__dirname + "/scenes");
  const scenes = [];
  for (const scene of scenesList) {
    scenes.push(require(`./scenes/${scene}`));
    logger.success(`${scene} scene loaded`);
  }
  const stage = new Scenes.Stage(scenes);
  bot.use(stage.middleware());
  logger.info(`All scenes loaded`);
};

const bootstrap = (async () => {
  dotenv.config();
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  bot.use(session());

  await loadScenes(bot);
  await loadCommands(bot);

  bot.on("message", async (ctx) => {
    await handleCaseEvent(ctx);
    await handleSticker(ctx);
    await handlePhoto(ctx);
    await handleUrl(ctx);
    await handleBadWords(ctx);
  });

  await bot.launch(() => {
    logger.success("Telegram bot started");
  });

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
})();
