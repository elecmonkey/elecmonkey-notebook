<script setup lang="ts">
import { useRouter } from 'vitepress'

const props = defineProps<{
  title: string
  href: string
  desc?: string
}>()

const router = useRouter()

function go() {
  router.go(props.href)
}
</script>

<template>
  <div class="viz-link-card" @click="go">
    <div class="icon">🔬</div>
    <div class="content">
      <div class="title">{{ title }}</div>
      <div class="desc" v-if="desc">{{ desc }}</div>
      <div class="link-text">点击前往交互式实验 →</div>
    </div>
  </div>
</template>

<style scoped>
.viz-link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.2s;
  margin: 16px 0;
}

.viz-link-card:hover {
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-alt);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.icon {
  font-size: 2em;
}

.content {
  flex: 1;
}

.title {
  font-weight: bold;
  font-size: 1.1em;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.desc {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.link-text {
  font-size: 0.85em;
  color: var(--vp-c-brand-1);
  font-weight: 500;
}
</style>
