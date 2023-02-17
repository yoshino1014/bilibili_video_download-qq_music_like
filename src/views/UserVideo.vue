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
          <el-button
            class="absolute bottom-0 left0 z-0 rounded-full"
            @click="openBrowser(`https://space.bilibili.com/${userInfo.mid}/video`)"
          >
            <Icon icon="mdi:open-in-app" class="mr-1 text-lg"></Icon>
            <span>打开B站</span>
          </el-button>
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
          <VideoCard
            :bvid="video.bvid"
            :cover="video.pic"
            :length="video.length"
            :title="video.title"
            :view="video.play"
            :if-download="true"
            :loading="userVideo"
          />
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
import { useRoute } from 'vue-router'
import { onMounted, reactive, ref, toRaw } from 'vue'
import { getUserInfo, getVideoList } from '@/api/user'
import type { UserData } from '@/types/index'
import { Icon } from '@iconify/vue'
import { useBaseStore } from '@/store/index'
import VideoCard from '@/components/VideoCard.vue'

interface Video {
  bvid: string
  created: number
  length: string
  pic: string
  title: string
  play: number
}

const $route = useRoute()
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

onMounted(async () => {
  const search = $route.query.search
  if (!search) {
    return
  }
  const {
    body: { data },
  } = await getUserInfo(search as string, baseStore.token.SESSDATA)
  userInfo.face = data.face
  userInfo.mid = data.mid
  userInfo.level = data.level
  userInfo.name = data.name
  userInfo.sign = data.sign
  querParam.mid = data.mid
  await handleCurrentChange()
})

const handleCurrentChange = async () => {
  const {
    body: {
      data: {
        list: { vlist },
        page: { count },
      },
    },
  } = await getVideoList(toRaw(querParam), baseStore.token.SESSDATA)
  vList.value = []
  vList.value = vlist
  total.value = count
}

const handleOrder = (key: string) => {
  querParam.order = key
  handleCurrentChange()
}

const openBrowser = (url: string) => {
  window.electronApi.openBrowser(url)
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
