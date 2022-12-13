export const formatSecond = (duration: number) => {
  const hours = Math.floor(duration / 3600)
  const minus = Math.floor((duration - hours * 3600) / 60)
  const secends = Math.floor(duration - minus * 60 - hours * 3600)
  return `${hours > 9 ? hours : '0' + hours}:${minus > 9 ? minus : '0' + minus}:${
    secends > 9 ? secends : '0' + secends
  }`
}

export const urlConversion = (path: string) => {
  if (!path) {
    return path
  }
  const reg = /^(https?:\/\/)([0-9a-z.]+)(:[0-9]+)?([/0-9a-z.]+)?(\?[0-9a-z&=]+)?(#[0-9-a-z]+)?/i
  path = path.replace(reg, 'https://$2$3$4$5$6')
  return path
  // return path.replace(/^(http)[s]*(:\/\/)/, 'https://images.weserv.nl/?url=')
}

// 替换不合法的文件名字符
export const filterTitle = (title: string) => {
  const pattern = /[「」`~!@#$^&*()=|{}':;',[\]<>/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g
  return title.replace(pattern, '')
}

export const sleep = (timeountMS: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, timeountMS)
  })

export const getPlatform = () => {
  if (/mac/i.test(navigator.userAgent)) {
    return 'mac'
  }
  if (/win/i.test(navigator.userAgent)) {
    return 'win'
  }
  if (/linux/i.test(navigator.userAgent)) {
    return 'linux'
  }
  return 'win'
}
