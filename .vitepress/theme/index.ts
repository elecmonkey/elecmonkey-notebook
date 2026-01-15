// https://vitepress.dev/guide/custom-theme
import { h, defineAsyncComponent } from 'vue'
import Theme from 'vitepress/theme'
import type { EnhanceAppContext } from 'vitepress'
import './custom.css'
import './print.css'
import SubjectCard from './components/SubjectCard.vue'
import SubjectCardContainer from './components/SubjectCardContainer.vue'
import PrintButtons from './components/PrintButtons.vue'
import VisualizationLink from './components/VisualizationLink.vue'

// 异步加载编译原理相关组件，避免污染主包和非相关页面
const RegexToNfa = defineAsyncComponent(() => import('./components/compiler-principles/RegexToNfa.vue'))
const FirstFollow = defineAsyncComponent(() => import('./components/compiler-principles/FirstFollow.vue'))
const NfaToDfa = defineAsyncComponent(() => import('./components/compiler-principles/NfaToDfa.vue'))
const LL1Analyzer = defineAsyncComponent(() => import('./components/compiler-principles/LL1Analyzer.vue'))
const GrammarTransformer = defineAsyncComponent(() => import('./components/compiler-principles/GrammarTransformer.vue'))
const DfaMinimizer = defineAsyncComponent(() => import('./components/compiler-principles/DfaMinimizer.vue'))
const LR1Analyzer = defineAsyncComponent(() => import('./components/compiler-principles/LR1Analyzer.vue'))

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      'doc-before': () => h(PrintButtons)
    })
  },
  enhanceApp({ app }: EnhanceAppContext) {
    // 注册组件
    app.component('SubjectCard', SubjectCard)
    app.component('SubjectCardContainer', SubjectCardContainer)
    app.component('RegexToNfa', RegexToNfa)
    app.component('FirstFollow', FirstFollow)
    app.component('NfaToDfa', NfaToDfa)
    app.component('LL1Analyzer', LL1Analyzer)
    app.component('GrammarTransformer', GrammarTransformer)
    app.component('DfaMinimizer', DfaMinimizer)
    app.component('LR1Analyzer', LR1Analyzer)
    app.component('VisualizationLink', VisualizationLink)
  }
}
