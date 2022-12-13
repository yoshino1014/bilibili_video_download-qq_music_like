<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { checkLogin, addDownloadList } from '@/core/bilibili'
import { useBaseStore, useSettingStore, useTaskStore } from '@/store/index'
import type { TokenData, SettingData, TaskData } from '@/types/index'

const baseStore = useBaseStore()
const settingStore = useSettingStore()
const taskStore = useTaskStore()

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

// 监听下载进度
window.electronApi.on(
  'download-video-status',
  async ({ id, status, progress }: { id: string; status: number; progress: number }) => {
    const task = taskStore.getTask(id) ? JSON.parse(JSON.stringify(taskStore.getTask(id))) : null
    if (status === 1 || status === 2 || status === 3) {
      taskStore.updateTaskMapNoStore([{ ...task, status, progress }])
    }
    if (status === 0 || status === 5) {
      taskStore.updateTaskMap([{ ...task, status, progress }])
      taskStore.downloadingTaskCount--
      // 检查下载
      const taskMap = taskStore.taskMap
      let allowDownload: TaskData[] = []
      taskMap.forEach((value) => {
        if (value.status === 4) {
          allowDownload.push(JSON.parse(JSON.stringify(value)))
        }
      })
      allowDownload = addDownloadList(allowDownload)
      for (const key in allowDownload) {
        const item = allowDownload[key]
        if (item.status === 1) {
          window.electronApi.downloadVideo(item)
          taskStore.downloadingTaskCount++
        }
      }
    }
  }
)
</script>

<style lang="scss">
.ellipsis-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ellipsis-2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  box-sizing: border-box;
}
</style>
