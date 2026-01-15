<script setup>
import { useData } from 'vitepress'

const { frontmatter } = useData()

function printDoc() {
  window.print()
}
</script>

<template>
  <div class="print-buttons" v-if="!frontmatter.pageClass?.includes('no-print-button')">
    <button class="print-btn" @click="printDoc" title="打印 / 导出 PDF">
      <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M18 3H6v4h12m1 5a1 1 0 0 1-1-1a1 1 0 0 1 1-1a1 1 0 0 1 1 1a1 1 0 0 1-1 1m-3 7H8v-5h8m3-6H5a3 3 0 0 0-3 3v6h4v4h12v-4h4v-6a3 3 0 0 0-3-3Z"/></svg>
      <span>打印 / PDF</span>
    </button>
  </div>
</template>

<style scoped>
.print-buttons {
  float: right;
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 10;
}

.print-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.print-btn:hover {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

@media print {
  .print-buttons {
    display: none;
  }
}
</style>
