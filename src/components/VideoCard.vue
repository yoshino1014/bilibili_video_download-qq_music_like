<template>
  <div class="w-full video-card">
    <div
      ref="image"
      :style="{ width: '100%', height: imageHeight + 'px' }"
      class="overflow-hidden flex items-center bg-black rounded relative"
    >
      <img :src="cover" alt="" class="w-full h-auto" />
      <div class="stats">
        <span class="flex items-center">
          <Icon icon="mdi:play-box" class="mr-1" />
          {{ bigNumberTransform(view, 'table') }}
        </span>
        <span class="flex items-center"
          ><Icon icon="mdi:clock-time-eight" class="mr-1" />{{
            duration === 0 ? length : formatSecond(duration)
          }}</span
        >
      </div>
    </div>
    <div
      class="text-xs overflow-hidden cursor-pointer hover:text-primary"
      style="line-height: 20px; height: 38px; margin-top: 6px"
      :title="title"
      @click="toVideoDetail(bvid)"
      v-html="title"
    ></div>
    <div
      v-if="up !== ''"
      style="font-size: 12px; line-height: 14px; height: 14px; color: #999"
      class="flex items-center mt-1"
    >
      <img src="@/assets/up.png" alt="" width="17" height="17" class="w-[17px] h-[17px] mr-1" />{{
        up + '' + upTime
      }}
    </div>
    <!-- 下载按钮 -->
    <div
      v-if="ifDownload"
      class="w-7 h-7 bg-[#E6E7EE] absolute top-4 left-4 flex justify-center items-center text-[#9B9A9B] cursor-pointer video-download"
      @click="justDownload(bvid, loading, baseStore, taskStore)"
    >
      <Icon icon="mdi:download"></Icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { bigNumberTransform, formatSecond } from '@/core/utils'
import { justDownload } from '@/core/bilibili'
import { useBaseStore, useTaskStore } from '@/store/index'
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'

const baseStore = useBaseStore()
const taskStore = useTaskStore()
const props = defineProps({
  cover: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 0,
  },
  length: {
    type: String,
    default: '0',
  },
  view: {
    type: Number,
    default: 0,
  },
  up: {
    type: String,
    default: '',
  },
  bvid: {
    type: String,
    default: '',
  },
  ifDownload: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: HTMLElement,
    default: undefined,
  },
  upTime: {
    type: String,
    default: '',
  },
})
const $router = useRouter()
const image = ref<HTMLElement>()
const imageHeight = ref<number>(0)

const toVideoDetail = (bvid: string) => {
  $router.push({
    path: '/videoDetail/index',
    query: { search: 'https://www.bilibili.com/video/' + bvid, t: Date.now() },
  })
}

onMounted(() => {
  if (image.value?.clientWidth) {
    imageHeight.value = image.value.clientWidth * (358 / 573)
  }
  window.addEventListener('resize', () => {
    if (image.value?.clientWidth) {
      imageHeight.value = image.value.clientWidth * (358 / 573)
    }
  })
})
</script>

<style lang="scss">
.video-card {
  .video-download {
    display: none;
  }
  &:hover {
    .video-download {
      display: flex;
    }
  }
  .stats {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 2;
    box-sizing: border-box;
    padding: 3.5% 1.7% 1%;
    width: 100%;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
    background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
    color: #fff;
    font-size: 12px;
    opacity: 1;
    display: -webkit-flex;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
