<template>
  <div class="serach">
    <el-input
      v-model="searchValue"
      :spellcheck="false"
      placeholder="搜索"
      clearable
      @keydown.enter="toSearchPage"
    >
      <template #suffix>
        <Icon
          icon="ant-design:search-outlined"
          class="cursor-pointer hover:text-primary"
          @click="toSearchPage"
        />
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const searchValue = ref<string>('')
const $router = useRouter()

const toSearchPage = () => {
  if (searchValue.value === '') {
    return
  }
  $router.push({
    path: '/searchResult/index',
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
