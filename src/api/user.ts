import UA from '@/assets/data/userAgent'

export function getUserInfo(uid: string): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/space/acc/info`, {
    headers: {
      'User-Agent': `${UA}`,
    },
    responseType: 'json',
    searchParams: {
      mid: uid,
    },
  })
}

export function getVideoList(searchParams: any): Promise<any> {
  return window.electronApi.got(`https://api.bilibili.com/x/space/arc/search`, {
    headers: {
      'User-Agent': `${UA}`,
    },
    responseType: 'json',
    searchParams,
  })
}
