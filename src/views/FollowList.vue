<template>
  <div class="py-4 h-full followList">
    <el-scrollbar class="px-9">
      <span class="text-2xl font-bold">关注</span>
      <div class="flex flex-wrap">
        <div v-for="(up, index) in list" :key="index" class="flex items-center shrink-0 w-1/3 mt-6">
          <img :src="up.face" alt="" class="w-7 h-7 rounded-full" />
          <span class="text-xs ml-2"
            ><span class="text-[#FB7299] cursor-pointer" @click="toUserPage(up.mid + '')"
              >@{{ up.uname }}</span
            ></span
          >
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
          @current-change="handleCurrentChange"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getFollowing } from '@/api/user'
import { useBaseStore } from '@/store'
import { useRouter } from 'vue-router'

interface User {
  uname: string
  face: string
  mid: number
}

const baseStore = useBaseStore()
const $router = useRouter()
const count = ref<number>(0)
const list = ref<User[]>([])
const ps = ref<number>(50)
const pn = ref<number>(1)

onMounted(() => {
  handleCurrentChange()
})

const toUserPage = (mid: string) => {
  $router.push({
    path: '/userVideo/index',
    query: { search: mid, t: Date.now() },
  })
}

const handleCurrentChange = async () => {
  try {
    const {
      body: { data },
    } = await getFollowing(
      { ps: ps.value, pn: pn.value, vmid: baseStore.token.DedeUserID },
      baseStore.token.SESSDATA
    )
    count.value = data.total
    list.value = data.list
  } catch (error) {
    console.error(error)
  }
}
</script>

<style lang="scss">
.followList {
  .el-pagination {
    --el-pagination-bg-color: rgba(0, 0, 0, 0);
    --el-pagination-button-disabled-bg-color: rgba(0, 0, 0, 0);
  }
}
</style>
