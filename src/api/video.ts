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

// 获得番剧信息
export function getEpInfo(id: string, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://www.bilibili.com/bangumi/play/ep${id}`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
  })
}

// 视频字幕信息
export function getMoreVideoInfo(cid: number, bvid: string, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/player/v2?cid=${cid}&bvid=${bvid}`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    responseType: 'json',
  })
}

//热门视频
export function getPopularVideo(
  SESSDATA: string,
  { pn, ps }: { pn: number; ps: number }
): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/web-interface/popular`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    responseType: 'json',
    searchParams: {
      ps,
      pn,
    },
  })
}

//sousuo
export function search(
  SESSDATA: string,
  headers: any,
  {
    search_type,
    keyword,
    order,
    page,
  }: { search_type: string; keyword: string; order: string; page: number }
): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/web-interface/search/type`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA};` + headers,
    },
    responseType: 'json',
    searchParams: { search_type, keyword, order, page },
  })
}

export function getCookies(): Promise<any> {
  return window.electronApi.got(`https://www.bilibili.com`, {
    headers: {
      'User-Agent': `${UA}`,
    },
  })
}
