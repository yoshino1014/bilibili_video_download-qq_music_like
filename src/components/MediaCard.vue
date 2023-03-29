<template>
  <div class="w-full video-card">
    <div
      ref="image"
      :style="{ width: '100%', height: imageHeight + 'px' }"
      class="overflow-hidden flex items-center bg-black rounded relative"
    >
      <img :src="cover" alt="" class="w-full h-auto" />
    </div>
    <div
      class="text-xs overflow-hidden cursor-pointer hover:text-primary"
      style="line-height: 20px; height: 38px; margin-top: 6px"
      :title="title"
      @click="toVideoDetail(gotoUrl)"
      v-html="title"
    ></div>
    <div
      style="font-size: 12px; line-height: 14px; height: 14px; color: #999"
      class="flex items-center mt-1"
    >
      {{ styles }}
    </div>
    <div
      style="font-size: 12px; line-height: 14px; height: 14px; color: #999"
      class="flex items-center mt-1"
    >
      {{ upTime + ' · ' + indexShow }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const props = defineProps({
  cover: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  indexShow: {
    type: String,
    default: '0',
  },
  styles: {
    type: String,
    default: '',
  },
  gotoUrl: {
    type: String,
    default: '',
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

const toVideoDetail = (gotoUrl: string) => {
  $router.push({
    path: '/videoDetail/index',
    query: { search: gotoUrl, t: Date.now() },
  })
}

onMounted(() => {
  if (image.value?.clientWidth) {
    imageHeight.value = image.value.clientWidth * (640 / 480)
  }
  window.addEventListener('resize', () => {
    if (image.value?.clientWidth) {
      imageHeight.value = image.value.clientWidth * (640 / 480)
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
