import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronApi', {
  got(url, options) {
    return ipcRenderer.invoke('got', url, options)
  },
  getStore(key) {
    return ipcRenderer.invoke('get-store', key)
  },
  setStore(key, data) {
    ipcRenderer.send('set-store', key, data)
  },
  deleteStore(key) {
    ipcRenderer.send('delete-store', key)
  },
  minimizeApp() {
    ipcRenderer.send('minimize')
  },
  maximizeApp() {
    ipcRenderer.send('maximize')
  },
  closeApp() {
    ipcRenderer.send('close')
  },
  once(channel, func) {
    const validChannels = ['init-store']
    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, (_event, ...args) => {
        func(...args)
      })
    }
  },
  openDirDialog() {
    return ipcRenderer.invoke('open-dir-dialog')
  },
  openDir(path) {
    return ipcRenderer.invoke('open-dir', path)
  },
  downloadVideo({ task, SESSDATA }) {
    ipcRenderer.send('download-video', { task, SESSDATA })
  },
  on(channel, func) {
    const validChannels = ['download-video-status', 'download-danmuku']
    if (validChannels.includes(channel)) {
      const subscription = (_event, ...args) => func(...args)
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, subscription)

      return () => ipcRenderer.removeListener(channel, subscription)
    }
    return undefined
  },
  getVideoSize(id) {
    return ipcRenderer.invoke('get-video-size', id)
  },
  openMenu() {
    return ipcRenderer.invoke('open-menu')
  },
  showFile(path) {
    return ipcRenderer.invoke('show-local-file', path)
  },
  openBrowser(url) {
    ipcRenderer.send('open-browser', url)
  },
})
