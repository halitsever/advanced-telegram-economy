# AGENTS.md

Advanced Telegram Economy is a self-hosted Telegram economy bot (Telegraf, TypeORM, SQLite) that people run for their own Telegram chats.

## Verify a change

- CI (Node 22) only runs `npm ci` and `npm run docs:build`. There are no tests or linters, so check bot changes by running it against a test bot: `TELEGRAM_BOT_TOKEN=... LANG=en npm run dev`.
- Format the files you touch with `npx prettier --write <files>`. `npm run prettier` rewrites the whole repo, and a few files (including `src/index.js`) are not formatted yet.

## Gotchas

- `LANG` selects the bot language and is the same variable as the shell locale. Only its language prefix is used (`tr_TR.UTF-8` gives Turkish), and an unsupported or missing language falls back to English. Resolve the language with `getLanguage()` from `src/lang/index.js` instead of reading `process.env.LANG`.
- Every file in `src/commands/` and `src/scenes/` is required at startup. Put helpers elsewhere.
- Command names and user-facing strings come from `src/lang/` (`commands.en.js`, `commands.tr.js`, `strings.en.js`, `strings.tr.js`). Add every new key in both languages.
- TypeORM runs with `synchronize: true` against `data.sqlite` in the working directory, so entity changes alter the live database schema on the next start. `*.sqlite` is gitignored.
- There is no image registry or Docker publish workflow. `docker compose up -d --build` builds the image locally from the `Dockerfile`.
- `docs/.vitepress/cache` is committed. Leave cache changes from local docs builds out of your commits.
- `nodemon` is a runtime dependency because `npm run dev` uses it.

## Docs and site

- VitePress source in `docs/`, deployed to https://projects.halit.org/advanced-telegram-economy/ by `.github/workflows/docs.yaml` on every push to `main`.
- `cleanUrls` is off, so page URLs end in `.html`. Static files, including `llms.txt`, `og.png` and `robots.txt`, live in `docs/public/`. Add new pages to `docs/public/llms.txt` too.

## Conventions

- Commit subjects use Conventional Commits, in English, with no body and no trailer. Older history has emoji in subjects; new commits do not.
- Work on a branch and open a pull request. The owner merges.
- New text has no emoji. Code comments are short, one line where possible, and explain why.
- README (`Readme.md`) follows the owner's template. Images served from `halitsever-api.vercel.app` stay byte-for-byte; only the `title=` value of `api/repo-title` and the link around `api/issue` may be corrected.
- Version bumps and image releases are done by the owner.
