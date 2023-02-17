<template>
  <div ref="searchResult" class="py-3 h-full overflow-auto searchResult">
    <el-scrollbar class="px-8">
      <!-- 查询条件 -->
      <div v-if="querParam.search_type === 'video'" class="mb-3 flex justify-between items-center">
        <!-- 排序 -->
        <div class="flex text-sm">
          <span
            v-for="(item, index) in orderList_video"
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
      </div>
      <div class="flex flex-wrap">
        <div v-for="(video, index) in videoList" :key="index" class="w-1/4 p-[10px] relative">
          <VideoCard
            :bvid="video.bvid"
            :cover="'https:' + video.pic"
            :length="video.duration"
            :title="video.title"
            :view="video.play"
            :up="video.author"
            :if-download="true"
            :loading="searchResult"
            :up-time="'-' + formatTime(video.senddate)"
          />
        </div>
      </div>
      <!-- 分页 -->
      <div class="flex justify-center mt-4">
        <el-pagination
          v-model:page-size="pageSize"
          v-model:current-page="querParam.page"
          layout="prev, pager, next"
          :total="numResults"
          :hide-on-single-page="true"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { search, getCookies } from '@/api/video'
import VideoCard from '@/components/VideoCard.vue'
import { useBaseStore } from '@/store/index'
import { formatTime } from '@/core/utils'

let MUSTHEADERS = ''
const baseStore = useBaseStore()
const orderList_video = [
  {
    label: '综合排序',
    value: 'totalrank',
  },
  {
    label: '最多点击',
    value: 'click',
  },
  {
    label: '最新发布',
    value: 'pubdate',
  },
  {
    label: '最多弹幕',
    value: 'dm',
  },
  {
    label: '最多收藏',
    value: 'stow',
  },
  {
    label: '最多评论',
    value: 'scores',
  },
]

const orderList_user = [
  {
    label: '默认',
    value: '0',
  },
  {
    label: '粉丝数',
    value: 'fans',
  },
  {
    label: '用户等级',
    value: 'pubdate',
  },
]

const $route = useRoute()
const querParam = reactive({
  search_type: 'video', // video or bili_user
  order: 'totalrank',
  keyword: '',
  page: 1,
})
const pageSize = ref(20)
const numResults = ref(0)
const videoList = ref<any[]>([])
const searchResult = ref<HTMLElement>()
onMounted(async () => {
  const search = $route.query.search
  if (!search) {
    return
  }
  querParam.keyword = search as string
  const { headers } = await getCookies()
  MUSTHEADERS = headers['set-cookie'].join(';')
  handleCurrentChange()
})

const handleCurrentChange = async () => {
  const {
    body: { data },
  } = await search(baseStore.token.SESSDATA, MUSTHEADERS, querParam)
  numResults.value = data.numResults
  videoList.value = data.result
}

const handleOrder = (key: string) => {
  querParam.order = key
  handleCurrentChange()
}
</script>

<style lang="scss">
.searchResult {
  .el-pagination {
    --el-pagination-bg-color: rgba(0, 0, 0, 0);
    --el-pagination-button-disabled-bg-color: rgba(0, 0, 0, 0);
  }
}
</style>
