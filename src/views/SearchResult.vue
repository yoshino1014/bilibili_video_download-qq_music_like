<template>
  <div ref="searchResult" class="py-3 h-full overflow-auto searchResult">
    <el-scrollbar class="px-8">
      <!-- 番剧 -->
      <div v-if="mdediaList.length > 0" class="mb-4">
        <span class="text-2xl font-bold">影视番剧</span>
        <div class="flex flex-wrap mt-8">
          <div v-for="(video, index) in mdediaList" :key="index" class="w-1/4 p-[10px] relative">
            <MediaCard
              :goto-url="video.goto_url"
              :cover="video.cover"
              :index-show="video.index_show"
              :title="video.title"
              :styles="video.styles"
              :loading="searchResult"
              :up-time="formatTime(video.pubtime)"
            />
          </div>
        </div>
      </div>
      <div>
        <span v-show="videoList.length > 0" class="text-2xl font-bold">视频</span>
        <!-- 查询条件 -->
        <div v-show="videoList.length > 0" class="mb-3 flex justify-between items-center mt-8">
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
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { search, getCookies } from '@/api/video'
import VideoCard from '@/components/VideoCard.vue'
import MediaCard from '@/components/MediaCard.vue'
import { useBaseStore } from '@/store/index'
import { formatTime } from '@/core/utils'
import { ElLoading } from 'element-plus'

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

const $route = useRoute()
const querParam = reactive({
  search_type: 'video', // video or media_bangumi or media_ft
  order: 'totalrank',
  keyword: '',
  page: 1,
})
const pageSize = ref(20)
const numResults = ref(0)
const videoList = ref<any[]>([])
const mdediaList = ref<any[]>([])
const searchResult = ref<HTMLElement>()

onMounted(async () => {
  const search = $route.query.search
  if (!search) {
    return
  }
  querParam.keyword = search as string
  const { headers } = await getCookies()
  MUSTHEADERS = headers['set-cookie'].join(';')
  getMedia()

  handleCurrentChange()
})

// 记载番剧信息
const getMedia = async () => {
  querParam.search_type = 'media_bangumi'
  const {
    body: { data },
  } = await search(baseStore.token.SESSDATA, MUSTHEADERS, querParam)
  querParam.search_type = 'media_ft'
  const {
    body: { data: value },
  } = await search(baseStore.token.SESSDATA, MUSTHEADERS, querParam)
  const array = data.result.concat(value.result)
  mdediaList.value = array
}

const handleCurrentChange = async () => {
  const loading = ElLoading.service({
    target: searchResult.value,
    lock: true,
    text: 'Loading',
    background: '#f6f6f6',
  })
  querParam.search_type = 'video'
  const {
    body: { data },
  } = await search(baseStore.token.SESSDATA, MUSTHEADERS, querParam)
  numResults.value = data.numResults
  videoList.value = data.result
  await nextTick()
  const picsAll = videoList.value.map((video) => {
    const imgurl = 'https://' + video.pic // 仅是为了区分下不同的图片链接
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = imgurl
      img.onload = () => resolve(imgurl)
      img.onerror = () => reject(new Error(imgurl + ' load error'))
    })
  })
  Promise.all(picsAll)
    .then(() => {
      loading.close()
    })
    .catch((e) => {
      loading.close()
      console.error(e)
    })
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
