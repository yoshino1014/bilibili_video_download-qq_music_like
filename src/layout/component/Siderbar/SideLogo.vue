<template>
  <div class="h-16 flex justify-center items-center cursor-pointer" @click="toHome">
    <img src="@/assets/logo.png" alt="" class="w-6 h-6" />
    <img src="@/assets/title.png" class="w-auto h-4 ml-2" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const $router = useRouter()
const toHome = () => {
  $router.push({
    path: '/search',
  })
}
</script>
