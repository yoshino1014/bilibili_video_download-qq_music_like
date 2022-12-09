<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { checkLogin } from '@/core/bilibili'
import { useBaseStore, useSettingStore } from '@/store/index'
import type { TokenData, SettingData } from '@/types/index'

const baseStore = useBaseStore()
const settingStore = useSettingStore()

onMounted(() => {
  // 初始化
  window.electronApi.once('init-store', async () => {
    // 初始化登录信息
    let token = (await window.electronApi.getStore('token')) as TokenData
    if (!token) {
      token = {
        SESSDATA: '',
        DedeUserID: '',
        biliJct: '',
      }
    }
    if (token.SESSDATA !== '') {
      const userData = await checkLogin(token.SESSDATA)
      baseStore.token = token
      baseStore.loginStatus = userData.loginStatus
      if (userData.loginStatus !== 0) {
        baseStore.username = userData.username
        baseStore.avatar = userData.avatar
      }
    }
    // 初始化设置信息
    const setting = (await window.electronApi.getStore('setting')) as SettingData
    if (setting) {
      settingStore.setSetting(setting)
    }
  })
})
</script>

<style lang="scss"></style>
