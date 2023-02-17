export const formatSecond = (duration: number) => {
  const hours = Math.floor(duration / 3600)
  const minus = Math.floor((duration - hours * 3600) / 60)
  const secends = Math.floor(duration - minus * 60 - hours * 3600)
  return `${hours > 9 ? hours : '0' + hours}:${minus > 9 ? minus : '0' + minus}:${
    secends > 9 ? secends : '0' + secends
  }`
}

export const formatTime = (time: number) => {
  const date = new Date(time * 1000) //获取一个时间对象
  // date.getFullYear() // 获取完整的年份(4位,1970)
  // date.getMonth() // 获取月份(0-11,0代表1月,用的时候记得加上1)
  // date.getDate() // 获取日(1-31)
  // date.getTime() // 获取时间(从1970.1.1开始的毫秒数)
  // date.getHours() // 获取小时数(0-23)
  // date.getMinutes() // 获取分钟数(0-59)
  // date.getSeconds() // 获取秒数(0-59)
  return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
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
  // const pattern = /[「」`~!@#$^&*()=|{}':;',[\]<>/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g
  const pattern = /[*|:[\]<>/?*""]/g
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

export const bigNumberTransform = (value: number, type: string) => {
  const newValue = ['', '', '']
  let fr = 1000
  let num = 3
  let text1 = ''
  let text2 = ''
  let fm = 1
  if (value === null || isNaN(value)) {
    return !type ? newValue : ''
  }
  if (value < 0) {
    value = Math.abs(value)
    text2 = '-'
  }
  while (value / fr >= 1) {
    fr *= 10
    num += 1
    // console.log('数字', value / fr, 'num:', num)
  }
  if (num <= 4) {
    // 千
    newValue[0] = value.toString()
    newValue[1] = ''
  } else if (num <= 8) {
    // 万
    // text1 = parseInt(num - 4) / 3 > 1 ? '千万' : '万'
    text1 = '万'
    // tslint:disable-next-line:no-shadowed-variable
    fm = text1 === '万' ? 10000 : 10000000
    if (value % fm === 0) {
      newValue[0] = parseInt((value / fm).toString()) + ''
    } else {
      newValue[0] = parseFloat((value / fm).toString()).toFixed(1) + ''
    }
    newValue[1] = text1
  } else {
    // 亿 if (num <= 16)
    // text1 = (num - 8) / 3 > 1 ? '千亿' : '亿'
    text1 = '亿'
    text1 = (num - 8) / 4 > 1 ? '万亿' : text1
    text1 = (num - 8) / 7 > 1 ? '千万亿' : text1
    text1 = (num - 8) / 10 > 1 ? '亿亿' : text1
    // tslint:disable-next-line:no-shadowed-variable
    fm = 1
    if (text1 === '亿') {
      fm = 100000000
    } else if (text1 === '千亿') {
      fm = 100000000000
    } else if (text1 === '万亿') {
      fm = 1000000000000
    } else if (text1 === '千万亿') {
      fm = 1000000000000000
    } else {
      fm = 1000000000000000000
    }
    if (value % fm === 0) {
      newValue[0] = parseInt((value / fm).toString()) + ''
    } else {
      newValue[0] = parseFloat((value / fm).toString()).toFixed(1) + ''
    }
    newValue[1] = text1
  }
  if (value < 1000) {
    newValue[0] = value + ''
    newValue[1] = ''
  }
  newValue[0] = text2 ? text2 + newValue[0] : newValue[0]
  return !type ? newValue : newValue[0] + newValue[1]
}
