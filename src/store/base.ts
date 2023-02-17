import { defineStore } from 'pinia'
import { TokenData } from '@/types/index'

interface BaseData {
  loginStatus: number // 登录状态、0未登录、1普通会员、2大会员
  username: string
  avatar: string
  token: TokenData
}

export const useBaseStore = defineStore('base', {
  state: (): BaseData => ({
    loginStatus: 0,
    username: '',
    avatar: '',
    token: {
      SESSDATA: '',
      DedeUserID: '',
      biliJct: '',
    },
  }),
  actions: {
    setToken(token: TokenData) {
      this.token = token
      window.electronApi.setStore('token', token)
    },
  },
})
