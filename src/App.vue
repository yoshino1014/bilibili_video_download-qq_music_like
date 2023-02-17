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
    // 初始化下载任务
    const taskList = (await window.electronApi.getStore('taskList')) as TaskData[]
    const taskMap = new Map<string, TaskData>()
    for (const key in taskList) {
      const task = taskList[key]
      taskMap.set(task.id, task)
    }
    taskStore.setTaskMap(taskMap)
    // // 继续待下载的任务
    const allowDownload: TaskData[] = []
    taskStore.taskMap.forEach((item) => {
      if (item.status === 4) {
        allowDownload.push(JSON.parse(JSON.stringify(item)))
      }
    })
    addDownloadList(allowDownload).forEach((item) => {
      if (item.status === 1) {
        window.electronApi.downloadVideo({ task: item, SESSDATA: baseStore.token.SESSDATA })
        taskStore.downloadingTaskCount++
      }
    })
  })
})

// 监听下载进度
window.electronApi.on(
  'download-video-status',
  async ({
    id,
    status,
    progress,
    speed,
  }: {
    id: string
    status: number
    progress: number
    speed: number
  }) => {
    const task = taskStore.getTask(id) ? JSON.parse(JSON.stringify(taskStore.getTask(id))) : null
    if (status === 1 || status === 2 || status === 3) {
      taskStore.updateTaskMapNoStore([{ ...task, status, progress, speed }])
    }
    if (status === 0 || status === 5) {
      let size = -1
      if (status === 0) {
        size = await window.electronApi.getVideoSize(id)
      }
      taskStore.updateTaskMap([{ ...task, status, progress, size, completeTime: Date.now() }])
      taskStore.downloadingTaskCount--
      // 检查下载
      const taskMap = taskStore.taskMap
      const allowDownload: TaskData[] = []
      taskMap.forEach((value) => {
        if (value.status === 4) {
          allowDownload.push(JSON.parse(JSON.stringify(value)))
        }
      })
      addDownloadList(allowDownload).forEach((item) => {
        if (item.status === 1) {
          window.electronApi.downloadVideo({ task: item, SESSDATA: baseStore.token.SESSDATA })
          taskStore.downloadingTaskCount++
        }
      })
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

.el-button-custom {
  &.el-button {
    --el-button-border-color: rgba(0, 0, 0, 0);
    --el-button-active-text-color: white;
    --el-button-hover-text-color: white;
    width: 110px;
    height: 33px;
    background-image: linear-gradient(to right, #1fd4ae, #1ecc95);
    color: white;
    font-size: 13px;
    border-radius: 9999px;
    border: none;
    &:hover {
      background-image: linear-gradient(to right, #1ec9a4, #1cb987);
    }
  }
  &.el-button.is-disabled {
    background-image: none;
    color: #999;
    border: 1px solid #d2d2d2;
  }
  &.el-button.is-loading {
    position: absolute;
    background-image: linear-gradient(to right, #1fd4ae, #1ecc95);
    color: white;
  }
}

.el-button-custom-primary {
  &.el-button {
    --el-button-hover-bg-color: #e3e3e3;
    --el-button-border-color: rgba(0, 0, 0, 0);
    --el-button-active-text-color: #333;
    --el-button-hover-text-color: #333;
    width: 110px;
    height: 33px;
    background-color: #e3e3e3;
    color: #333;
    font-size: 13px;
    border-radius: 9999px;
    border: none;
    &:hover {
      background-color: #c4c4c4;
    }
  }
}
.keyword {
  color: #f25d8e;
}
</style>
