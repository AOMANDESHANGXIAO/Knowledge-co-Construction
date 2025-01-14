import {createRouter, createWebHashHistory} from 'vue-router'
import type {RouteRecordRaw} from 'vue-router'
import useEventBus from "@/hooks/useEventBus.ts";
import {useUserStore} from "@/store/useUserStore.ts";

const {getToken} = useUserStore()

const routes: Array<RouteRecordRaw> = [
    {
        name: 'index',
        path: '/',
        redirect() {
            if (getToken()) {
                return {path: '/manage'}
            }
            return {path: '/login'}
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
            return {path: '/manage/team'}
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

interface RouterEvent {
    logout: string
}

const routerBus = useEventBus<RouterEvent>()

const handleLayout = async () => {
    await router.push('/')
}

routerBus.on('logout', handleLayout)

export {routerBus}
export default router
