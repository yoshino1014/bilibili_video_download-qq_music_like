<template>
  <!-- :key="$route.query.t + $route.path" -->
  <!-- <router-view v-slot="{ Component, route }">
    <keep-alive :include="keepAliveRouteNames">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view> -->
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" v-if="$route.meta.keepAlive" :key="$route.fullPath" />
    </keep-alive>
    <component :is="Component" v-if="!$route.meta.keepAlive" :key="$route.fullPath" />
  </router-view>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
const $router = useRouter()

const allRoutes = $router.getRoutes()
const keepAliveRouteNames = computed(() => {
  return allRoutes.filter((route) => route.meta?.keepAlive).map((route) => route.name as string)
})
</script>
