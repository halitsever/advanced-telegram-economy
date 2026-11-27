import { defineConfig } from 'vitepress'

const siteUrl = 'https://halitsever.github.io/advanced-telegram-economy/'
const description = 'Self-hosted Telegram economy bot for Node.js, built with Telegraf. Salaries, a central bank, a market, gambling and rankings, in English or Turkish.'

const repoUrl = 'https://github.com/halitsever/advanced-telegram-economy'
const license = 'https://opensource.org/licenses/MIT'
const author = { '@type': 'Person', name: 'Halit Sever', url: 'https://github.com/halitsever' }

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${siteUrl}#source`,
      name: 'Advanced Telegram Economy',
      description,
      url: siteUrl,
      image: `${siteUrl}og.png`,
      codeRepository: repoUrl,
      programmingLanguage: 'JavaScript',
      license,
      author
    }
  ]
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: "Advanced Telegram Economy",
  description,
  head: [
    /** Cloudflare Web Analytics, one token for every page on halitsever.github.io. */
    ['script', { defer: '', src: 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "dd7e54d3f48841c187d72d9dbb92a6b6"}' }],
    ['link', { rel: 'icon', href: '/bot-logo.png' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Advanced Telegram Economy' }],
    ['meta', { property: 'og:image', content: `${siteUrl}og.png` }],
    ['meta', { property: 'og:image:width', content: '1280' }],
    ['meta', { property: 'og:image:height', content: '640' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${siteUrl}og.png` }],
    ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd)]
  ],
  base: '/advanced-telegram-economy/',
  sitemap: { hostname: siteUrl },
  transformHead({ pageData, title, description: pageDescription }) {
    if (pageData.isNotFound) return
    const url = siteUrl + pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html')
    return [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: pageDescription }]
    ]
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Installation', link: '/installation' }
    ],
    logo: { src: '/bot-logo.png', alt: 'Advanced Telegram Economy logo' },

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Installation', link: '/installation' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: repoUrl }
    ]
  }
})
