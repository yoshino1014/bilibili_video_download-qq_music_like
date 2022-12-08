import { getLoginInfo } from '@/api/login'
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
