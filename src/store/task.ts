import { defineStore } from 'pinia'
import type { TaskData, TaskMap } from '@/types/index'

export const useTaskStore = defineStore('task', {
  state: () => {
    const taskMap: TaskMap = new Map()
    return {
      downloadingTaskCount: 0,
      taskMap,
    }
  },
  getters: {
    taskListArray(state) {
      return Array.from(state.taskMap)
    },
  },
  actions: {
    setTaskMap(taskMap: TaskMap) {
      this.taskMap = taskMap
    },
    getTask(id: string) {
      return this.taskMap.get(id)
    },
    updateTaskMap(taskList: TaskData[]) {
      taskList.forEach((task) => {
        this.taskMap.set(task.id, task)
        // 修改electron-store
        const path = `taskList.${task.id}`
        window.electronApi.setStore(path, task)
      })
    },
    updateTaskMapNoStore(taskList: TaskData[]) {
      taskList.forEach((task) => {
        this.taskMap.set(task.id, task)
      })
    },
    deleteTask(list: string[]) {
      list.forEach((id) => {
        this.taskMap.delete(id)
        // 修改electron-store
        const path = `taskList.${id}`
        window.electronApi.deleteStore(path)
      })
    },
    has(id: string) {
      return this.taskMap.has(id)
    },
  },
})
