import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Advanced Telegram Economy",
  description: "Advanced Telegram Economy | A Telegram Economy Bot, is self hostable telegram economy bot for specific telegram channels.",
  head: [['link', { rel: 'icon', href: '/bot-logo.png' }]],
  base: '/advanced-telegram-economy/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Installation', link: '/installation' }
    ],
    logo: '/bot-logo.png',

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Installation', link: '/installation' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/halitsever/advanced-telegram-economy' }
    ]
  }
})
