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
import FeedbackFooter from './components/FeedbackFooter.vue'

// 异步加载编译原理相关组件，避免污染主包和非相关页面
const RegexToNfa = defineAsyncComponent(() => import('./components/compiler-principles/RegexToNfa.vue'))
const FirstFollow = defineAsyncComponent(() => import('./components/compiler-principles/FirstFollow.vue'))
const NfaToDfa = defineAsyncComponent(() => import('./components/compiler-principles/NfaToDfa.vue'))
const LL1Analyzer = defineAsyncComponent(() => import('./components/compiler-principles/LL1Analyzer.vue'))
const GrammarTransformer = defineAsyncComponent(() => import('./components/compiler-principles/GrammarTransformer.vue'))
const DfaMinimizer = defineAsyncComponent(() => import('./components/compiler-principles/DfaMinimizer.vue'))
const LR0Analyzer = defineAsyncComponent(() => import('./components/compiler-principles/LR0Analyzer.vue'))
const LR1Analyzer = defineAsyncComponent(() => import('./components/compiler-principles/LR1Analyzer.vue'))
const SLR1Analyzer = defineAsyncComponent(() => import('./components/compiler-principles/SLR1Analyzer.vue'))
const SDDAnalyzer = defineAsyncComponent(() => import('./components/compiler-principles/SDDAnalyzer.vue'))
const ActivationRecord = defineAsyncComponent(() => import('./components/compiler-principles/ActivationRecord.vue'))
const ControlFlowAnalyzer = defineAsyncComponent(() => import('./components/compiler-principles/ControlFlowAnalyzer.vue'))
const TACGenerator = defineAsyncComponent(() => import('./components/compiler-principles/TACGenerator.vue'))
const BackpatchingAnalyzer = defineAsyncComponent(() => import('./components/compiler-principles/BackpatchingAnalyzer.vue'))
const DAGOptimizer = defineAsyncComponent(() => import('./components/compiler-principles/DAGOptimizer.vue'))

// 计算机网络组件
const DijkstraAlgorithm = defineAsyncComponent(() => import('./components/computer-networking/DijkstraAlgorithm.vue'))
const DistanceVectorAlgorithm = defineAsyncComponent(() => import('./components/computer-networking/DistanceVectorAlgorithm.vue'))
const TcpConnection = defineAsyncComponent(() => import('./components/computer-networking/TcpConnection.vue'))
const DnsQuery = defineAsyncComponent(() => import('./components/computer-networking/DnsQuery.vue'))
const DhcpProcess = defineAsyncComponent(() => import('./components/computer-networking/DhcpProcess.vue'))
const ArpProtocol = defineAsyncComponent(() => import('./components/computer-networking/ArpProtocol.vue'))
const OspfProtocol = defineAsyncComponent(() => import('./components/computer-networking/OspfProtocol.vue'))
const BgpProtocol = defineAsyncComponent(() => import('./components/computer-networking/BgpProtocol.vue'))
const CsmaCdProtocol = defineAsyncComponent(() => import('./components/computer-networking/CsmaCdProtocol.vue'))
const CsmaCaProtocol = defineAsyncComponent(() => import('./components/computer-networking/CsmaCaProtocol.vue'))
const TcpCongestionControl = defineAsyncComponent(() => import('./components/computer-networking/TcpCongestionControl.vue'))

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
    app.component('LR0Analyzer', LR0Analyzer)
    app.component('LR1Analyzer', LR1Analyzer)
    app.component('SLR1Analyzer', SLR1Analyzer)
    app.component('SDDAnalyzer', SDDAnalyzer)
    app.component('ActivationRecord', ActivationRecord)
    app.component('ControlFlowAnalyzer', ControlFlowAnalyzer)
    app.component('TACGenerator', TACGenerator)
    app.component('BackpatchingAnalyzer', BackpatchingAnalyzer)
    app.component('DAGOptimizer', DAGOptimizer)
    app.component('DijkstraAlgorithm', DijkstraAlgorithm)
    app.component('DistanceVectorAlgorithm', DistanceVectorAlgorithm)
    app.component('TcpConnection', TcpConnection)
    app.component('DnsQuery', DnsQuery)
    app.component('DhcpProcess', DhcpProcess)
    app.component('ArpProtocol', ArpProtocol)
    app.component('OspfProtocol', OspfProtocol)
    app.component('BgpProtocol', BgpProtocol)
    app.component('CsmaCdProtocol', CsmaCdProtocol)
    app.component('CsmaCaProtocol', CsmaCaProtocol)
    app.component('TcpCongestionControl', TcpCongestionControl)
    app.component('VisualizationLink', VisualizationLink)
    app.component('FeedbackFooter', FeedbackFooter)
  }
}
