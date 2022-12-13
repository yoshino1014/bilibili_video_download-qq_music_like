'use strict'

import { app, protocol, BrowserWindow, ipcMain, session, dialog, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import got from 'got'
import log from 'electron-log'
import path from 'path'
import ecStore from 'electron-store'
import fs from 'fs'
import { downloadVideo } from '@/core/download'
import type { TaskData, SettingData } from '@/types/index'

const isDevelopment = process.env.NODE_ENV !== 'production'
const store = new ecStore({
  name: 'database',
})
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
])

let win: BrowserWindow
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1020,
    height: 690,
    minWidth: 1020,
    minHeight: 690,
    backgroundColor: '#f6f6f6',
    titleBarStyle: 'hidden',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) {
      win.webContents.openDevTools()
    }
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

function init() {
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('init-store')
  })
}

// 发送get请求
ipcMain.handle('got', (event, url, option) => {
  return new Promise((resolve, reject) => {
    got(url, option)
      .then((res: any) => {
        return resolve({ body: res.body, redirectUrls: res.redirectUrls, headers: res.headers })
      })
      .catch((error: any) => {
        log.error(`http error: ${error.message}`)
        return reject(error.message)
      })
  })
})

// electron-store操作
ipcMain.handle('get-store', (event, path) => {
  return Promise.resolve(store.get(path))
})

ipcMain.on('set-store', (event, path, data) => {
  store.set(path, data)
})

ipcMain.on('delete-store', (event, path) => {
  store.delete(path)
})

// 最小化
ipcMain.on('minimize', () => {
  win.minimize()
})
// 最大化
ipcMain.on('maximize', () => {
  if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize()
  }
})
// 关闭窗口
ipcMain.on('close', () => {
  win.destroy()
})

// 打开选择文件夹dialog
ipcMain.handle('open-dir-dialog', () => {
  const filePaths = dialog.showOpenDialogSync({
    title: '选择下载地址',
    defaultPath: app.getPath('downloads'),
    properties: ['openDirectory'],
  })
  if (filePaths) {
    return Promise.resolve(filePaths[0])
  }
  return Promise.reject(new Error('not select'))
})

// 打开指定文件夹
ipcMain.handle('open-dir', (event, path) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) {
      shell.openPath(path)
      resolve('即将打开文件夹')
    } else {
      reject('文件夹不存在')
    }
  })
})

// 下载视频
ipcMain.on('download-video', (event, { task, SESSDATA }: { task: TaskData; SESSDATA: string }) => {
  const setting = store.get('setting')
  downloadVideo(task, event, setting as SettingData, SESSDATA)
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    //   await installExtension(VUEJS3_DEVTOOLS)
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', (e as Error).toString())
    // }
    await session.defaultSession.loadExtension(
      'C:\\Users\\11720\\AppData\\Local\\Microsoft\\Edge\\User Data\\Profile 1\\Extensions\\olofadcdnkkjdfgjcmjaadnlehnnihnl\\6.4.5_0'
    )
  }
  createWindow()
  init()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
