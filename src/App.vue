<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { checkLogin } from '@/core/bilibili'
import { useBaseStore } from '@/store/index'
import type { TokenData } from '@/types/index'

const baseStore = useBaseStore()

onMounted(() => {
  // 初始化
  window.electronApi.once('init-store', async () => {
    let token = (await window.electronApi.getStore('token')) as TokenData
    if (!token) {
      token = {
        SESSDATA: '',
        DedeUserID: '',
        biliJct: '',
      }
    }
    // 初始化登录信息
    if (token.SESSDATA !== '') {
      const userData = await checkLogin(token.SESSDATA)
      baseStore.token = token
      baseStore.loginStatus = userData.loginStatus
      if (userData.loginStatus !== 0) {
        baseStore.username = userData.username
        baseStore.avatar = userData.avatar
      }
    }
  })
})
</script>

<style lang="scss"></style>
