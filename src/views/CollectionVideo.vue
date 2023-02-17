<template>
  <div ref="userVideo" class="py-3 h-full userVideo overflow-auto">
    <el-scrollbar class="px-8">
      <!-- 查询条件 -->
      <div v-if="type === '11'" class="mb-3 flex justify-between items-center">
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
        <div v-for="(video, index) in vList" :key="index" class="w-1/4 p-[10px] relative">
          <VideoCard
            :bvid="video.bvid"
            :cover="video.cover"
            :duration="video.duration"
            :title="video.title"
            :view="video.cnt_info.play"
            :up="video.upper.name"
            :if-download="true"
            :loading="userVideo"
          />
        </div>
      </div>
      <!-- 分页 -->
      <div v-if="type === '11'" class="flex justify-center mt-4">
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
import { onMounted, reactive, ref, toRaw } from 'vue'
import { getVideoList, getVideoListSeason } from '@/api/collection'
import { Icon } from '@iconify/vue'
import { useBaseStore } from '@/store/index'
import VideoCard from '@/components/VideoCard.vue'

interface Video {
  bvid: string
  pubtime: number
  duration: number
  cover: string
  title: string
  cnt_info: {
    play: number
  }
  upper: {
    name: string
  }
}

const $route = useRoute()
const $router = useRouter()
const querParam = reactive({
  media_id: '',
  order: 'mtime',
  keyword: '',
  pn: 1,
  ps: 16,
  platform: 'web',
})
const orderList = [
  {
    label: '收藏时间',
    value: 'mtime',
  },
  {
    label: '播放量',
    value: 'view',
  },
  {
    label: '投稿时间',
    value: 'pubtime',
  },
]
const vList = ref<Video[]>([])
const total = ref<number>(0)
const userVideo = ref<HTMLElement>()
const baseStore = useBaseStore()
const type = ref<string>('11')

onMounted(async () => {
  const search = $route.query.search
  if (!search) {
    return
  }
  querParam.media_id = search as string
  handleCurrentChange()
})

// onActivated(() => {
//   ElMessage.info('onActivated')
// })

const handleCurrentChange = async () => {
  type.value = $route.query.type as string
  const {
    body: { data },
  } = await (type.value === '11'
    ? getVideoList(toRaw(querParam), baseStore.token.SESSDATA)
    : getVideoListSeason(toRaw(querParam), baseStore.token.SESSDATA))
  vList.value = data.medias
  total.value = data.info.media_count
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
}
</style>
