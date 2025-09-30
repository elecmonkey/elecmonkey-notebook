<script>
export default {
  name: 'SubjectCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: false,
      default: ''
    },
    type: {
      type: String,
      required: false,
      default: '',
      validator: (value) => {
        return !value || ['progress', 'pending'].includes(value);
      }
    }
  }
}
</script>

<template>
  <a
    v-if="link"
    class="subject-card"
    :href="link"
  >
    <article class="card-box">
      <div class="card-icon" v-html="icon"></div>
      <h2 class="card-title" v-html="title"></h2>
      <p class="card-details" v-html="details"></p>
      <p class="card-type" v-if="type">
        <span v-if="type === 'progress'">&lt;In Progress&gt;</span>
        <span v-else-if="type === 'pending'">&lt;Pending&gt;</span>
      </p>
      <div v-if="!link" class="gray-overlay"></div>
    </article>
  </a>
  <div
    v-else
    class="subject-card no-link"
  >
    <article class="card-box">
      <div class="card-icon" v-html="icon"></div>
      <h2 class="card-title" v-html="title"></h2>
      <p class="card-details" v-html="details"></p>
      <p class="card-type" v-if="type">
        <span v-if="type === 'progress'">&lt;In Progress&gt;</span>
        <span v-else-if="type === 'pending'">&lt;Pending&gt;</span>
      </p>
      <div class="gray-overlay"></div>
    </article>
  </div>
</template>

<style scoped>
.subject-card {
  display: block;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
  overflow: hidden;
}

/* 只有当卡片有链接时才应用悬浮效果 */
a.subject-card:hover {
  transform: translateY(-4px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

/* 无链接卡片的样式 */
div.subject-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 无链接卡片的蒙层样式 */
.no-link .card-box {
  position: relative;
  opacity: 0.5;
}

.no-link .card-icon,
.no-link .card-title,
.no-link .card-details,
.no-link .card-type {
  color: var(--vp-c-text-3);
}

.no-link .gray-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  pointer-events: none;
}

:root.dark .no-link .gray-overlay {
  background-color: rgba(255, 255, 255, 0.05);
}

.card-box {
  display: flex;
  flex-direction: column;
  padding: 24px;
  height: 100%;
  position: relative;
}

.card-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  background-color: rgba(60, 60, 67, 0.06);
  width: 52px;
  height: 52px;
  font-size: 24px;
  transition: background-color 0.25s;
}

/* 夜间模式下的图标背景色 */
:root.dark .card-icon {
  background-color: rgba(235, 235, 245, 0.08);
}

.card-title {
  line-height: 1.4;
  font-size: 16px;
  font-weight: 600;
  margin: 0px;
  color: var(--vp-c-text-1);
  border: none;
}

.card-details {
  flex-grow: 1;
  margin: 0 0 0 0;
  line-height: 1.6;
  font-size: 15px;
  font-weight: 400;
  color: var(--vp-c-text-2);
}

.card-type {
  margin: 5px 0 0 0;
  line-height: 1.2;
  font-size: 12px;
  font-style: italic;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .card-box {
    padding: 20px;
  }
  
  .card-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }
  
  .card-title {
    font-size: 16px;
    margin-bottom: 8px;
  }
  
  .card-details {
    font-size: 13px;
  }
  
  .card-type {
    font-size: 13px;
  }
}
</style> 