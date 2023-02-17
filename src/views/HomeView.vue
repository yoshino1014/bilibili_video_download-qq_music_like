<template>
  <div class="py-4 h-full">
    <el-scrollbar class="px-9">
      <!-- 输入框 -->
      <div class="mt-4">
        <el-input v-model="inputData" placeholder="输入关键词搜索" @keydown.enter="toUserPage">
          <template #append>
            <el-button :icon="Search" @click="toUserPage" />
          </template>
        </el-input>
      </div>
      <!-- 热门视频 -->
      <div class="mt-8">
        <div class="flex justify-between items-center">
          <span class="text-2xl font-bold">热门视频</span>
          <Icon icon="mdi:refresh" class="cursor-pointer text-xl" @click="refresh()"></Icon>
        </div>
        <!-- 列表 -->
        <div class="flex flex-wrap mt-4">
          <div
            v-for="(video, index) in vList"
            :key="index"
            :class="[(index + 1) % 4 !== 0 ? 'mr-[2.33%]' : '', 'mb-[3%] ']"
            style="width: 23.2%"
          >
            <VideoCard
              :bvid="video.bvid"
              :cover="video.pic"
              :duration="video.duration"
              :title="video.title"
              :view="video.stat.view"
              :up="video.owner.name"
              :if-download="false"
            />
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getPopularVideo } from '@/api/video'
import { useBaseStore } from '@/store'
import { Icon } from '@iconify/vue'
import VideoCard from '@/components/VideoCard.vue'

interface Video {
  bvid: string
  pubdate: number
  duration: number
  pic: string
  title: string
  stat: {
    view: number
  }
  owner: {
    name: string
  }
}

const $router = useRouter()
const inputData = ref<string>('')
const vList = ref<Video[]>([])
const baseStore = useBaseStore()
const ps = ref<number>(8)
const pn = ref<number>(1)

const toUserPage = () => {
  if (inputData.value === '') {
    ElMessage({
      message: 'UID不能为空',
      type: 'info',
    })
    return
  }
  // const reg = /^\d+$/
  // if (!reg.test(inputData.value)) {
  //   ElMessage({
  //     message: 'UID只能为数字',
  //     type: 'info',
  //   })
  //   return
  // }
  $router.push({
    path: '/searchResult/index',
    query: { search: inputData.value, t: Date.now() },
  })
}

const getList = async () => {
  try {
    const {
      body: {
        data: { list },
      },
    } = await getPopularVideo(baseStore.token.SESSDATA, { pn: pn.value, ps: ps.value })
    vList.value = list
  } catch (error) {
    console.error(error)
  }
}

const refresh = async () => {
  try {
    const {
      body: {
        data: { no_more },
      },
    } = await getPopularVideo(baseStore.token.SESSDATA, { pn: pn.value, ps: ps.value })
    if (no_more === true) {
      pn.value = 1
    }
    pn.value++
    getList()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  getList()
})
</script>
