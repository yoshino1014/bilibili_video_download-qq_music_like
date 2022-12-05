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
      <span class="cursor-pointer ml-2">{{ route.label }}</span>
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

const $route = useRoute()
const $router = useRouter()

const accessRoute = routes.filter((route) => route.name && !route.meta?.isHidden)
const menuOptions = computed((): MenuOption[] => {
  return accessRoute.map((item) => getMenuItem(item))
})

const getMenuItem = (route: RouteRecordRaw): MenuOption => {
  const visibleChildren = route.children || []
  const singleRoute = visibleChildren[0]
  const menuItem: MenuOption = {
    path: (route.path === '/' ? '' : route.path) + '/' + singleRoute.path,
    label: route.meta && route.meta.title ? route.meta.title : route.name,
    key: route.name,
    icon: route.meta?.icon,
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
  color: #000;
  background: rgba($color: #000000, $alpha: 0);
}

.normal:hover {
  background-color: #d8d8d8;
}
</style>
