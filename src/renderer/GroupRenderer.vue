<script setup lang="ts">
import type { FieldSchema } from '@/engine/types';
import FieldRenderer from './FieldRenderer.vue';

defineProps<{ field: FieldSchema }>();
</script>

<template>
  <div class="group-renderer">
    <div class="group-header">
      <span class="group-label">{{ field.label }}</span>
    </div>
    <div class="group-body">
      <FieldRenderer
        v-for="child in field.children"
        :key="child.key"
        :field="child"
      />
    </div>
  </div>
</template>

<style scoped>
.group-renderer {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin: 8px 0;
}

.group-header {
  padding: 10px 16px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
}

.group-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-body {
  padding: 0 16px;
}
</style>
