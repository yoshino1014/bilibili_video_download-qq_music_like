<template>
  <div class="text-[13px] px-9 py-4 box-content downloadList relative">
    <span class="text-3xl font-bold">下载</span>
    <div class="absolute top-[66px] right-9 h-10 leading-10 z-50 text-sm text-[#7b7b7b]">
      <div class="inline-block hover:text-primary cursor-pointer mr-4" @click="openDownloadDir">
        下载目录
      </div>
      <div class="inline-block hover:text-primary cursor-pointer" @click="goSetting">下载设置</div>
    </div>
    <el-tabs v-model="activeName" class="mt-3">
      <el-tab-pane :label="'正在下载' + downloadingArray.length" name="downloading">
        <!-- 正在下载 -->
        <div class="pt-2">
          <!-- 按钮 -->
          <!-- <el-button class="el-button-custom">
            <Icon icon="mdi:check-all" class="mr-1 text-lg"></Icon>
            <span>重新下载</span>
          </el-button> -->
          <el-button class="el-button-custom-primary" @click="deleteDownloading">
            <Icon icon="mdi:delete-empty-outline" class="mr-1 text-lg"> </Icon>
            <span>清空</span>
          </el-button>
          <!-- 列表 -->
          <div :style="{ height: tableHeight + 'px' }" class="mt-7">
            <ul class="flex text-xs text-[#666] h-6 leading-6">
              <li class="flex-1 px-3">标题</li>
              <li class="w-44 px-3">UP</li>
              <li class="w-32">进度</li>
              <li class="w-28 px-3">速度</li>
            </ul>
            <el-scrollbar v-if="downloadingArray.length > 0" :height="350">
              <div
                v-for="(task, index) in downloadingArray"
                :key="index"
                :class="[
                  downloadingSelected.includes(task.id) ? 'bg-[#efefef]' : '',
                  'flex hover:bg-[#efefef] h-[50px] leading-[50px]',
                ]"
              >
                <div class="flex-1 ellipsis-1 px-3">{{ task.title }}</div>
                <div class="w-44 ellipsis-1 px-3">{{ task.up[0].name }}</div>
                <div class="w-32 ellipsis-1 py-[14px]">
                  <el-progress :percentage="task.progress" :stroke-width="22" :text-inside="true">
                    <div class="text-normal">{{ status[task.status].label }}</div>
                  </el-progress>
                </div>
                <div class="w-28 ellipsis-1 px-3">{{ formatVideoSize(task.speed) + '/s' }}</div>
              </div>
            </el-scrollbar>
            <div v-else>
              <el-empty description="没有正在下载的视频" />
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="'下载完成' + completedArray.length" name="completed">
        <!-- 下载完成 -->
        <div class="pt-2">
          <!-- 按钮 -->
          <el-button class="el-button-custom" @click="selectAll">
            <Icon icon="mdi:check-all" class="mr-1 text-lg"></Icon>
            <span>选择全部</span>
          </el-button>
          <el-button class="el-button-custom-primary" @click="deleteComplete">
            <Icon icon="mdi:delete-empty-outline" class="mr-1 text-lg"> </Icon>
            <span>清空</span>
          </el-button>
          <!-- 列表 -->
          <div :style="{ height: tableHeight + 'px' }" class="mt-7">
            <ul class="flex text-xs text-[#666] h-6 leading-6">
              <li class="flex-1 px-3">标题</li>
              <li class="w-44 px-3">UP</li>
              <li class="w-28 px-3">大小</li>
              <li class="w-28 px-3">时长</li>
            </ul>
            <el-scrollbar v-if="completedArray.length > 0" :height="350">
              <div
                v-for="(task, index) in completedArray"
                :key="index"
                :class="[
                  completeSelected.includes(task.id) ? 'bg-[#efefef]' : '',
                  'flex hover:bg-[#efefef] h-[50px] leading-[50px]',
                ]"
                @click.left.exact="chooseTask(task.id)"
                @click.ctrl.exact="multiSelect(task.id)"
                @click.shift.exact="rangeSelect(index)"
                @click.right="showContextmenu(task)"
              >
                <div class="flex-1 ellipsis-1 px-3">
                  <span class="text-red-500 font-bold">
                    {{ task.status === 5 ? '下载失败' : '' }}
                  </span>
                  {{ task.title }}
                </div>
                <div class="w-44 ellipsis-1 px-3">{{ task.up[0].name }}</div>
                <div class="w-28 ellipsis-1 px-3">{{ formatVideoSize(task.size) }}</div>
                <div class="w-28 ellipsis-1 px-3">{{ task.duration }}</div>
              </div>
            </el-scrollbar>
            <div v-else>
              <el-empty description="没有下载完成的视频" />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useTaskStore, useSettingStore, useBaseStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { TaskData } from '@/types/index'
import {
  checkUrl,
  checkUrlRedirect,
  parseHtml,
  getDownloadList,
  addDownloadList,
} from '@/core/bilibili'

const taskStore = useTaskStore()
const settingStore = useSettingStore()
const baseStore = useBaseStore()
const $router = useRouter()
const { taskArray } = storeToRefs(taskStore)
const activeName = ref('downloading')
const tableHeight = ref<number>(window.innerHeight - 315)
const downloadingSelected = ref<string[]>([])
const completeSelected = ref<string[]>([])
const status = {
  0: {
    label: '已完成',
    value: 'success',
  },
  1: {
    label: '视频下载中',
    value: 'active',
  },
  2: {
    label: '音频下载中',
    value: 'active',
  },
  3: {
    label: '视频合成中',
    value: 'active',
  },
  4: {
    label: '排队中',
    value: 'active',
  },
  5: {
    label: '下载失败',
    value: 'exception',
  },
}

const formatVideoSize = (size: number | undefined) => {
  if (size === undefined) {
    return '0kb'
  }
  if (size > 0 && size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)}KB`
  }
  return size === -1 ? '' : `${(size / 1024 / 1024).toFixed(1)}MB`
}

const downloadingArray = computed(() => {
  return taskArray.value
    .filter((item) => {
      return item.status !== 0 && item.status !== 5
    })
    .sort((a, b) => {
      if (a.status === 1 && b.status === 2) {
        return 0
      }
      return a.status - b.status
    })
})

const completedArray = computed(() => {
  return taskArray.value
    .filter((item) => {
      return item.status === 0 || item.status === 5
    })
    .sort((a, b) => {
      return b.completeTime - a.completeTime
    })
})

const openDownloadDir = () => {
  window.electronApi
    .openDir(settingStore.downloadPath)
    .then((res: string) => {
      console.log('打开下载文件夹')
    })
    .catch((e: Error) => {
      console.error(e.message)
    })
}

// 下载设置
const goSetting = () => {
  $router.push('/setting/index')
}

// 单击事件
const chooseTask = (id: string) => {
  completeSelected.value = [id]
}

// 按ctrl多选
const multiSelect = (id: string) => {
  const index = completeSelected.value.indexOf(id)
  if (index !== -1) {
    if (completeSelected.value.length > 1) {
      completeSelected.value.splice(index, 1)
    }
  } else {
    completeSelected.value.push(id)
  }
}

// 按shift多选
const rangeSelect = (index: number) => {
  if (completeSelected.value.length < 1) {
    return
  }
  let start = completedArray.value.findIndex((item) => {
    return item.id === completeSelected.value[0]
  })
  let temp: number
  completeSelected.value = []
  if (start > index) {
    temp = start
    start = index
    index = temp
  }
  for (let i = start; i <= index; i++) {
    completeSelected.value.push(completedArray.value[i].id)
  }
}

// 全选
const selectAll = () => {
  const arr: string[] = []
  for (let i = 0; i < completedArray.value.length; i++) {
    arr.push(completedArray.value[i].id)
  }
  completeSelected.value = arr
}

// 删除全部已完成任务
const deleteComplete = async () => {
  ElMessageBox.confirm('确认删除全部任务？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    draggable: true,
    customClass: 'custom-confirm',
    closeOnClickModal: false,
  }).then(async () => {
    const arr: string[] = []
    for (let i = 0; i < completedArray.value.length; i++) {
      arr.push(completedArray.value[i].id)
    }
    taskStore.deleteTask(arr)
  })
}

// 删除进行中的任务
const deleteDownloading = async () => {
  ElMessageBox.confirm('确认删除全部任务？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    draggable: true,
    customClass: 'custom-confirm',
    closeOnClickModal: false,
  }).then(async () => {
    const arr: string[] = []
    for (let i = 0; i < downloadingArray.value.length; i++) {
      arr.push(downloadingArray.value[i].id)
    }
    taskStore.deleteTask(arr)
  })
}

const showContextmenu = async (task: TaskData) => {
  if (completeSelected.value.length === 0 || !completeSelected.value.includes(task.id)) {
    completeSelected.value = [task.id]
  }
  const res = await window.electronApi.openMenu()
  if (res === 'open') {
    window.electronApi
      .showFile(task.filePathList[0])
      .then((res: any) => {
        console.log(res)
      })
      .catch((err: Error) => {
        ElMessage.warning('文件或已删除')
      })
  } else if (res === 'delete') {
    ElMessageBox.confirm(`已选中${completeSelected.value.length}个任务，确认删除？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      draggable: true,
      customClass: 'custom-confirm',
      closeOnClickModal: false,
    }).then(async () => {
      taskStore.deleteTask(completeSelected.value)
      completeSelected.value = []
    })
  } else if (res === 'selectAll') {
    selectAll()
  } else if (res === 'reload') {
    reloadDownload(task.id)
  }
}

const reloadDownload = async (id: string) => {
  // 获取选中任务数据
  let selectedTask: any[] = []
  completeSelected.value.forEach((item) => {
    const task = taskStore.getTask(item)
    if (task) {
      selectedTask.push(JSON.parse(JSON.stringify(task)))
    }
  })
  taskStore.deleteTask([id])
  selectedTask = selectedTask.map((item) => ({
    url: item.url,
    quality: item.quality,
    curPage: item.page.find((it: any) => it.cid === item.cid)
      ? item.page.find((it: any) => it.cid === item.cid).page
      : 0,
  }))
  for (const key in selectedTask) {
    const item = selectedTask[key]
    if (!item.curPage) {
      continue
    }
    const videoType = checkUrl(item.url)
    const { body, videoUrl } = await checkUrlRedirect(item.url, baseStore.token.SESSDATA)
    const videoInfo = await parseHtml(body, videoType, videoUrl)
    if (videoInfo === -1) {
      continue
    }
    // 当前list只会存在一项
    const list = await getDownloadList(videoInfo, [item.curPage], item.quality)
    const taskList = addDownloadList(list)
    taskStore.updateTaskMap(taskList)
    // 可以下载
    if (taskList[0].status === 1) {
      window.electronApi.downloadVideo({ task: taskList[0], SESSDATA: baseStore.token.SESSDATA })
      taskStore.downloadingTaskCount++
    }
  }
}
</script>

<style lang="scss">
.downloadList {
  .el-tabs {
    .el-tabs__nav-wrap::after {
      height: 0;
    }
    .el-tabs__active-bar {
      display: flex;
      justify-content: center;
      background-color: rgba($color: #000000, $alpha: 0);
      height: 3px !important;
      &::before {
        content: '';
        display: block;
        width: 25px;
        height: 3px;
        background-color: var(--el-color-primary);
        border-radius: 99999px;
      }
    }
  }

  th {
    font-weight: 400;
  }

  .el-table {
    --el-table-header-bg-color: rgba(0, 0, 0, 0);
    --el-table-bg-color: rgba(0, 0, 0, 0);
    --el-table-tr-bg-color: rgba(0, 0, 0, 0);
    --el-table-border: none;
    --el-table-header-text-color: #666666;
    --el-table-text-color: #333;
    --el-table-border-color: rgba(0, 0, 0, 0);
    --el-table-row-hover-bg-color: #efefef;
    font-size: 13px;
    thead {
      font-size: 12px;
      th {
        padding-bottom: 0;
        padding-top: 0;
        height: auto !important;
      }
    }
    .el-table__cell {
      height: 50px;
    }
    .el-table__inner-wrapper::before {
      height: 0;
    }
    .el-table_1_column_3 {
      .cell {
        padding: 0;
      }
    }
  }

  .el-progress-bar__inner,
  .el-progress-bar__outer {
    border-radius: 0% !important;
  }
  .el-progress-bar__inner {
    text-align: left;
  }
}
</style>
