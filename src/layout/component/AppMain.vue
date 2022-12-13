<template>
  <router-view v-slot="{ Component }" :key="$route.path + $route.query.t">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
const $route = useRoute()
</script>
