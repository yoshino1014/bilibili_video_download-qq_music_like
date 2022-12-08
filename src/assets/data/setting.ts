const settingFormConfig = [
  {
    label: '下载地址',
    placeholder: '请设置下载地址',
    type: 'downloadPath',
    name: 'downloadPath',
    tips: '没有设置下载地址不能下载',
  },
  {
    label: '最大下载数',
    type: 'slider',
    name: 'downloadingMaxSize',
    tips: '没有选择同时下载的最大下载数不能下载',
    max: 5,
    min: 1,
  },
  {
    label: '下载成功后是否进行转码合并',
    type: 'switch',
    name: 'isMerge',
    tips: '下载的源文件是音视频分离的m4s文件，故需要合并',
  },
  {
    label: '下载成功后是否删除原视频',
    type: 'switch',
    name: 'isDelete',
    tips: '删除合并前的m4s文件',
  },
  {
    label: '下载到单独文件夹',
    type: 'switch',
    name: 'isFolder',
    tips: '开启后每个任务会下载到一个单独的文件夹里面',
  },
  {
    label: '下载字幕',
    type: 'switch',
    name: 'isSubtitle',
    tips: '开启后如果检测到当前下载视频有字幕则会下载',
  },
  {
    label: '下载弹幕',
    type: 'switch',
    name: 'isDanmaku',
    tips: '开启后会下载视频当前弹幕',
  },
  {
    label: '下载封面',
    type: 'switch',
    name: 'isCover',
    tips: '开启后会下载视频封面',
  },
]
const settingFormData = {
  downloadPath: '',
  isMerge: true,
  isDelete: true,
  isSubtitle: true,
  isDanmaku: true,
  isFolder: true,
  isCover: true,
  downloadingMaxSize: 5,
}
const settingRules = {
  downloadPath: [
    {
      required: true,
      message: '请设置下载地址',
    },
  ],
  downloadingMaxSize: [
    {
      required: true,
      message: '请选择同时下载的最大下载数',
    },
  ],
  isMerge: [
    {
      required: false,
    },
  ],
  isDelete: [
    {
      required: false,
    },
  ],
  isFolder: [
    {
      required: false,
    },
  ],
  isSubtitle: [
    {
      required: false,
    },
  ],
  isDanmaku: [
    {
      required: false,
    },
  ],
  isCover: [
    {
      required: false,
    },
  ],
}
const loginStatusText = ['未登录，点击登录', '普通用户，点击退出', '大会员，点击退出']

export { settingFormConfig, settingFormData, settingRules }
