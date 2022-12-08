<template>
  <div class="p-8 text-[13px] setting">
    <span class="text-2xl font-bold">设置</span>
    <div class="py-6 border-t border-t-[#dcdfe6] flex">
      <span class="text-[#777] w-24">下载目录</span>
      <div>
        <span>默认将下载的视频保存在此文件夹中</span>
        <div class="mt-4 flex">
          <el-input v-model="setting.downloadPath" readonly> </el-input>
          <el-button>更改目录</el-button>
          <el-button>打开文件夹</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import type { SettingData } from '@/types/index'

const setting = reactive<SettingData>({
  downloadPath: '',
  isMerge: true,
  isDelete: true,
  isSubtitle: false,
  isDanmaku: false,
  isCover: false,
  isFolder: true,
  downloadingMaxSize: 5,
})

const chooseDir = () => {
  window.electronApi
    .openDirDialog()
    .then((res: string) => {
      setting.downloadPath = res
    })
    .catch(() => {
      console.log('取消选择')
    })
}
</script>

<style lang="scss">
.setting {
  .el-input{
    --el-input-border-color:#d2d2d2;
    .el-input__wrapper {
      border-radius: 0;
      padding: 1px 2px;
      background-color: rgba(0,0,0,0);
      .el-input__inner {
        height: 25px;
        width: 462px;
        color: #000;
     }
    }
    .el-input__wrapper.is-focus,
    .el-input__wrapper:hover {
      box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
    }
  }

  .el-button {
    --el-button-bg-color: : rgba(0,0,0,0);
    --el-button-text-color: #000;
    --el-button-border-color:#d2d2d2;
    --el-button-hover-bg-color: #e8e8e8;
    --el-button-hover-text-color: #000;
    --el-button-hover-border-color: var(--el-border-color);
    --el-button-active-border-color: var(--el-border-color);
    border-radius: 0;
    height: calc(25px + 2px);
    font-size: 13px;
    margin-left: 10px;
  }
}
</style>
