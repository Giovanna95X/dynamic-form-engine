import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/demo',
    },
    {
      path: '/demo',
      component: () => import('@/views/DemoView.vue'),
      meta: { label: '演示场景' },
    },
    {
      path: '/playground',
      component: () => import('@/views/SchemaPlayground.vue'),
      meta: { label: 'Schema 编辑器' },
    },
  ],
});

export default router;
