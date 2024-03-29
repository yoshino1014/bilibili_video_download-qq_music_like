<template>
  <div ref="content" class="px-8 py-3 video-detail h-full">
    <!-- 详情 -->
    <div class="flex">
      <!-- 封面 -->
      <div class="h-44 max-w-[302px] overflow-hidden flex justify-center items-center rounded-lg">
        <el-image
          :src="videoInfo.cover"
          :preview-src-list="[videoInfo.cover]"
          alt="封面"
          class="w-full h-auto"
        />
      </div>

      <!-- 信息 -->
      <div class="ml-6 relative">
        <div class="text-2xl font-bold ellipsis-1 w-[420px]" :title="videoInfo.title">
          {{ videoInfo.title }}
        </div>
        <!-- up -->
        <el-scrollbar>
          <div class="flex pb-3">
            <div
              v-for="(up, index) in videoInfo.up"
              :key="index"
              class="flex items-center shrink-0 mt-4 mr-5"
            >
              <img :src="up.face" alt="" class="w-7 h-7 rounded-full" />
              <span class="text-xs ml-2"
                >{{ up.title
                }}<span class="text-[#FB7299] cursor-pointer" @click="toUserPage(up.mid + '')"
                  >@{{ up.name }}</span
                ></span
              >
            </div>
          </div>
        </el-scrollbar>
        <!-- 标签 -->
        <el-scrollbar>
          <div class="flex pb-3">
            <span
              v-for="(tag, index) in videoInfo.tags"
              :key="index"
              class="text-xs text-normal shrink-0 mr-2"
            >
              #{{ tag }}
            </span>
          </div>
        </el-scrollbar>
        <!-- 描述 -->
        <div class="flex">
          <div class="text-xs text-normal ellipsis-1" :style="{ width: descWidth + 'px' }">
            {{ descInner }}
          </div>
          <span v-if="showDetail" class="text-xs cursor-pointer ml-1" @click="moreDesc = true"
            >[详情]</span
          >
          <div
            v-if="moreDesc"
            class="absolute bg-white text-xs text-normal p-2 z-10"
            :style="{ width: descWidth + 50 + 'px' }"
          >
            {{ descInner }}

            <span class="text-xs cursor-pointer float-right" @click="moreDesc = false">[详情]</span>
          </div>
        </div>
        <!-- 下载按钮 -->
        <el-button
          class="absolute bottom-0 z-0 el-button-custom"
          :disabled="selected.length === 0 || videoInfo.video.length === 0"
          :loading="downloading"
          @click="handleDownload"
        >
          <Icon icon="mdi:download" class="mr-1 text-lg"></Icon>
          <span>点击下载</span>
        </el-button>
        <el-button
          class="absolute bottom-0 left-32 z-0 rounded-full"
          @click="openBrowser(videoInfo.url)"
        >
          <Icon icon="mdi:open-in-app" class="mr-1 text-lg"></Icon>
          <span>打开B站</span>
        </el-button>
        <div
          v-if="baseStore.loginStatus !== 0"
          :class="[
            followStatus ? 'text-yellow-400' : ' text-slate-400',
            'absolute bottom-0 left-64 z-0 rounded-full h-[33px] w-[33px] flex items-center justify-center border ml-3 cursor-pointer',
          ]"
          @click="changeFollow"
        >
          <Icon icon="mdi:star" class="text-lg"></Icon>
        </div>
      </div>
    </div>
    <!-- 获取长度用，无显示意义 -->
    <div class="text-xs text-normal whitespace-nowrap opacity-0">
      <div ref="desc" class="w-auto inline-block">{{ descInner }}</div>
    </div>
    <div class="pt-3 pb-3 flex">
      <div class="text-normal w-24 shrink-0 text-[13px] flex items-center h-7">
        <span>清晰度</span>
        <el-tooltip effect="dark" placement="top" content="登录后可以下载更高清晰度的视频">
          <Icon icon="mdi:information-outline" class="ml-1" />
        </el-tooltip>
      </div>
      <div class="flex">
        <el-radio-group v-model="qualitySelect">
          <el-radio
            v-for="(item, index) in videoInfo.qualityOptions"
            :key="index"
            :label="item.value"
            >{{ item.label }}</el-radio
          >
        </el-radio-group>
      </div>
    </div>
    <el-table
      v-if="videoInfo.page.length > 1"
      ref="downloadTable"
      :data="videoInfo.page"
      :max-height="tableHeight"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column property="title" label="标题" align="left" />
      <el-table-column label="时长" align="center" width="100">
        <template #default="scope">{{ scope.row.duration }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onDeactivated, nextTick, ref, toRaw, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  checkUrl,
  checkUrlRedirect,
  parseHtml,
  getDownloadList,
  addDownloadList,
} from '@/core/bilibili'
import { ElMessage, ElLoading, ElTable } from 'element-plus'
import { useBaseStore, useTaskStore } from '@/store/index'
import type { VideoData, Page } from '@/types/index'
import { Icon } from '@iconify/vue'
import { userQuality } from '@/assets/data/setting'
import { ifFollow, addIn } from '@/api/video'
import { getCollection } from '@/api/collection'

const MAX_WIDTH = 380
const LEFTFORTABLE = 364
const $route = useRoute()
const $router = useRouter()
const baseStore = useBaseStore()
const taskStore = useTaskStore()
const videoInfo = ref<VideoData>({
  id: '',
  title: '',
  url: '',
  bvid: '',
  cid: -1,
  aid: -1,
  cover: '',
  createdTime: -1,
  quality: -1,
  view: -1,
  danmaku: -1,
  reply: -1,
  duration: '',
  up: [],
  qualityOptions: [],
  page: [],
  subtitle: [],
  video: [],
  audio: [],
  filePathList: [],
  fileDir: '',
  size: -1,
  downloadUrl: {
    audio: '',
    video: '',
  },
})
const qualitySelect = ref<number>(-1)
const selected = ref<number[]>([])
const moreDesc = ref<boolean>(false)
const showDetail = ref<boolean>(false)
const desc = ref<HTMLElement>()
const descInner = ref<string | undefined>('')
const descWidth = ref<number>(MAX_WIDTH)
const content = ref<HTMLElement>()
const tableHeight = ref<number>(window.innerHeight - LEFTFORTABLE)
const downloadTable = ref<InstanceType<typeof ElTable>>()
const downloading = ref<boolean>(false)
const followStatus = ref<boolean>(false)

onMounted(async () => {
  const search = $route.query.search
  if (!search) {
    return
  }
  const loading = ElLoading.service({
    target: content.value,
    lock: true,
    text: 'Loading',
    background: '#f6f6f6',
  })
  const type = checkUrl(search as string)
  const { body, videoUrl } = await checkUrlRedirect(search as string, baseStore.token.SESSDATA)
  try {
    const data = await parseHtml(body, type, videoUrl)
    if (data === -1) {
      ElMessage.error('解析错误或者不支持当前视频')
      return
    }
    const acceptQuality = userQuality[baseStore.loginStatus]
    // 根据当前登录状态加载清晰度
    data.qualityOptions = data.qualityOptions.filter((item) => {
      return acceptQuality.includes(item.value)
    })
    videoInfo.value = data
    // 默认选择最高清晰度
    qualitySelect.value = videoInfo.value.qualityOptions[0].value
    // 当只有单集的时候，默认选中
    if (videoInfo.value.page.length === 1) {
      selected.value.push(videoInfo.value.page[0].page)
    }
    //显示窗口
    loading.close()
  } catch (error: any) {
    console.error(error)
    ElMessage.error(`解析错误：${error}`)
  }
  // 自适应
  descInner.value = videoInfo.value.desc
  await nextTick()
  if (desc.value?.clientWidth && descWidth.value < desc.value?.clientWidth) {
    showDetail.value = true
  }
  window.addEventListener('resize', pageResize)
  // 收藏状态
  if (baseStore.loginStatus !== 0 && type === 'BV') {
    ifFollow(videoInfo.value.bvid, baseStore.token.SESSDATA).then((res) => {
      followStatus.value = res.body.data.favoured
    })
  }
})

onDeactivated(() => {
  window.removeEventListener('resize', pageResize, true)
})

const changeFollow = async () => {
  if (!followStatus.value) {
    const {
      body: {
        data: { list },
      },
    } = await getCollection(baseStore.token.DedeUserID, baseStore.token.SESSDATA)
    addIn(baseStore.token.SESSDATA, videoInfo.value.aid, baseStore.token.biliJct, list[0].id).then(
      (res) => {
        ifFollow(videoInfo.value.bvid, baseStore.token.SESSDATA).then((res) => {
          followStatus.value = res.body.data.favoured
          if (followStatus.value) {
            ElMessage.success(`加入默认收藏夹`)
          }
        })
      }
    )
  } else {
    ElMessage.info(`已收藏`)
  }
}

const pageResize = () => {
  const v = window.innerWidth - 1020
  descWidth.value = MAX_WIDTH + v
  if (desc.value?.clientWidth && descWidth.value < desc.value?.clientWidth) {
    showDetail.value = true
  } else {
    showDetail.value = false
    moreDesc.value = false
  }
  tableHeight.value = window.innerHeight - LEFTFORTABLE
}

const handleSelectionChange = (val: Page[]) => {
  selected.value = val.map((page: Page) => {
    return page.page
  })
}

const handleRowClick = (row: any) => {
  // @ts-expect-error
  downloadTable.value!.toggleRowSelection(row, undefined)
}

const handleDownload = async () => {
  downloading.value = true
  try {
    const downloadList = await getDownloadList(
      toRaw(videoInfo.value),
      toRaw(selected.value),
      qualitySelect.value,
      videoInfo.value.url.includes('https://www.bilibili.com/bangumi/play/ep') ? 'media' : 'video'
    )
    const taskList = addDownloadList(downloadList)
    taskStore.updateTaskMap(taskList)
    taskList.forEach((task) => {
      if (task.status === 1) {
        // 下载
        window.electronApi.downloadVideo({ task, SESSDATA: baseStore.token.SESSDATA })
        // 计数+1
        taskStore.downloadingTaskCount++
      }
    })
  } catch (error) {
    ElMessage.error('大会员专属，无法下载')
    console.error(error)
  }
  downloading.value = false
}
const toUserPage = (mid: string) => {
  $router.push({
    path: '/userVideo/index',
    query: { search: mid, t: Date.now() },
  })
}
const openBrowser = (url: string) => {
  window.electronApi.openBrowser(url)
}
</script>

<style lang="scss">
.video-detail {
  .el-scrollbar {
    height: auto !important;
  }

  .el-radio {
    height: auto;
    width: 130px;
    margin: 0;
    padding: 7px 0px;
    --el-radio-font-size: 13px;
    --el-radio-text-color: #000;
    --el-radio-input-bg-color: rgba(0, 0, 0, 0);
    .el-radio__label {
      line-height: 14px;
    }
    .el-radio__input.is-checked + .el-radio__label {
      color: var(--el-radio-text-color);
    }
  }

  .el-checkbox {
    height: auto;
    width: 200px;
    margin: 0;
    --el-checkbox-text-color: #000;
    --el-checkbox-checked-text-color: #000;
    --el-checkbox-bg-color: rgba(0, 0, 0, 0);
    --el-checkbox-checked-bg-color: rgba(0, 0, 0, 0);
    --el-checkbox-checked-icon-color: var(--el-color-primary);
    .el-checkbox__label {
      line-height: 14px;
      font-size: 13px;
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
  }
}
</style>
