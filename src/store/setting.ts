import { defineStore } from 'pinia'
import type { SettingData } from '@/types/index'

export const useSettingStore = defineStore('setting', {
  state: (): SettingData => {
    return {
      downloadPath: '',
      isMerge: true,
      isDelete: true,
      isSubtitle: false,
      isDanmaku: false,
      isCover: false,
      isFolder: true,
      downloadingMaxSize: 5,
    }
  },
  actions: {
    setSetting(setting: SettingData) {
      this.downloadPath = setting.downloadPath
      this.isMerge = setting.isMerge
      this.isDelete = setting.isDelete
      this.isSubtitle = setting.isSubtitle
      this.isCover = setting.isCover
      this.isFolder = setting.isFolder
      this.downloadingMaxSize = setting.downloadingMaxSize
      window.electronApi.setStore('setting', setting)
    },
  },
})
