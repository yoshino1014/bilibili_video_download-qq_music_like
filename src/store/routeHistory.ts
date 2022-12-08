import { defineStore } from 'pinia'

const MAXSIZE = 10

export const useRouteHistoryStore = defineStore('history', {
  state: () => {
    return {
      history: [] as string[],
      index: -1,
      backOrForward: false,
    }
  },
  actions: {
    hasPrev() {
      return this.history.length > 0 && this.index > 0
    },
    hasNext() {
      return this.index !== this.history.length - 1
    },
    pushRoute(path: string) {
      let len = this.history.length
      if (this.index === len - 1) {
        if (len > MAXSIZE) {
          this.history.splice(0, len - (MAXSIZE - 1))
        }
      } else {
        this.history.splice(this.index, len - 1 - this.index)
      }
      this.history.push(path)
      len = this.history.length
      this.index = len - 1
    },
    changeStatus(status: boolean) {
      return new Promise((resolve, reject) => {
        this.backOrForward = status
        resolve(0)
      })
    },
    prev() {
      if (this.index - 1 >= 0) {
        this.index--
      }
    },
    next() {
      if (this.index < this.history.length - 1) {
        this.index++
      }
    },
  },
})
