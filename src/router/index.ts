// router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
// import { watch } from 'vue'
// import { useUserStore } from "@/store/modules/user";

const routes: Array<RouteRecordRaw> = [
  {
    name: 'index',
    path: '/',
    redirect() {
      if (localStorage.getItem('user')) {
        return { path: '/manage' }
      }
      return { path: '/login' }
    },
  },
  {
    name: 'manage',
    path: '/manage',
    meta: {
      title: 'manage',
    },
    component: () => import('@/views/Manage/index.vue'),
    redirect() {
      return { path: '/manage/team' }
    },
    children: [
      {
        name: 'manage-team-page',
        path: 'team',
        meta: {
          title: 'manage-team',
        },
        component: () => import('@/views/Manage/Team/index.vue'),
      },
      {
        name: 'manage-my-page',
        path: 'my',
        meta: {
          title: 'manage-my',
        },
        component: () => import('@/views/Manage/My/index.vue'),
      },
      {
        name: 'manage-talk-page',
        path: 'talk',
        meta: {
          title: 'manage-talk',
        },
        component: () => import('@/views/Manage/Talk/index.vue'),
      },
    ],
  },
  {
    name: 'home',
    path: '/home',
    meta: {
      title: 'home',
    },
    component: () => import('@/views/Home/index.vue'),
  },
  // 页面不存在时的路由
  {
    name: '404',
    path: '/:pathMatch(.*)*',
    meta: {
      title: '404',
    },
    component: () => import('@/views/Error/404.vue'),
  },
  {
    name: 'login',
    path: '/login',
    meta: {
      title: 'login',
    },
    component: () => import('@/views/Login/index.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// const route = useRoute()

// watch(route, (to, from) => {
//   console.log('路由切换')
//   router.go(0)
// })

export default router
