import type { PlayeurlParam } from '@/types/index'
import UA from '@/assets/data/userAgent'

//视频流URL（非番剧
export function getPalyUrl(params: PlayeurlParam, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/player/playurl`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    responseType: 'json',
    searchParams: params,
  })
}

export function getEpInfo(id: string, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://www.bilibili.com/bangumi/play/ep${id}`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
  })
}

export function getMoreVideoInfo(cid: number, bvid: string, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/player/v2?cid=${cid}&bvid=${bvid}`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    responseType: 'json',
  })
}
