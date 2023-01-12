<template>
  <div class="py-4 h-full collection">
    <el-scrollbar class="px-9">
      <span class="text-2xl font-bold">我创建的收藏夹</span>
      <!-- 列表 -->
      <div class="flex flex-wrap mt-8">
        <div
          v-for="(collection, index) in collections"
          :key="index"
          :class="[(index + 1) % 4 !== 0 ? 'mr-5' : '', 'mb-[2%] ']"
          style="width: calc(25% - 15px)"
        >
          <div class="relative">
            <div
              class="absolute w-[77.6%] h-full bg-[#E4E5E7] top-0 left-[11.2%] rounded z-0"
              style="transform: translateY(-9%)"
            ></div>
            <div
              class="absolute w-[89%] h-full bg-[#AEB3B9] top-0 left-[5.5%] rounded z-10"
              style="transform: translateY(-5%)"
            ></div>
            <img
              :src="collection.cover === '' ? imgUrl : collection.cover"
              alt=""
              class="w-full h-auto rounded relative z-20"
            />
            <div
              class="p-1 text-white text-xs bg-[rgba(0,0,0,.6)] absolute right-[5%] bottom-[5%] z-30 rounded-sm flex items-center"
            >
              <Icon icon="charm:stack" class="mr-1" />
              {{ collection.media_count }}
            </div>
          </div>
          <div
            class="text-sm overflow-hidden cursor-pointer hover:text-primary h-10 leading-5 mt-2 text-center"
            @click="toCollectionVideo(collection.id + '', 11)"
          >
            {{ collection.title }}
          </div>
        </div>
      </div>
      <span class="text-2xl font-bold">我的收藏与订阅</span>
      <div class="flex flex-wrap mt-8">
        <div
          v-for="(collection, index) in otherCollections"
          :key="index"
          :class="[(index + 1) % 4 !== 0 ? 'mr-5' : '', 'mb-[2%] ']"
          style="width: calc(25% - 15px)"
        >
          <div class="relative">
            <div
              class="absolute w-[77.6%] h-full bg-[#E4E5E7] top-0 left-[11.2%] rounded z-0"
              style="transform: translateY(-9%)"
            ></div>
            <div
              class="absolute w-[89%] h-full bg-[#AEB3B9] top-0 left-[5.5%] rounded z-10"
              style="transform: translateY(-5%)"
            ></div>
            <img
              :src="collection.cover === '' ? imgUrl : collection.cover"
              alt=""
              class="w-full h-auto rounded relative z-20"
            />
            <div
              class="p-1 text-white text-xs bg-[rgba(0,0,0,.6)] absolute right-[5%] bottom-[5%] z-30 rounded-sm flex items-center"
            >
              <Icon icon="charm:stack" class="mr-1" />
              {{ collection.media_count }}
            </div>
          </div>
          <div
            :class="[
              'text-sm overflow-hidden  h-10 leading-5 mt-2 text-center',
              collection.state === 0 ? 'cursor-pointer hover:text-primary' : ' text-slate-300',
            ]"
            @click="
              collection.state === 0 ? toCollectionVideo(collection.id + '', collection.type) : ''
            "
          >
            {{ collection.title }}
          </div>
        </div>
      </div>
      <!-- 分页 -->
      <div class="flex justify-center mt-4">
        <el-pagination
          v-model:page-size="ps"
          v-model:current-page="pn"
          layout="prev, pager, next"
          :total="count"
          :hide-on-single-page="true"
          @current-change="updateCollectionList"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { getCollection, getCollectionInfo, getSubscribeList } from '@/api/collection'
import { onMounted, ref } from 'vue'
import { useBaseStore } from '@/store'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

interface Collection {
  id: number
  mid: number
  title: string
  media_count: number
  cover: string
  upper: {
    name: string
  }
  state: number // 0可用 1失效
  type: number //11收藏夹 21合集
}
const imgUrl = new URL('../assets/space.jpg', import.meta.url).href
const baseStore = useBaseStore()
const collections = ref<Collection[]>([])
const otherCollections = ref<Collection[]>([])
const ps = ref<number>(20)
const pn = ref<number>(1)
const count = ref<number>(0)
const $router = useRouter()

onMounted(async () => {
  const response = await getCollection(baseStore.token.DedeUserID, baseStore.token.SESSDATA)
  collections.value = response.body.data.list
  collections.value.map(async (item) => {
    const {
      body: { data },
    } = await getCollectionInfo(item.id, baseStore.token.SESSDATA)
    item.cover = data.cover
  })
  await updateCollectionList()
})

const updateCollectionList = async () => {
  const {
    body: { data: response },
  } = await getSubscribeList(
    baseStore.token.DedeUserID,
    pn.value,
    ps.value,
    baseStore.token.SESSDATA
  )
  otherCollections.value = response.list
  count.value = response.count
}

const toCollectionVideo = (id: string, type: number) => {
  $router.push({
    path: '/collectionVideo/index',
    query: { search: id, t: Date.now(), type },
  })
}
</script>

<style lang="scss">
.collection {
  .el-pagination {
    --el-pagination-bg-color: rgba(0, 0, 0, 0);
    --el-pagination-button-disabled-bg-color: rgba(0, 0, 0, 0);
  }
}
</style>
