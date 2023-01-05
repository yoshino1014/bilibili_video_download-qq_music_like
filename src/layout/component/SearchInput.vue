<template>
  <div class="serach">
    <el-input
      v-model="searchValue"
      :spellcheck="false"
      placeholder="视频网址"
      clearable
      @keydown.enter="toDetailPage"
    >
      <template #suffix>
        <Icon
          icon="ant-design:search-outlined"
          class="cursor-pointer hover:text-primary"
          @click="toDetailPage"
        />
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { checkUrl } from '@/core/bilibili'

const searchValue = ref<string>('')
const $router = useRouter()

const toDetailPage = () => {
  if (searchValue.value === '') {
    ElMessage({
      message: '请输入视频地址',
      type: 'info',
    })
    return
  }
  const type = checkUrl(searchValue.value)
  if (!type) {
    ElMessage({
      message: '请输入正确的视频地址',
      type: 'warning',
    })
    return
  }
  $router.push({
    path: '/videoDetail/index',
    query: { search: searchValue.value, t: Date.now() },
  })
}
</script>

<style lang="scss">
.serach {
  .el-input {
    .el-input__wrapper {
      border-radius: 9999px;
      // padding: 1px 2px;
      background-color: #e3e3e3;
      box-shadow: none;
      .el-input__inner {
        height: 30px;
        width: 160px;
        color: #000;
        font-size: 12px;
      }
    }
    .el-input__wrapper.is-focus,
    .el-input__wrapper:hover {
      box-shadow: none;
    }
  }
}
</style>
