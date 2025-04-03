import { defineConfig } from 'vitepress'

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
    footer: {
      message: '© 2025 EM Notebook<span class="footer-separator">|</span><a href="https://beian.miit.gov.cn/" target="_blank">陕ICP备2023008974号-1</a>',
    },
    docFooter: {
      prev: '上一章',
      next: '下一章'
    },
    externalLinkIcon: true,
    sidebar: {
      '/linear-algebra/': [
        {
          text: '线性代数',
          items: [
            { text: '概述', link: '/linear-algebra/' },
            { text: '第一章：矩阵基础', link: '/linear-algebra/ch01-matrix' },
            { text: '第二章：n维向量', link: '/linear-algebra/ch02-vector' },
            { text: '第三章：线性方程组', link: '/linear-algebra/ch03-linear-equations' },
            { text: '第四章：特征值和特征向量', link: '/linear-algebra/ch04-eigenvalue' },
            { text: '第五章：二次型', link: '/linear-algebra/ch05-quadratic-form' }
          ]
        }
      ],
      '/probability-and-statistics/': [
        {
          text: '概率论与统计',
          items: [
            { text: '第一章：随机事件及其概率', link: '/probability-and-statistics/ch01-probability' }
          ]
        }
      ],
      // '/data-structures/': [
      //   {
      //     text: '数据结构',
      //     items: [
      //       { text: '概述', link: '/data-structures/index' },
      //       { text: '第一章：基本概念', link: '/data-structures/ch01-basics' },
      //       { text: '第二章：线性表', link: '/data-structures/ch02-linear-lists' },
      //       { text: '第三章：栈与队列', link: '/data-structures/ch03-stacks-queues' },
      //       { text: '第四章：树', link: '/data-structures/ch04-trees' },
      //       { text: '第五章：图', link: '/data-structures/ch05-graphs' },
      //       { text: '第六章：查找', link: '/data-structures/ch06-searching' },
      //       { text: '第七章：排序', link: '/data-structures/ch07-sorting' }
      //     ]
      //   }
      // ],
      // '/computer-organization/': [
      //   {
      //     text: '计算机组成原理',
      //     items: [
      //       { text: '概述', link: '/computer-organization/index' },
      //       { text: '第一章：计算机系统概述', link: '/computer-organization/ch01-overview' },
      //       { text: '第二章：数据的表示与运算', link: '/computer-organization/ch02-data-representation' },
      //       { text: '第三章：存储系统', link: '/computer-organization/ch03-storage' },
      //       { text: '第四章：指令系统', link: '/computer-organization/ch04-instruction' },
      //       { text: '第五章：中央处理器', link: '/computer-organization/ch05-cpu' },
      //       { text: '第六章：总线', link: '/computer-organization/ch06-bus' },
      //       { text: '第七章：输入输出系统', link: '/computer-organization/ch07-io' }
      //     ]
      //   }
      // ],
      // '/algorithms/': [
      //   {
      //     text: '算法',
      //     items: [
      //       { text: '概述', link: '/algorithms/index' },
      //       { text: '第一章：算法分析', link: '/algorithms/ch01-analysis' },
      //       { text: '第二章：递归', link: '/algorithms/ch02-recursion' },
      //       { text: '第三章：动态规划', link: '/algorithms/ch03-dynamic-programming' },
      //       { text: '第四章：贪心算法', link: '/algorithms/ch04-greedy' },
      //       { text: '第五章：回溯法', link: '/algorithms/ch05-backtracking' }
      //     ]
      //   }
      // ],
      // '/os/': [
      //   {
      //     text: '操作系统',
      //     items: [
      //       { text: '概述', link: '/os/' },
      //       { text: '第一章：操作系统概述', link: '/os/ch01-overview' },
      //       { text: '第二章：进程管理', link: '/os/ch02-process' },
      //       { text: '第三章：内存管理', link: '/os/ch03-memory' },
      //       { text: '第四章：文件系统', link: '/os/ch04-file-system' },
      //       { text: '第五章：输入输出', link: '/os/ch05-io' }
      //     ]
      //   }
      // ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/elecmonkey/elecmonkey-notebook' }
    ]
  },
  markdown: {
    math: true
  },
})
