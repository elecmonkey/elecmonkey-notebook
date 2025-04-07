// https://vitepress.dev/guide/custom-theme
import Theme from 'vitepress/theme'
import './custom.css'
import SubjectCard from './components/SubjectCard.vue'
import SubjectCardContainer from './components/SubjectCardContainer.vue'

export default {
  extends: Theme,
  enhanceApp({ app }) {
    // 注册组件
    app.component('SubjectCard', SubjectCard)
    app.component('SubjectCardContainer', SubjectCardContainer)
  }
} 