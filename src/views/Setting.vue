<template>
  <div class="setting text-[13px] p-8 box-content max-w-[746px]">
    <span class="text-2xl font-bold">设置</span>
    <!-- 下载目录 -->
    <div class="py-6 border-t border-t-[#dcdfe6] flex mt-5">
      <span class="text-normal w-24 shrink-0">下载目录</span>
      <div>
        <span>默认将下载的视频保存在此文件夹中</span>
        <div class="mt-4 flex">
          <el-input v-model="setting.downloadPath" readonly style="width: 445px"> </el-input>
          <el-button @click="chooseDir">更改目录</el-button>
          <el-button @click="openDir">打开文件夹</el-button>
        </div>
        <div class="flex items-center mt-4">
          <span>设置同时下载的任务数量最大为</span>
          <el-input-number
            v-model="setting.downloadingMaxSize"
            :min="1"
            :max="5"
            style="width: 100px; margin-left: 10px"
          >
          </el-input-number>
        </div>
      </div>
    </div>
    <!-- 下载视频 -->
    <div class="py-6 border-t border-t-[#dcdfe6] flex">
      <span class="text-normal w-24 shrink-0">下载视频</span>
      <div class="flex flex-wrap">
        <el-checkbox v-model="setting.isCover" label="同时下载封面" />
        <el-checkbox v-model="setting.isSubtitle" label="同时下载字幕" />
        <el-checkbox v-model="setting.isDanmaku" label="同时下载弹幕(还没做٩꒰｡•◡•｡꒱۶)" />
      </div>
    </div>
    <!-- 文件分类 -->
    <div class="py-6 border-t border-t-[#dcdfe6] flex">
      <span class="text-normal w-24 shrink-0">文件分类</span>
      <div class="flex">
        <el-radio-group v-model="setting.isFolder">
          <el-radio :label="false">不分文件夹</el-radio>
          <el-radio :label="true">按视频分文件夹</el-radio>
        </el-radio-group>
      </div>
    </div>
    <!-- 其它 -->
    <div class="py-6 border-t border-t-[#dcdfe6] flex">
      <span class="text-normal w-24 shrink-0">其它</span>
      <div class="flex">
        <el-checkbox v-model="setting.isMerge" label="下载完成后合并音视频" />
        <el-checkbox v-model="setting.isDelete" label="删除原文件" :disabled="!setting.isMerge" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, onMounted, toRaw } from 'vue'
import type { SettingData } from '@/types/index'
import { ElMessage } from 'element-plus'
import { useSettingStore } from '@/store/index'

const settingStore = useSettingStore()

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

onMounted(async () => {
  const storeSetting = (await window.electronApi.getStore('setting')) as SettingData
  if (storeSetting) {
    setting.downloadPath = storeSetting.downloadPath
    setting.isMerge = storeSetting.isMerge
    setting.isDelete = storeSetting.isDelete
    setting.isSubtitle = storeSetting.isSubtitle
    setting.isDanmaku = storeSetting.isDanmaku
    setting.isCover = storeSetting.isCover
    setting.isFolder = storeSetting.isFolder
    setting.downloadingMaxSize = storeSetting.downloadingMaxSize
  }
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

const openDir = () => {
  window.electronApi
    .openDir(setting.downloadPath)
    .then((res: string) => {
      ElMessage.success(res)
    })
    .catch((e: Error) => {
      ElMessage.error(e.message)
    })
}

watch(
  setting,
  (newV) => {
    settingStore.setSetting(toRaw(newV))
  },
  {
    deep: true,
  }
)
</script>

<style lang="scss">
.setting {
  .el-input {
    .el-input__wrapper {
      border-radius: 0;
      padding: 1px 2px;
      background-color: rgba(0, 0, 0, 0);
      .el-input__inner {
        height: 25px;

        color: #000;
        font-size: 13px;
      }
    }
    .el-input__wrapper.is-focus,
    .el-input__wrapper:hover {
      box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
    }
  }

  .el-button {
    --el-button-bg-color: rgba(0, 0, 0, 0);
    --el-button-text-color: #000;
    --el-button-hover-bg-color: #e8e8e8;
    --el-button-hover-text-color: #000;
    --el-button-hover-border-color: var(--el-border-color);
    --el-button-active-border-color: var(--el-border-color);
    border-radius: 0;
    height: calc(25px + 2px);
    font-size: 13px;
    margin-left: 10px;
  }

  .el-checkbox {
    height: auto;
    width: 200px;
    margin: 0;
    --el-checkbox-text-color: #000;
    --el-checkbox-checked-text-color: #000;
    --el-checkbox-bg-color: rgba(0, 0, 0, 0);
    --el-checkbox-checked-bg-color: rgba(0, 0, 0, 0);
    --el-checkbox-checked-icon-color: var(--el-color-primary);
    .el-checkbox__label {
      line-height: 14px;
      font-size: 13px;
    }
  }

  .el-radio {
    height: auto;
    width: 200px;
    margin: 0;
    --el-radio-font-size: 13px;
    --el-radio-text-color: #000;
    --el-radio-input-bg-color: rgba(0, 0, 0, 0);
    .el-radio__label {
      line-height: 14px;
    }
    .el-radio__input.is-checked + .el-radio__label {
      color: var(--el-radio-text-color);
    }
  }
}
</style>
