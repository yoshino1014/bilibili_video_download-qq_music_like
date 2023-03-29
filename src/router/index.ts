import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useRouteHistoryStore } from '@/store/index'
import { useBaseStore } from '@/store/index'
import { ElMessage } from 'element-plus'

const Layout = () => import('@/layout/index.vue')
export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'search',
    component: Layout,
    redirect: '/search',
    children: [
      {
        name: 'userSearch',
        path: 'search',
        component: HomeView,
        meta: {
          title: '热门视频',
          icon: 'mdi:magnify-expand',
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: '/videoDetail',
    name: 'video',
    component: Layout,
    meta: {
      isHidden: true,
    },
    children: [
      {
        path: 'index',
        name: 'videoDetail',
        component: () => import('@/views/VideoDetail.vue'),
        meta: {
          title: '视频详情',
          keepAlive: false,
        },
      },
    ],
  },
  {
    path: '/collection',
    name: 'collection',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'userCollection',
        component: () => import('@/views/Collection.vue'),
        meta: {
          title: '个人收藏',
          icon: 'mdi:star-outline',
          keepAlive: false,
        },
      },
    ],
  },
  {
    path: '/follow',
    name: 'follow',
    component: Layout,
    meta: {
      isHidden: false,
    },
    children: [
      {
        path: 'index',
        name: 'followList',
        component: () => import('@/views/FollowList.vue'),
        meta: {
          title: '关注列表',
          icon: 'mdi:account-circle-outline',
          keepAlive: false,
        },
      },
    ],
  },
  {
    path: '/download',
    name: 'download',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'downloadList',
        component: () => import('@/views/DownloadList.vue'),
        meta: {
          title: '下载',
          icon: 'mdi:cloud-download',
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: '/setting',
    name: 'setting',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'downloadSetting',
        component: () => import('@/views/Setting.vue'),
        meta: {
          title: '设置',
          icon: 'mdi:cog',
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: '/userVideo',
    name: 'videoList',
    component: Layout,
    meta: {
      isHidden: true,
    },
    children: [
      {
        path: 'index',
        name: 'userVideo',
        component: () => import('@/views/UserVideo.vue'),
        meta: {
          title: '投稿视频',
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: '/collectionVideo',
    name: 'collectionVideoList',
    component: Layout,
    meta: {
      isHidden: true,
    },
    children: [
      {
        path: 'index',
        name: 'collectionVideo',
        component: () => import('@/views/CollectionVideo.vue'),
        meta: {
          title: '收藏夹内容',
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: '/searchResult',
    name: 'searchPage',
    component: Layout,
    meta: {
      isHidden: true,
    },
    children: [
      {
        path: 'index',
        name: 'searchResult',
        component: () => import('@/views/SearchResult.vue'),
        meta: {
          title: '收藏夹内容',
          keepAlive: true,
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
})

const NeedLogin = ['userCollection', 'collectionVideo', 'followList']

router.beforeEach((to, from) => {
  const baseStore = useBaseStore()
  if (NeedLogin.includes(to.name as string) && baseStore.token.SESSDATA === '') {
    ElMessage.warning('未登录，登录后查看')
    return '/search'
  }
  const routeHistory = useRouteHistoryStore()
  if (!routeHistory.backOrForward) {
    routeHistory.pushRoute(to.fullPath)
  }
  routeHistory.changeStatus(false)
})

export default router
