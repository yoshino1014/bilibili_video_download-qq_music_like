<template>
  <ul class="w-full box-border px-6">
    <li
      v-for="route in menuOptions"
      :key="route.path"
      :class="[
        $route.path === route.path ? 'selected' : 'normal',
        'w-full h-8 mt-3 text-sm rounded  select-none flex items-center box-border pl-4',
      ]"
      @click="$router.push(route.path)"
    >
      <Icon :icon="route.icon" class="text-xl" />
      <span class="cursor-pointer ml-2">{{
        route.label +
        (route.label === '下载'
          ? downloadingArray.length === 0
            ? ''
            : downloadingArray.length
          : '')
      }}</span>
    </li>
    <!-- <li class="w-full h-8 mt-3 cursor-pointer text-sm rounded selected">历史记录</li> -->
  </ul>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import type { MenuOption } from '@/types'
import { routes } from '@/router'
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/store'
import { storeToRefs } from 'pinia'

const $route = useRoute()
const $router = useRouter()
const taskStore = useTaskStore()
const { taskArray } = storeToRefs(taskStore)

const downloadingArray = computed(() => {
  return taskArray.value.filter((item) => {
    return item.status !== 0
  })
})
const accessRoute = routes.filter((route) => route.name && !route.meta?.isHidden)
const menuOptions = computed((): MenuOption[] => {
  return accessRoute.map((item) => getMenuItem(item))
})

// const getMenuItem = (route: RouteRecordRaw): MenuOption => {
//   const visibleChildren = route.children || []
//   const singleRoute = visibleChildren[0]
//   const menuItem: MenuOption = {
//     path: (route.path === '/' ? '' : route.path) + '/' + singleRoute.path,
//     label: route.meta && route.meta.title ? route.meta.title : route.name,
//     key: route.name,
//     icon: route.meta?.icon,
//   }
//   return menuItem
// }
function getMenuItem(route: RouteRecordRaw, basePath = '') {
  let menuItem: MenuOption = {
    label: (route.meta && route.meta.title) || route.name,
    key: route.name,
    path: route.path,
    icon: route.meta?.icon,
    children: [],
  }

  const visibleChildren = route.children
    ? route.children.filter((item) => item.name && !item.meta?.isHidden)
    : []

  if (!visibleChildren.length) {
    return menuItem
  }

  if (visibleChildren.length === 1) {
    // 单个子路由处理
    const singleRoute = visibleChildren[0]
    menuItem = {
      label: singleRoute.meta?.title || singleRoute.name,
      key: singleRoute.name,
      path: (route.path === '/' ? '' : route.path) + '/' + singleRoute.path,
      icon: singleRoute.meta?.icon,
      children: [],
    }
    const visibleItems = singleRoute.children
      ? singleRoute.children.filter((item) => item.name && !item.meta?.isHidden)
      : []

    if (visibleItems.length === 1) {
      menuItem = getMenuItem(visibleItems[0], menuItem.path)
    } else if (visibleItems.length > 1) {
      menuItem.children = visibleItems.map((item) => getMenuItem(item, menuItem.path))
    }
  } else {
    menuItem.children = visibleChildren.map((item) => getMenuItem(item, menuItem.path))
  }

  return menuItem
}
</script>

<style lang="scss">
.selected {
  color: white;
  background-image: linear-gradient(to right, #1fd4ae, #1ecc95);
}

.normal {
  background: rgba($color: #000000, $alpha: 0);
}

.normal:hover {
  background-color: #d8d8d8;
}
</style>
