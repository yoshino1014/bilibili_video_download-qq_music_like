<template>
  <div ref="userVideo" class="py-3 h-full userVideo overflow-auto">
    <el-scrollbar class="px-8">
      <div class="flex">
        <!-- 头像 -->
        <img :src="userInfo.face" alt="" class="w-44 rounded-full" />
        <!-- 信息 -->
        <div class="ml-6 relative">
          <div class="text-3xl font-bold ellipsis-1 w-[420px] mt-5" :title="userInfo.name">
            {{ userInfo.name }}
          </div>
          <div class="text-xs text-normal mt-6 w-[420px]">
            {{ userInfo.sign }}
          </div>
        </div>
      </div>
      <!-- 查询条件 -->
      <div class="mt-6 flex justify-between items-center">
        <!-- 排序 -->
        <div class="flex text-sm">
          <span
            v-for="(item, index) in orderList"
            :key="index"
            :class="[
              querParam.order === item.value ? 'text-[#1cc498]' : '',
              'cursor-pointer',
              'mr-3',
            ]"
            @click="handleOrder(item.value)"
            >{{ item.label }}</span
          >
        </div>
        <!-- 搜索 -->
        <el-input
          v-model="querParam.keyword"
          class="w-48"
          placeholder="搜索视频"
          @keydown.enter="handleCurrentChange"
        >
          <template #suffix>
            <Icon
              icon="ant-design:search-outlined"
              class="cursor-pointer hover:text-primary"
              @click="handleCurrentChange"
            />
          </template>
        </el-input>
      </div>
      <!-- 列表 -->
      <div class="flex flex-wrap">
        <div
          v-for="(video, index) in vList"
          :key="index"
          class="w-1/4 p-[10px] relative video-card"
        >
          <img :src="video.pic" alt="" class="w-full h-auto rounded" />
          <div
            class="text-xs overflow-hidden cursor-pointer hover:text-primary"
            style="line-height: 20px; height: 38px; margin-top: 6px"
            @click="toVideoDetail(video.bvid)"
          >
            {{ video.title }}
          </div>
          <div
            style="height: 14px; line-height: 14px; font-size: 12px; color: #999; margin-top: 6px"
            class="flex justify-between"
          >
            <span class="flex items-center">
              <Icon icon="mdi:play-box" />
              {{ bigNumberTransform(video.play, 'table') }}
            </span>
            <span class="flex items-center"
              ><Icon icon="mdi:clock-time-eight" />{{ video.length }}</span
            >
          </div>
          <!-- 下载按钮 -->
          <div
            class="w-7 h-7 bg-[#E6E7EE] absolute top-4 left-4 flex justify-center items-center text-[#9B9A9B] cursor-pointer video-download"
            @click="justDownload(video.bvid)"
          >
            <Icon icon="mdi:download"></Icon>
          </div>
        </div>
      </div>
      <!-- 分页 -->
      <div class="flex justify-center mt-4">
        <el-pagination
          v-model:page-size="querParam.ps"
          v-model:current-page="querParam.pn"
          layout="prev, pager, next"
          :total="total"
          :hide-on-single-page="true"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref, toRaw, onActivated } from 'vue'
import { getUserInfo, getVideoList } from '@/api/user'
import type { UserData } from '@/types/index'
import { Icon } from '@iconify/vue'
import { bigNumberTransform } from '@/core/utils'
import { ElLoading, ElMessage } from 'element-plus'
import { useBaseStore, useTaskStore } from '@/store/index'
import { checkUrlRedirect, parseHtml, getDownloadList, addDownloadList } from '@/core/bilibili'
import { userQuality } from '@/assets/data/setting'

interface Video {
  bvid: string
  created: number
  length: string
  pic: string
  title: string
  play: number
}

const $route = useRoute()
const $router = useRouter()
const userInfo = reactive<UserData>({
  mid: '',
  name: '',
  face: '',
  sign: '',
  level: 0,
})
const querParam = reactive({
  mid: '',
  order: 'pubdate',
  keyword: '',
  pn: 1,
  ps: 16,
})
const orderList = [
  {
    label: '最新发布',
    value: 'pubdate',
  },
  {
    label: '最多播放',
    value: 'click',
  },
  {
    label: '最多收藏',
    value: 'stow',
  },
]
const vList = ref<Video[]>([])
const total = ref<number>(0)
const userVideo = ref<HTMLElement>()
const baseStore = useBaseStore()
const taskStore = useTaskStore()

onMounted(async () => {
  const search = $route.query.search
  if (!search) {
    return
  }
  const {
    body: { data },
  } = await getUserInfo(search as string)
  userInfo.face = data.face
  userInfo.mid = data.mid
  userInfo.level = data.level
  userInfo.name = data.name
  userInfo.sign = data.sign
  querParam.mid = data.mid
  const {
    body: {
      data: {
        list: { vlist },
        page: { count },
      },
    },
  } = await getVideoList(toRaw(querParam))
  vList.value = vlist
  total.value = count
})

// onActivated(() => {
//   ElMessage.info('onActivated')
// })

const toVideoDetail = (bvid: string) => {
  $router.push({
    path: '/videoDetail/index',
    query: { search: 'https://www.bilibili.com/video/' + bvid, t: Date.now() },
  })
}

const handleCurrentChange = async () => {
  const {
    body: {
      data: {
        list: { vlist },
        page: { count },
      },
    },
  } = await getVideoList(toRaw(querParam))
  vList.value = vlist
  total.value = count
}

const justDownload = async (bvid: string) => {
  const url = 'https://www.bilibili.com/video/' + bvid
  const loading = ElLoading.service({
    target: userVideo.value,
    lock: true,
    text: 'Loading',
    background: '#f6f6f6',
  })
  const { body, videoUrl } = await checkUrlRedirect(url, baseStore.token.SESSDATA)
  try {
    const data = await parseHtml(body, 'BV', videoUrl)
    if (data === -1) {
      ElMessage.error('解析错误或者不支持当前视频')
      return
    }
    const acceptQuality = userQuality[baseStore.loginStatus]
    // 根据当前登录状态加载清晰度
    data.qualityOptions = data.qualityOptions.filter((item) => {
      return acceptQuality.includes(item.value)
    })
    // 所有分P
    const pages = data.page.map((page) => {
      return page.page
    })
    const downloadList = await getDownloadList(data, pages, data.qualityOptions[0].value)
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
    loading.close()
  } catch (error: any) {
    console.error(error)
  }
}

const handleOrder = (key: string) => {
  querParam.order = key
  handleCurrentChange()
}
</script>

<style lang="scss">
.userVideo {
  .el-input {
    .el-input__wrapper {
      // padding: 1px 2px;
      background-color: #e3e3e3;
      box-shadow: none;
      .el-input__inner {
        height: 25px;
        color: #000;
        font-size: 12px;
      }
    }
    .el-input__wrapper.is-focus,
    .el-input__wrapper:hover {
      box-shadow: none;
    }
  }
  .el-pagination {
    --el-pagination-bg-color: rgba(0, 0, 0, 0);
    --el-pagination-button-disabled-bg-color: rgba(0, 0, 0, 0);
  }

  .video-card {
    .video-download {
      display: none;
    }
    &:hover {
      .video-download {
        display: flex;
      }
    }
  }
}
</style>
