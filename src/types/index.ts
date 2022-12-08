interface TokenData {
  SESSDATA: string
  DedeUserID: string
  biliJct: string
}

interface SettingData {
  downloadPath: string
  isMerge: boolean
  isDelete: boolean
  isSubtitle: boolean
  isDanmaku: boolean
  isCover: boolean
  isFolder: boolean
  downloadingMaxSize: number
}

export { TokenData, SettingData }
