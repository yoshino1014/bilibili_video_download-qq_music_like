export interface TokenData {
  SESSDATA: string
  DedeUserID: string
  biliJct: string
}

export interface SettingData {
  downloadPath: string
  isMerge: boolean
  isDelete: boolean
  isSubtitle: boolean
  isDanmaku: boolean
  isCover: boolean
  isFolder: boolean
  downloadingMaxSize: number
}

export interface PlayeurlParam {
  avid?: number
  bvid?: string
  cid: number
  qn?: number
  fnval?: number
  fnver?: number
  fourk?: number
  session?: string
  otype?: string
  type?: string
  platform?: string
}

export interface UP {
  name: string
  mid: number
  face: string
  title?: string
}

export interface QualityItem {
  label: string
  value: number
}

export interface Page {
  title: string
  url: string
  bvid: string
  cid: number
  duration: string
  page: number
}

export interface Subtitle {
  title: string
  url: string
}

export interface Video {
  id: number
  cid: number
  url: string
}

export interface Audio {
  id: number
  cid: number
  url: string
}

export interface DownloadUrl {
  video: string
  audio: string
}

export interface VideoData {
  id: string
  title: string
  url: string
  bvid: string
  aid?: number
  cid: number
  cover: string
  createdTime: number
  quality: number
  view: number
  danmaku: number
  reply: number
  duration: string
  up: UP[]
  tags?: string[]
  desc?: string
  qualityOptions: QualityItem[]
  page: Page[]
  subtitle: Subtitle[]
  video: Video[]
  audio: Audio[]
  filePathList: string[]
  fileDir: string
  size: number
  downloadUrl: DownloadUrl
}

export interface TaskData extends VideoData {
  status: number
  progress: number
  completeTime: number
  speed?: number
}

export type TaskMap = Map<string, TaskData>

export interface UserData {
  mid: string
  name: string
  face: string
  sign: string
  level: number
}
