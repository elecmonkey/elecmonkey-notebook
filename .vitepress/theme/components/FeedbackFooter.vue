<script setup>
</script>

<template>
  <div class="feedback-footer">
    <div class="content">
      <span class="item">🐛 有bug？前往 <a href="https://github.com/elecmonkey/elecmonkey-notebook/issues/new" target="_blank" rel="noopener noreferrer">GitHub仓库</a> 反馈。</span>
      <span class="divider">|</span>
      <span class="item">⭐ 觉得有趣也可以给我点个 <a href="https://github.com/elecmonkey/elecmonkey-notebook" target="_blank" rel="noopener noreferrer">Star</a></span>
    </div>
  </div>
</template>

<style scoped>
.feedback-footer {
  margin-top: 48px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  text-align: center;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  line-height: 1.6;
}

.item {
  white-space: nowrap;
}

.feedback-footer a {
  color: var(--vp-c-brand);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.feedback-footer a:hover {
  color: var(--vp-c-brand-dark);
  text-decoration: underline;
}

.divider {
  margin: 0 4px;
  color: var(--vp-c-divider);
}

@media (max-width: 640px) {
  .divider {
    display: none;
  }
  .content {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
