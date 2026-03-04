<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const navItems = [
  { path: '/demo',       label: '演示场景',    desc: 'Schema → 表单' },
  { path: '/playground', label: 'Schema 编辑器', desc: '实时预览'     },
];

const pageTitle = computed(
  () => navItems.find((n) => n.path === route.path)?.label ?? '动态表单引擎',
);
</script>

<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">⚡</div>
        <div class="brand-text">
          <div class="brand-title">动态表单引擎</div>
          <div class="brand-sub">JSON Schema Driven</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <span class="nav-label">{{ item.label }}</span>
          <span class="nav-desc">{{ item.desc }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="tech-stack">
          <div class="ts-title">技术栈</div>
          <div class="ts-tags">
            <span class="ts-tag">Vue 3</span>
            <span class="ts-tag">TypeScript</span>
            <span class="ts-tag">Vite</span>
            <span class="ts-tag">Composition API</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容 -->
    <main class="main-content">
      <div class="content-header">
        <h2 class="content-title">{{ pageTitle }}</h2>
      </div>
      <div class="content-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
}

.brand-icon {
  font-size: 22px;
  width: 36px;
  height: 36px;
  background: var(--accent-dim);
  border: 1px solid rgba(59,130,246,0.3);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.brand-sub {
  font-size: 10px;
  color: var(--text-muted);
  font-family: monospace;
  margin-top: 2px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: var(--radius);
  transition: background 0.15s;
  cursor: pointer;
}

.nav-item:hover { background: var(--bg-elevated); }
.nav-item.active { background: var(--accent-dim); border: 1px solid rgba(59,130,246,0.3); }

.nav-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.nav-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.nav-item.active .nav-label { color: var(--accent); }

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.ts-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.ts-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ts-tag {
  font-size: 10px;
  color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  padding: 2px 7px;
  border-radius: 4px;
  font-family: monospace;
}

/* 主内容 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: 16px 32px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
  flex-shrink: 0;
}

.content-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
}

.content-body {
  flex: 1;
  overflow-y: auto;
  padding: 28px 32px;
  background: var(--bg-primary);
}
</style>
