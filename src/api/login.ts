import UA from '@/assets/data/userAgent'

/**
 * 获取二维码
 * @returns promise
 */
export function getLoginUrl(): Promise<any> {
  return window.electronApi.got(
    'http://passport.bilibili.com/x/passport-login/web/qrcode/generate',
    {
      responseType: 'json',
    }
  )
}

/**
 * 获取扫描状态
 * @param qrcodeKey 二维码key
 * @returns 状态
 */
export function getScanInfo(qrcodeKey: string): Promise<any> {
  return window.electronApi.got('https://passport.bilibili.com/x/passport-login/web/qrcode/poll', {
    responseType: 'json',
    searchParams: {
      // eslint-disable-next-line camelcase
      qrcode_key: qrcodeKey,
    },
  })
}

/**
 *
 * 导航栏用户信息
 * @param SESSDATA cookie
 * @returns promise
 */
export function getLoginInfo(SESSDATA: string): Promise<any> {
  return window.electronApi.got('https://api.bilibili.com/nav', {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
    responseType: 'json',
  })
}

/**
 * 退出登录
 * @param SESSDATA
 * @param DedeUserID
 * @param biliJct
 * @returns promise
 */
export function logout(SESSDATA: string, DedeUserID: string, biliJct: string): Promise<any> {
  return window.electronApi.got('https://passport.bilibili.com/login/exit/v2', {
    method: 'POST',
    headers: {
      'User-Agent': `${UA}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      cookie: `DedeUserID=${DedeUserID}; bili_jct=${biliJct}; SESSDATA=${SESSDATA}`,
    },
    form: {
      biliCSRF: biliJct,
    },
  })
}
