import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../components/login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/general',
    name: 'general',
    component: () => import('../components/Homepage/General.vue'),
    meta: { title: '商城后台管理系统' },
  },
  {
    path: '/index',
    redirect: '/general',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta.title || 'shopping'
})

export default router
