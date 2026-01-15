// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { EnhanceAppContext } from 'vitepress'
import Theme from 'vitepress/theme'
import './custom.css'
import './print.css'
import SubjectCard from './components/SubjectCard.vue'
import SubjectCardContainer from './components/SubjectCardContainer.vue'
import PrintButtons from './components/PrintButtons.vue'
import RegexToNfa from './components/compiler-principles/RegexToNfa.vue'
import FirstFollow from './components/compiler-principles/FirstFollow.vue'
import NfaToDfa from './components/compiler-principles/NfaToDfa.vue'

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
  }
}
