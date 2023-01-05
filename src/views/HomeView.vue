<template>
  <div class="flex items-center flex-col">
    <!-- 输入框 -->
    <div class="mt-24 w-1/2">
      <el-input v-model="inputData" placeholder="UID" @keydown.enter="toUserPage">
        <template #append>
          <el-button :icon="Search" @click="toUserPage" />
        </template>
      </el-input>
    </div>
    <!-- 搜索历史 -->
    <!-- <div class="mt-2 w-1/2">
      <span class="text-sm text-normal">历史搜索</span>
      <span v-for="(uid, i) in history" :key="i" class="text-sm">{{ uid }},</span>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const $router = useRouter()
const inputData = ref<string>('')

const toUserPage = () => {
  if (inputData.value === '') {
    ElMessage({
      message: 'UID不能为空',
      type: 'info',
    })
    return
  }
  const reg = /^\d+$/
  if (!reg.test(inputData.value)) {
    ElMessage({
      message: 'UID只能为数字',
      type: 'info',
    })
    return
  }
  $router.push({
    path: '/userVideo/index',
    query: { search: inputData.value, t: Date.now() },
  })
}
</script>
