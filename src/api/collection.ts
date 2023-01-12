import UA from '@/assets/data/userAgent'

/**
 * 查询用户创建的视频收藏夹
 * @params up_mid用户uid SESSDATA令牌
 * @returns promise
 */
export function getCollection(up_mid: string, SESSDATA: string): Promise<any> {
  return window.electronApi.got(
    'https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=' + up_mid,
    {
      responseType: 'json',
      headers: {
        'User-Agent': `${UA}`,
        cookie: `SESSDATA=${SESSDATA}`,
      },
    }
  )
}

/**
 * 查询用户创建的视频收藏夹
 * @params up_mid用户uid SESSDATA令牌
 * @returns promise
 */
export function getCollectionInfo(media_id: number, SESSDATA: string): Promise<any> {
  return window.electronApi.got('https://api.bilibili.com/x/v3/fav/folder/info', {
    responseType: 'json',
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    searchParams: {
      media_id,
    },
  })
}

/**
 * 用户订阅收藏的收藏夹
 * @param up_mid 用户uid
 * @param pn 页数
 * @param ps 每页大小
 * @param SESSDATA token令牌
 * @returns promise
 */
export function getSubscribeList(
  up_mid: string,
  pn: number,
  ps: number,
  SESSDATA: string
): Promise<any> {
  return window.electronApi.got('https://api.bilibili.com/x/v3/fav/folder/collected/list', {
    responseType: 'json',
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    searchParams: {
      up_mid,
      pn,
      ps,
      platform: 'web',
      jsonp: 'jsonp',
    },
  })
}

export function getVideoList(searchParams: any, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/v3/fav/resource/list`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    responseType: 'json',
    searchParams,
  })
}

export function getVideoListSeason(searchParams: any, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/space/fav/season/list`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    responseType: 'json',
    searchParams: {
      season_id: searchParams.media_id,
      pn: searchParams.pn,
      ps: searchParams.ps,
      order: searchParams.order,
      keyword: searchParams.keyword,
      jsonp: 'jsonp',
    },
  })
}
