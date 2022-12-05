import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'
import HomeView from '../views/HomeView.vue'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'search',
    component: Layout,
    redirect: '/search',
    meta: {
      title: '搜索',
      icon: 'mdi:magnify-expand',
    },
    children: [
      {
        path: 'search',
        component: HomeView,
      },
    ],
  },
  {
    path: '/videoDetail',
    name: 'videoDetail',
    component: Layout,
    redirect: '/videoDetail/index',
    meta: {
      isHidden: true,
      title: '视频详情',
    },
    children: [
      {
        path: 'index',
        component: import('@/views/VideoDetail.vue'),
      },
    ],
  },
  {
    path: '/collection',
    name: 'collection',
    component: Layout,
    redirect: '/collection/index',
    meta: {
      // isHidden: true,
      title: '个人收藏',
      icon: 'mdi:star-outline',
    },
    children: [
      {
        path: 'index',
        component: import('@/views/Collection.vue'),
      },
    ],
  },
  {
    path: '/download',
    name: 'download',
    component: Layout,
    redirect: '/download/index',
    meta: {
      // isHidden: true,
      title: '下载列表',
      icon: 'mdi:cloud-download',
    },
    children: [
      {
        path: 'index',
        component: import('@/views/DownloadList.vue'),
      },
    ],
  },
  {
    path: '/setting',
    name: 'setting',
    component: Layout,
    redirect: '/setting/index',
    meta: {
      // isHidden: true,
      title: '设置',
      icon: 'mdi:cog',
    },
    children: [
      {
        path: 'index',
        component: import('@/views/Setting.vue'),
      },
    ],
  },
  {
    path: '/uploadVideo',
    name: 'uploadVideo',
    component: Layout,
    redirect: '/uploadVideo/index',
    meta: {
      isHidden: true,
      title: '投稿视频',
    },
    children: [
      {
        path: 'index',
        component: import('@/views/UploadVideo.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
