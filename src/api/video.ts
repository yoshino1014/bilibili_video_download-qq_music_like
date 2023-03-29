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

//视频流URL(番剧)
export function getMediaUrl(params: PlayeurlParam, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/pgc/player/web/playurl`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
      Referer: 'https://www.bilibili.com',
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

// 获得完整的cookie
export function getCookies(): Promise<any> {
  return window.electronApi.got(`https://www.bilibili.com`, {
    headers: {
      'User-Agent': `${UA}`,
    },
  })
}

// 判断是否收藏
export function ifFollow(aid: string, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/v2/fav/video/favoured`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    responseType: 'json',
    searchParams: { aid },
  })
}

// 加入收藏
export function addIn(
  access_key: string,
  rid: number | undefined,
  csrf: string,
  add_media_ids: number
): Promise<any> {
  return window.electronApi.got('https://api.bilibili.com/x/v3/fav/resource/deal', {
    method: 'POST',
    headers: {
      'User-Agent': `${UA}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'https://www.bilibili.com',
      cookie: `SESSDATA=${access_key}`,
    },
    form: {
      add_media_ids,
      rid,
      type: 2,
      csrf,
      jsonp: 'jsonp',
      platform: 'web',
      eab_x: 2,
      ramval: 1,
      gaia_source: 'web_normal',
      ga: 1,
    },
  })
}
