import { defineAsyncComponent, type Component } from 'vue';

const registry = new Map<string, Component>();

export function registerWidget(name: string, loader: () => Promise<any>) {
  registry.set(
    name,
    defineAsyncComponent({
      loader,
      loadingComponent: {
        template: `<div class="widget-loading"><span class="widget-loading-dot"></span>加载中...</div>`,
      },
      errorComponent: {
        template: `<div class="widget-error">组件加载失败</div>`,
      },
      delay: 200,
      timeout: 10000,
    }),
  );
}

export function resolveWidget(name: string): Component | null {
  return registry.get(name) ?? null;
}

// 注册所有业务组件
registerWidget('ServerScaleWidget',    () => import('@/widgets/ServerScaleWidget.vue'));
registerWidget('DatabaseBackupWidget', () => import('@/widgets/DatabaseBackupWidget.vue'));
registerWidget('LoadBalancerWidget',   () => import('@/widgets/LoadBalancerWidget.vue'));
registerWidget('AlertRuleWidget',      () => import('@/widgets/AlertRuleWidget.vue'));
