<script>
export default {
  name: 'SubjectCardContainer',
  props: {
    title: {
      type: String,
      required: false,
      default: ''
    },
    columns: {
      type: [Number, String],
      required: false,
      default: 'auto'
    },
    minWidth: {
      type: String,
      required: false,
      default: '280px'
    }
  }
}
</script>

<template>
  <section class="subject-container">
    <div class="container-header" v-if="title">
      <h2 class="container-title">{{ title }}</h2>
    </div>
    <div class="cards-grid" :class="{
      'auto-grid': columns === 'auto',
      'grid-1': columns === 1,
      'grid-2': columns === 2,
      'grid-3': columns === 3,
      'grid-4': columns === 4,
    }">
      <slot></slot>
    </div>
  </section>
</template>

<style scoped>
.subject-container {
  margin-bottom: 1.5rem;
  width: 100%;
}

.container-header {
  margin-bottom: 1.8rem;
  position: relative;
}

.container-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
  position: relative;
  padding-bottom: 8px;
}

.cards-grid {
  display: grid;
  gap: 20px;
}

/* 自动响应式布局 */
.auto-grid {
  grid-template-columns: repeat(1, 1fr);
}

/* 固定列数布局 */
.grid-1 {
  grid-template-columns: repeat(1, 1fr);
}

.grid-2 {
  grid-template-columns: repeat(1, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(1, 1fr);
}

.grid-4 {
  grid-template-columns: repeat(1, 1fr);
}

/* 响应式断点 */
@media (min-width: 640px) {
  .auto-grid, .grid-2, .grid-3, .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 960px) {
  .auto-grid, .grid-3, .grid-4 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .auto-grid, .grid-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 