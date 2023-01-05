import { getLoginInfo } from '@/api/login'
import UA from '@/assets/data/userAgent'
import type { PlayeurlParam, VideoData, Page, DownloadUrl, Subtitle, TaskData } from '@/types/index'
import { getPalyUrl, getEpInfo, getMoreVideoInfo } from '@/api/video'
import { formatSecond, filterTitle } from './utils'
import { useBaseStore, useSettingStore, useTaskStore } from '@/store'
import { v4 as uuidv4 } from 'uuid'

const qualityMap = {
  127: '8K 超高清',
  126: '杜比视界',
  125: 'HDR 真彩',
  120: '4K 超清',
  116: '1080P 60帧',
  112: '1080P 高码率',
  80: '1080P 高清',
  74: '720P 60帧',
  64: '720P 高清',
  32: '480P 清晰',
  16: '320P 流畅',
}

/**
 * 确认登录状态和会员等级
 * @param SESSDATA cookie
 * @returns 0:未登录 1:普通会员 2:大会员
 */
export const checkLogin = async (SESSDATA: string) => {
  const { body } = await getLoginInfo(SESSDATA)
  const userData = {
    loginStatus: 0,
    username: body.data.uname,
    mid: body.data.mid,
    avatar: body.data.face,
  }
  if (!body.data.isLogin) {
    return userData
  }
  if (body.data.vipType === 0) {
    userData.loginStatus = 1
    return userData
  }
  userData.loginStatus = 2
  return userData
}

/**
 * 判断路径合法性
 * @param url 地址
 * @returns
 */
export const checkUrl = (url: string): string => {
  const mapUrl = {
    'video/av': 'BV',
    'video/BV': 'BV', // 视频
    'play/ss': 'ss',
    'play/ep': 'ep', // 番剧
  }
  for (const key in mapUrl) {
    if (url.includes(key)) {
      //@ts-ignore
      return mapUrl[key]
    }
  }
  return ''
}

/**
 * 确认是否有重定向
 * @param url 原地址
 * @param SESSDATA token
 * @returns 消息体、路径
 */
export const checkUrlRedirect = async (url: string, SESSDATA: string) => {
  const options = {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
  }
  const { body, redirectUrls }: { body: string; redirectUrls: string } =
    await window.electronApi.got(url, options)
  const videoUrl: string = redirectUrls[0] ? redirectUrls[0] : url
  return {
    body,
    videoUrl,
  }
}

export const parseHtml = (html: string, videoType: string, url: string) => {
  switch (videoType) {
    case 'BV':
      return parseBV(html, url)
    case 'ss':
      return parseSS(html)
    case 'ep':
      return parseEP(html, url)
    default:
      return -1
  }
}

const parseBV = async (html: string, url: string) => {
  try {
    const videoInfo = html.match(
      /<\/script><script>window\.__INITIAL_STATE__=([\s\S]*?);\(function\(\)/
    )
    if (!videoInfo) {
      throw new Error('parse bv error')
    }
    const videoInfoJSON = JSON.parse(videoInfo[1])
    if (videoInfoJSON.epInfo) {
      // 为番剧
      return parseEP(
        html,
        `https://www.bilibili.com/bangumi/play/ep${videoInfoJSON.mediaInfo.newestEp.id}`
      )
    }
    const { videoData, tags } = videoInfoJSON
    // 获取视频下载地址
    let acceptQuality = null
    try {
      let downLoadData: any = html.match(
        /<script>window\.__playinfo__=([\s\S]*?)<\/script><script>window\.__INITIAL_STATE__=/
      )
      if (!downLoadData) {
        throw new Error('parse bv error')
      }
      downLoadData = JSON.parse(downLoadData[1])
      acceptQuality = {
        accept_quality: downLoadData.data.accept_quality,
        video: downLoadData.data.dash.video,
        audio: downLoadData.data.dash.audio,
      }
    } catch (error) {
      acceptQuality = await getAcceptQuality(videoData.cid, videoData.bvid)
    }
    const obj: VideoData = {
      id: '',
      title: videoData.title,
      url,
      bvid: videoData.bvid,
      cid: videoData.cid,
      cover: videoData.pic,
      createdTime: -1,
      quality: -1,
      view: videoData.stat.view,
      danmaku: videoData.stat.danmaku,
      reply: videoData.stat.reply,
      duration: formatSecond(videoData.duration),
      up: Object.prototype.hasOwnProperty.call(videoData, 'staff')
        ? videoData.staff.map((item: any) => ({
            name: item.name,
            mid: item.mid,
            face: item.face,
            title: item.title,
          }))
        : [{ name: videoData.owner.name, mid: videoData.owner.mid, face: videoData.owner.face }],
      qualityOptions: acceptQuality.accept_quality.map((item: any) => ({
        label: qualityMap[item],
        value: item,
      })),
      tags: tags.map((item: any) => {
        return item.tag_name
      }),
      desc: videoData.desc,
      page: parseBVPageData(videoData, url),
      subtitle: [],
      video: acceptQuality.video
        ? acceptQuality.video.map((item: any) => ({
            id: item.id,
            cid: videoData.cid,
            url: item.baseUrl,
          }))
        : [],
      audio: acceptQuality.audio
        ? acceptQuality.audio.map((item: any) => ({
            id: item.id,
            cid: videoData.cid,
            url: item.baseUrl,
          }))
        : [],
      filePathList: [],
      fileDir: '',
      size: -1,
      downloadUrl: { video: '', audio: '' },
    }
    return obj
  } catch (error: any) {
    throw new Error(error)
  }
}

const parseBVPageData = (
  { bvid, title, pages }: { bvid: string; title: string; pages: any[] },
  url: string
): Page[] => {
  const len = pages.length
  if (len === 1) {
    return [
      {
        title,
        url,
        page: pages[0].page,
        duration: formatSecond(pages[0].duration),
        cid: pages[0].cid,
        bvid: bvid,
      },
    ]
  }
  return pages.map((item) => ({
    title: item.part,
    page: item.page,
    duration: formatSecond(item.duration),
    cid: item.cid,
    bvid: bvid,
    url: `${url}?p=${item.page}`,
  }))
}

// 处理ep多p逻辑
const parseEPPageData = (epList: any[]): Page[] => {
  return epList.map((item, index) => ({
    title: item.share_copy,
    page: index + 1,
    duration: formatSecond(item.duration / 1000),
    cid: item.cid,
    bvid: item.bvid,
    url: item.share_url,
  }))
}

const parseEP = async (html: string, url: string) => {
  try {
    const videoInfo = html.match(
      /<script>window\.__INITIAL_STATE__=([\s\S]*?);\(function\(\)\{var s;/
    )
    if (!videoInfo) {
      throw new Error('parse ep error')
    }
    const { h1Title, mediaInfo, epInfo, epList } = JSON.parse(videoInfo[1])
    // 获取视频下载地址
    let acceptQuality = null
    try {
      let downLoadData: any = html.match(
        /<script>window\.__playinfo__=([\s\S]*?)<\/script><script>window\.__INITIAL_STATE__=/
      )
      if (!downLoadData) {
        throw new Error('parse ep error')
      }
      downLoadData = JSON.parse(downLoadData[1])
      acceptQuality = {
        accept_quality: downLoadData.data.accept_quality,
        video: downLoadData.data.dash.video,
        audio: downLoadData.data.dash.audio,
      }
    } catch (error) {
      acceptQuality = await getAcceptQuality(epInfo.cid, epInfo.bvid)
    }
    const obj: VideoData = {
      id: '',
      title: mediaInfo.season_title,
      url,
      bvid: epInfo.bvid,
      cid: epInfo.cid,
      cover: `http:${mediaInfo.cover}`,
      createdTime: -1,
      quality: -1,
      view: mediaInfo.stat.views,
      danmaku: mediaInfo.stat.danmakus,
      reply: mediaInfo.stat.reply,
      duration: formatSecond(epInfo.duration / 1000),
      up: [
        { name: mediaInfo.upInfo.name, mid: mediaInfo.upInfo.mid, face: mediaInfo.upInfo.avatar },
      ],
      desc: mediaInfo.evaluate,
      qualityOptions: acceptQuality.accept_quality.map((item: any) => ({
        label: qualityMap[item],
        value: item,
      })),
      page: parseEPPageData(epList),
      subtitle: [],
      video: acceptQuality.video
        ? acceptQuality.video.map((item: any) => ({
            id: item.id,
            cid: epInfo.cid,
            url: item.baseUrl,
          }))
        : [],
      audio: acceptQuality.audio
        ? acceptQuality.audio.map((item: any) => ({
            id: item.id,
            cid: epInfo.cid,
            url: item.baseUrl,
          }))
        : [],
      filePathList: [],
      fileDir: '',
      size: -1,
      downloadUrl: { video: '', audio: '' },
    }
    return obj
  } catch (error: any) {
    throw new Error(error)
  }
}

const parseSS = async (html: string) => {
  const baseStore = useBaseStore()
  try {
    const videoInfo = html.match(
      /<script>window\.__INITIAL_STATE__=([\s\S]*?);\(function\(\)\{var s;/
    )
    if (!videoInfo) {
      throw new Error('parse ss error')
    }
    const { mediaInfo } = JSON.parse(videoInfo[1])
    const { body } = await getEpInfo(mediaInfo.newestEp.id, baseStore.token.SESSDATA)
    return parseEP(body, `https://www.bilibili.com/bangumi/play/ep${mediaInfo.newestEp.id}`)
  } catch (error: any) {
    throw new Error(error)
  }
}

const getAcceptQuality = async (cid: number, bvid: string) => {
  const baseStore = useBaseStore()
  const params: PlayeurlParam = {
    cid,
    bvid,
    qn: 127,
    otype: 'json',
    fourk: 1,
    fnver: 0,
    fnval: 80,
    session: '68191c1dc3c75042c6f35fba895d65b0',
  }
  const {
    body: {
      data: {
        accept_quality,
        dash: { video, audio },
      },
    },
    // headers: { 'set-cookie': responseCookies },
  } = await getPalyUrl(params, baseStore.token.SESSDATA)
  // 保存返回的cookies
  // saveResponseCookies(responseCookies)
  return {
    accept_quality,
    video,
    audio,
  }
}

/**
 * 获取字幕
 */
const getSubtitle = async (cid: number, bvid: string, SESSDATA: string) => {
  const {
    body: {
      data: { subtitle },
    },
  } = await getMoreVideoInfo(cid, bvid, SESSDATA)
  const subtitleList: Subtitle[] = subtitle.subtitles
    ? subtitle.subtitles.map((item: any) => ({
        title: item.lan_doc,
        url: item.subtitle_url,
      }))
    : []
  return subtitleList
}

// 处理filePathList
const handleFilePathList = (
  page: number,
  name: string,
  title: string,
  up: string,
  bvid: string
): string[] => {
  const settingStore = useSettingStore()
  const downloadPath = settingStore.downloadPath
  const pageName = `${!page ? '' : `[P${page}]`}${filterTitle(`${title}-${up}`)}`
  const dirName = `${filterTitle(`${name}-${up}`)}`
  const isFolder = settingStore.isFolder
  return [
    `${downloadPath}\\${isFolder ? `${dirName}\\` : ''}${pageName}.mp4`,
    `${downloadPath}\\${isFolder ? `${dirName}\\` : ''}${pageName}.png`,
    `${downloadPath}\\${isFolder ? `${dirName}\\` : ''}${pageName}-video.m4s`,
    `${downloadPath}\\${isFolder ? `${dirName}\\` : ''}${pageName}-audio.m4s`,
    isFolder ? `${downloadPath}\\${dirName}\\` : '',
  ]
}

// 处理fileDir
const handleFileDir = (page: number, title: string, up: string, bvid: string): string => {
  const settingStore = useSettingStore()
  const downloadPath = settingStore.downloadPath
  const name = `${filterTitle(`${title}-${up}`)}`
  const isFolder = settingStore.isFolder
  return `${downloadPath}${isFolder ? `\\${name}\\` : ''}`
}

export const getDownloadList = async (
  videoInfo: VideoData,
  selected: number[],
  quality: number
) => {
  const baseStore = useBaseStore()
  const downLoadList: VideoData[] = []
  for (let currentIndex = 0; currentIndex < selected.length; currentIndex++) {
    const current = selected[currentIndex]
    const currentPage = videoInfo.page.find((e) => {
      return e.page === current
    })
    if (currentPage === undefined) {
      throw new Error('加载错误')
    }
    const currentBvid: string = currentPage.bvid
    const currentCid: number = currentPage.cid
    const downloadUrl: DownloadUrl = {
      video: '',
      audio: '',
    }
    // 当只有1p或者第1p的时候，从video数组中获取视频、音频URL
    // videoInfo里的video字段中数组每个对象的cid都是该视频的cid
    const video = videoInfo.video.find((e) => {
      return e.id === quality && e.cid === currentCid
    })
    const audioFilter = videoInfo.audio.filter((audio) => {
      return audio.cid === currentCid
    })
    const audio = audioFilter.reduce(
      (x, y) => {
        return x.id > y.id ? x : y
      },
      { id: 0, url: '' }
    )
    if (audio && video) {
      downloadUrl.video = video.url
      downloadUrl.audio = audio.url
    } else {
      // 当多p的时候，除了第一p其他p都无法通过上述方式获取URL
      // 通过访问获取
      const {
        body: {
          data: { dash },
        },
      } = await getPalyUrl(
        {
          cid: currentCid,
          bvid: currentBvid,
          qn: quality,
          otype: 'json',
          fourk: 1,
          fnver: 0,
          fnval: 80,
        },
        baseStore.token.SESSDATA
      )
      downloadUrl.video = dash.video.find((e: any) => {
        return e.id === quality
      })
        ? dash.video.find((e: any) => {
            return e.id === quality
          }).baseUrl
        : dash.video[0].baseUrl
      downloadUrl.audio = dash.audio.reduce(
        (x: any, y: any) => {
          return x.id > y.id ? x : y
        },
        { id: 0, baseUrl: '' }
      ).baseUrl
    }
    const subtitle = await getSubtitle(currentCid, currentBvid, baseStore.token.SESSDATA)
    const taskId = uuidv4()
    const videoData: VideoData = {
      ...videoInfo,
      id: taskId,
      title: currentPage.title,
      url: currentPage.url,
      quality: quality,
      duration: currentPage.duration,
      createdTime: +new Date(),
      cid: currentCid,
      bvid: currentBvid,
      downloadUrl,
      filePathList: handleFilePathList(
        selected.length === 1 ? 0 : current,
        videoInfo.title,
        currentPage.title,
        videoInfo.up[0].name,
        currentBvid
      ),
      fileDir: handleFileDir(
        selected.length === 1 ? 0 : current,
        videoInfo.title,
        videoInfo.up[0].name,
        currentBvid
      ),
      subtitle,
    }
    downLoadList.push(videoData)
  }
  return downLoadList
}

export const addDownloadList = (videoList: VideoData[] | TaskData[]): TaskData[] => {
  const settingStore = useSettingStore()
  const taskStore = useTaskStore()
  const max = settingStore.downloadingMaxSize
  const downloadingCount = taskStore.downloadingTaskCount
  const count = max - downloadingCount
  const taskList: TaskData[] = []
  videoList.forEach((videoData, index) => {
    if (index < count) {
      taskList.push({
        ...videoData,
        status: 1,
        progress: 0,
        completeTime: -1,
      })
    } else {
      taskList.push({
        ...videoData,
        status: 4,
        progress: 0,
        completeTime: -1,
      })
    }
  })
  return taskList
}
