import UA from '@/assets/data/userAgent'

export function getUserInfo(uid: string, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/space/acc/info`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    responseType: 'json',
    searchParams: {
      mid: uid,
    },
  })
}

export function getVideoList(searchParams: any, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/space/arc/search`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    responseType: 'json',
    searchParams,
  })
}

// 关注列表
export function getFollowing(searchParams: any, SESSDATA: string): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/relation/followings`, {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    responseType: 'json',
    searchParams,
  })
}
