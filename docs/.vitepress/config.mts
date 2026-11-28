import { defineConfig } from "vitepress";

const base = "/advanced-telegram-economy/";
const siteUrl = `https://projects.halit.org${base}`;
const description = "Self-hosted Telegram economy bot for Node.js, built with Telegraf. Salaries, a central bank, a market, gambling and rankings, in English or Turkish.";

const repoUrl = "https://github.com/halitsever/advanced-telegram-economy";
const license = "https://opensource.org/licenses/MIT";
const author = { "@type": "Person", name: "Halit Sever", url: "https://github.com/halitsever" };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareSourceCode",
      "@id": `${siteUrl}#source`,
      name: "Advanced Telegram Economy",
      description,
      url: siteUrl,
      image: `${siteUrl}og.png`,
      codeRepository: repoUrl,
      programmingLanguage: "JavaScript",
      license,
      author,
    },
  ],
};

/** BlogPosting and breadcrumbs for posts, FAQPage for any page that shows its FAQ. */
function pageJsonLd(fm: Record<string, any>, url: string) {
  const graph: object[] = [];
  if (fm.date) {
    graph.push(
      {
        "@type": "BlogPosting",
        headline: fm.headline ?? fm.title,
        description: fm.description,
        url,
        mainEntityOfPage: url,
        datePublished: fm.date,
        dateModified: fm.date,
        inLanguage: "en",
        image: `${siteUrl}og.png`,
        keywords: fm.keyword,
        author,
        publisher: author,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Advanced Telegram Economy", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}blog/` },
          { "@type": "ListItem", position: 3, name: fm.headline ?? fm.title, item: url },
        ],
      },
    );
  }
  if (fm.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: fm.faq.map((f: { q: string; a: string }) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>|`/g, "") },
      })),
    });
  }
  return graph.length ? { "@context": "https://schema.org", "@graph": graph } : null;
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  /** keeps the page hash map out of every page's HTML, which Semrush reads as a low text-to-HTML ratio */
  metaChunk: true,
  lang: "en-US",
  title: "Advanced Telegram Economy",
  description,
  head: [
    /** Cloudflare Web Analytics, one token for every page on projects.halit.org. */
    ["script", { defer: "", src: "https://static.cloudflareinsights.com/beacon.min.js", "data-cf-beacon": '{"token": "dd7e54d3f48841c187d72d9dbb92a6b6"}' }],
    ["link", { rel: "icon", type: "image/png", href: `${base}bot-logo.png` }],
    ["meta", { property: "og:site_name", content: "Advanced Telegram Economy" }],
    ["meta", { property: "og:image", content: `${siteUrl}og.png` }],
    ["meta", { property: "og:image:width", content: "1280" }],
    ["meta", { property: "og:image:height", content: "640" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: `${siteUrl}og.png` }],
    ["script", { type: "application/ld+json" }, JSON.stringify(jsonLd)],
  ],
  base,
  sitemap: { hostname: siteUrl },
  transformHead({ pageData, title, description: pageDescription }) {
    if (pageData.isNotFound) return;
    const url = siteUrl + pageData.relativePath.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, ".html");
    const ld = pageJsonLd(pageData.frontmatter, url);
    return [
      ["link", { rel: "canonical", href: url }],
      ["meta", { property: "og:url", content: url }],
      ["meta", { property: "og:type", content: pageData.frontmatter.date ? "article" : "website" }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: pageDescription }],
      ...(ld ? [["script", { type: "application/ld+json" }, JSON.stringify(ld)] as [string, Record<string, string>, string]] : []),
    ];
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Installation", link: "/installation" },
      { text: "Gaming bot", link: "/telegram-gaming-bot/" },
      { text: "Blog", link: "/blog/", activeMatch: "^/blog/" },
    ],
    logo: { src: "/bot-logo.png", alt: "Advanced Telegram Economy logo" },

    sidebar: {
      "/blog/": [
        {
          text: "Guides",
          items: [
            { text: "All posts", link: "/blog/" },
            { text: "Make a Telegram bot", link: "/blog/how-to-make-a-telegram-bot" },
            { text: "Get a bot token", link: "/blog/telegram-bot-token" },
            { text: "Bot not responding", link: "/blog/telegram-bot-not-responding" },
            { text: "sendMessage examples", link: "/blog/telegram-bot-api-sendmessage" },
            { text: "Webhook vs polling", link: "/blog/telegram-bot-webhook-vs-polling" },
            { text: "Game bots", link: "/blog/telegram-game-bot" },
            { text: "What is a Telegram bot", link: "/blog/what-is-a-telegram-bot" },
            { text: "Serverless bots", link: "/blog/serverless-telegram-bot" },
            { text: "better-sqlite3", link: "/blog/better-sqlite3" },
            { text: "Database is locked", link: "/blog/sqlite-database-is-locked" },
            { text: "nodemon", link: "/blog/nodemon" },
            { text: "Find a chat ID", link: "/blog/telegram-chat-id" },
            { text: "Bot commands", link: "/blog/telegram-bot-commands" },
            { text: "Anti-spam filter", link: "/blog/telegram-anti-spam-bot" },
          ],
        },
        {
          text: "Docs",
          items: [
            { text: "Installation", link: "/installation" },
            { text: "Gaming bot", link: "/telegram-gaming-bot/" },
          ],
        },
      ],
      "/": [
        {
          text: "Guide",
          items: [
            { text: "Installation", link: "/installation" },
            { text: "Gaming bot", link: "/telegram-gaming-bot/" },
            { text: "Blog", link: "/blog/" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: repoUrl }],
  },
});
