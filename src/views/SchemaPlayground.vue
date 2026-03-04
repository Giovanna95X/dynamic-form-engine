<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { parseSchema } from '@/engine/SchemaParser';
import FormRenderer from '@/renderer/FormRenderer.vue';
import type { FormSchema } from '@/engine/types';

const DEFAULT_SCHEMA = JSON.stringify(
  {
    id: 'playground-v1',
    version: '1.0',
    title: '自定义表单',
    fields: [
      {
        key: 'name',
        type: 'input',
        label: '姓名',
        rules: [{ type: 'required', message: '请输入姓名' }],
      },
      {
        key: 'role',
        type: 'select',
        label: '角色',
        options: [
          { label: '管理员', value: 'admin' },
          { label: '开发者', value: 'dev'   },
          { label: '访客',   value: 'guest' },
        ],
      },
      {
        key: 'email',
        type: 'input',
        label: '邮箱',
        visible: { field: 'role', operator: 'eq', value: 'admin' },
        required: { field: 'role', operator: 'eq', value: 'admin' },
        rules: [{ type: 'pattern', value: 'email-list', message: '请输入有效邮箱' }],
      },
      {
        key: 'remark',
        type: 'textarea',
        label: '备注',
        visible: { field: 'role', operator: 'neq', value: '' },
      },
    ],
  },
  null,
  2,
);

const rawText  = ref(DEFAULT_SCHEMA);
const parseError = ref<string | null>(null);
const schema   = ref<FormSchema | null>(null);
const submitResult = ref<Record<string, any> | null>(null);
const renderKey = ref(0);

// debounce 300ms
let timer: ReturnType<typeof setTimeout>;
watch(rawText, (val) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      schema.value = parseSchema(JSON.parse(val));
      parseError.value = null;
      renderKey.value++;
      submitResult.value = null;
    } catch (e: any) {
      parseError.value = e.message;
      schema.value = null;
    }
  }, 300);
}, { immediate: true });

function handleSubmit(data: Record<string, any>) {
  submitResult.value = data;
}

function resetToDefault() {
  rawText.value = DEFAULT_SCHEMA;
}
</script>

<template>
  <div class="playground fade-in">
    <div class="pg-header">
      <div class="page-tag">实时预览 · Schema Playground</div>
      <h1 class="page-title">Schema 编辑器</h1>
      <p class="page-desc">
        在左侧编辑 JSON Schema，右侧表单实时响应（debounce 300ms）。
        修改字段类型、联动规则、选项列表，即时看到效果。
      </p>
    </div>

    <div class="pg-body">
      <!-- 左侧：编辑器 -->
      <div class="editor-panel">
        <div class="editor-header">
          <span>JSON Schema</span>
          <div class="editor-actions">
            <span v-if="parseError" class="parse-error">✗ {{ parseError }}</span>
            <span v-else class="parse-ok">✓ 合法</span>
            <button class="btn-reset-schema" @click="resetToDefault">恢复默认</button>
          </div>
        </div>
        <textarea
          v-model="rawText"
          class="editor-textarea"
          spellcheck="false"
          autocomplete="off"
        />
      </div>

      <!-- 右侧：预览 -->
      <div class="preview-panel">
        <div class="preview-header">实时渲染预览</div>
        <div class="preview-body">
          <div v-if="parseError" class="preview-error">
            <div class="pe-icon">⚠</div>
            <div class="pe-msg">Schema 解析失败</div>
            <div class="pe-detail">{{ parseError }}</div>
          </div>
          <template v-else-if="schema">
            <FormRenderer
              :key="renderKey"
              :schema="schema"
              @submit="handleSubmit"
            />
            <div v-if="submitResult" class="submit-result">
              <div class="sr-title">✓ 提交数据</div>
              <pre class="sr-json">{{ JSON.stringify(submitResult, null, 2) }}</pre>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playground { max-width: 1100px; }

.pg-header { margin-bottom: 24px; }

.page-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(168,85,247,0.12);
  color: #a855f7;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 12px;
  border: 1px solid rgba(168,85,247,0.3);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
  letter-spacing: -0.5px;
}

.page-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 600px;
}

.pg-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

/* 编辑器 */
.editor-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 680px;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.parse-ok    { font-size: 11px; color: var(--success); font-weight: 500; }
.parse-error { font-size: 11px; color: #ef4444; font-weight: 500; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.btn-reset-schema {
  font-size: 11px;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 8px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.btn-reset-schema:hover { border-color: var(--border-hover); color: var(--text-primary); }

.editor-textarea {
  flex: 1;
  width: 100%;
  padding: 16px;
  background: var(--bg-primary);
  border: none;
  color: var(--text-secondary);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.7;
  resize: none;
  outline: none;
  box-sizing: border-box;
}

/* 预览 */
.preview-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  max-height: 680px;
  overflow-y: auto;
}

.preview-header {
  position: sticky;
  top: 0;
  padding: 10px 16px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 1;
}

.preview-body { padding: 20px; }

.preview-error {
  text-align: center;
  padding: 48px 20px;
}

.pe-icon { font-size: 28px; color: #f59e0b; margin-bottom: 12px; }
.pe-msg  { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.pe-detail { font-size: 12px; color: #ef4444; font-family: monospace; }

.submit-result {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.sr-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--success);
  margin-bottom: 10px;
}

.sr-json {
  font-size: 11px;
  font-family: monospace;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}
</style>
