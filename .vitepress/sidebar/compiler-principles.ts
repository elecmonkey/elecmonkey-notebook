export default [
  {
    text: '编译原理',
    items: [
      { text: '概述', link: '/compiler-principles/' },
      { text: '第一章：编译原理简介', link: '/compiler-principles/ch01-introduction' },
      { text: '第二章：词法分析', link: '/compiler-principles/ch02-lexical-analysis' },
      { text: '第三章：语法分析', link: '/compiler-principles/ch03-syntax-analysis' },
      { text: '第四章：语法制导翻译', link: '/compiler-principles/ch04-syntax-directed-translation' },
      { text: '第五章：中间表示生成', link: '/compiler-principles/ch05-intermediate-representation' },
      { text: '第六章：运行时环境', link: '/compiler-principles/ch06-runtime-environment' },
    ]
  },
  {
    text: '可视化实验',
    items: [
      { text: '正则表达式转 NFA', link: '/compiler-principles/visualization/regex-to-nfa' },
      { text: 'NFA 转 DFA', link: '/compiler-principles/visualization/nfa-to-dfa' },
      { text: 'DFA 最小化', link: '/compiler-principles/visualization/dfa-minimizer' },
      { text: 'FIRST & FOLLOW 集合', link: '/compiler-principles/visualization/first-follow' },
      { text: '文法变换', link: '/compiler-principles/visualization/grammar-transformer' },
      { text: 'LL(1) 预测分析表', link: '/compiler-principles/visualization/ll1-analyzer' },
      { text: 'LR(1) 分析表', link: '/compiler-principles/visualization/lr1-analyzer' },
      { text: '语法制导翻译 (SDD)', link: '/compiler-principles/visualization/sdd-analyzer' },
      { text: '活动记录 (C语言)', link: '/compiler-principles/visualization/activation-record' },
    ]
  }
] 