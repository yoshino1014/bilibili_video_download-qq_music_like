import ffmpegPath from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'
const isDevelopment = process.env.NODE_ENV !== 'production'

export const mergeVideoAudio = (videoPath: string, audioPath: string, out: string) => {
  return new Promise((resolve, reject) => {
    if (isDevelopment) {
      ffmpeg.setFfmpegPath(ffmpegPath as string)
    } else {
      // see: https://github.com/electron/electron-packager/issues/740
      ffmpegPath !== null
        ? ffmpeg.setFfmpegPath(ffmpegPath.replace('app.asar', 'app.asar.unpacked'))
        : reject('ffmpeg加载错误')
    }
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .audioCodec('copy')
      .videoCodec('copy')
      .on('start', (cmd: any) => {
        console.log(`开始转码：${cmd}`)
      })
      .on('end', () => {
        resolve('end')
      })
      .on('error', (err: any) => {
        reject(err)
      })
      .save(out)
  })
}
