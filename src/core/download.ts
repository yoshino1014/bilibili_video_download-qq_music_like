import stream from 'stream'
import { promisify } from 'util'
import fs from 'fs'
import type { IpcMainEvent } from 'electron'
import type { TaskData, Subtitle, SettingData } from '@/types/index'
import UA from '@/assets/data/userAgent'
import got from 'got/'
import log from 'electron-log'
import { mergeVideoAudio } from '@/core/media'
import { formatSecond } from '@/core/utils'
const pipeline = promisify(stream.pipeline)

export const downloadVideo = async (
  task: TaskData,
  event: IpcMainEvent,
  setting: SettingData,
  SESSDATA: string
) => {
  let videoLastTime = 0
  let audioLastTime = 0
  // 去掉扩展名的文件路径
  const fileName = task.filePathList[0].substring(0, task.filePathList[0].length - 4)
  const imageConfig = {
    headers: {
      'User-Agent': UA,
      cookie: `SESSDATA=${SESSDATA}`,
    },
  }
  const downloadConfig = {
    headers: {
      'User-Agent': `${UA}`,
      referer: task.url,
    },
  }
  // 创建文件夹
  if (setting.isFolder && !fs.existsSync(task.fileDir)) {
    try {
      fs.mkdirSync(task.fileDir)
    } catch (err) {
      console.log(err)
    }
  }
  // 下载封面
  if (setting.isCover) {
    await pipeline(
      got.stream(task.cover, imageConfig).on('error', (error: Error) => {
        console.log(error)
      }),
      fs.createWriteStream(task.filePathList[1])
    )
  }
  // 下载字幕
  if (setting.isSubtitle) {
    downloadSubtitle(fileName, task.subtitle)
  }
  // 下载视频
  await pipeline(
    got
      .stream(task.downloadUrl.video, downloadConfig)
      .on('downloadProgress', (progress: { percent: number }) => {
        const nowTime = +new Date()
        if (!videoLastTime || nowTime - videoLastTime > 1000) {
          event.reply('download-video-status', {
            id: task.id,
            status: 1,
            progress: Math.round(progress.percent * 100 * 0.75),
          })
          videoLastTime = nowTime
        }
      })
      .on('error', (error: any) => {
        log.error(`视频下载失败：${task.title} ${error.message}`)
        event.reply('download-video-status', {
          id: task.id,
          status: 5,
          progress: 100,
        })
      }),
    fs.createWriteStream(task.filePathList[2])
  )
  // 下载音频
  await pipeline(
    got
      .stream(task.downloadUrl.audio, downloadConfig)
      .on('downloadProgress', (progress: any) => {
        const nowTime = +new Date()
        if (!audioLastTime || nowTime - audioLastTime > 1000) {
          event.reply('download-video-status', {
            id: task.id,
            status: 2,
            progress: Math.round(progress.percent * 100 * 0.22 + 75),
          })
          audioLastTime = nowTime
        }
      })
      .on('error', (error: any) => {
        log.error(`音频下载失败：${task.title} ${error.message}`)
        event.reply('download-video-status', {
          id: task.id,
          status: 5,
          progress: 100,
        })
      }),
    fs.createWriteStream(task.filePathList[3])
  )
  // 音视频合并
  if (setting.isMerge) {
    event.reply('download-video-status', {
      id: task.id,
      status: 3,
      progress: 98,
    })
    mergeVideoAudio(task.filePathList[2], task.filePathList[3], task.filePathList[0])
      .then(() => {
        event.reply('download-video-status', {
          id: task.id,
          status: 0,
          progress: 100,
        })
        // 删除原视频
        if (setting.isDelete) {
          fs.rmSync(task.filePathList[2])
          fs.rmSync(task.filePathList[3])
        }
      })
      .catch((err) => {
        log.error('音视频合成失败' + err)
        event.reply('download-video-status', {
          id: task.id,
          status: 5,
          progress: 100,
        })
        // 删除原视频
        if (setting.isDelete) {
          fs.rmSync(task.filePathList[2])
          fs.rmSync(task.filePathList[3])
        }
      })
  }
}

const downloadSubtitle = async (fileName: string, subtitle: Subtitle[]) => {
  for (let index = 0; index < subtitle.length; index++) {
    const element = subtitle[index]
    const {
      body: { body },
    } = await got<any>(`https:${element.url}`, {
      headers: {
        'User-Agent': `${UA}`,
      },
      responseType: 'json',
    })
    let str = ''
    body.forEach((element: { from: any; to: any; content: any }, index: number) => {
      const from = String(element.from).split('.')
      const to = String(element.to).split('.')
      str += `${index + 1}\n${formatSecond(Number(from[0]))},${
        from[1] ? from[1] : '0'
      } --> ${formatSecond(Number(to[0]))},${to[1] ? to[1] : '0'}\n${element.content}\n\n`
    })
    const path = `${fileName}-${element.title}.srt`
    fs.writeFile(path, str, { encoding: 'utf8' }, (err: any) => {
      if (!err) {
        console.log('success')
      }
    })
  }
}
