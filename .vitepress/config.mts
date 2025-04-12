import { defineConfig } from 'vitepress'
import sidebar from './sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "EM Notebook",
  lang: "zh-CN",
  // 大标题
  
  description: "一个计算机笔记本。",
  srcDir: './docs',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }]
  ],
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about/' },
      { text: 'Elecmonkey的小花园', link: 'https://www.elecmonkey.com' },
    ],
    search: {
      provider: 'local'
    },
    logo: '/favicon.svg',
    outline: {
      level: [2, 6],
      label: '目录'
    },
    footer: {
      message: '© 2025 EM Notebook<span class="footer-separator">|</span><a href="https://beian.miit.gov.cn/" target="_blank">陕ICP备2023008974号-1</a>',
    },
    docFooter: {
      prev: '上一章',
      next: '下一章'
    },
    externalLinkIcon: true,
    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/elecmonkey/elecmonkey-notebook' }
    ]
  },
  markdown: {
    math: true
  },
})
