<template>
  <el-dialog
    v-model="dialogVisible"
    width="540px"
    :before-close="handleClose"
    :show-close="true"
    class="loginDialog"
    :close-on-click-modal="false"
    :draggable="true"
  >
    <div class="flex flex-col items-center h-[480px]">
      <div class="w-60 h-10 bg-[#F4F4F4] rounded-full mt-10 flex items-center justify-center">
        <div
          :class="['switch-btn', ifLoginByQrCode ? 'bg-white text-black' : '']"
          @click="chooseQrCodeLogin"
        >
          <span>扫码登录</span>
        </div>
        <div
          :class="['switch-btn', !ifLoginByQrCode ? 'bg-white text-black' : '']"
          @click="choosePwdLogin"
        >
          <span>账号登录</span>
        </div>
      </div>
      <div class="flex flex-col items-center">
        <!-- 二维码 -->
        <div class="w-40 h-40 flex justify-center items-center select-none border mt-14">
          <img :src="imageBase64" alt="" srcset="" />
          <div
            v-if="timeCounter < 0"
            class="w-40 h-40 absolute bg-black/80 flex justify-center items-center cursor-pointer"
            @click="createQrCode()"
          >
            <Icon icon="mdi:refresh" class="text-[40px] text-primary"></Icon>
          </div>
        </div>
        <div class="text-black/75 text-[15px] mt-8 h-8 leading-8 px-4 rounded-full bg-[#F7F7F7]">
          请使用哔哩哔哩手机APP扫码登录
        </div>
        <div class="text-xs w-80 text-black/50 mt-4">
          注：软件登录后获取SESSDATA来下载，普通用户下载1080P视频，大会员可以下载8K视频，不登录下载480P视频
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { getLoginUrl, getScanInfo } from '@/api/login'
import qrcode from 'qrcode'
import { checkLogin } from '@/core/bilibili'
import { useBaseStore } from '@/store'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import type { TokenData } from '@/types/index'
import { useRouter, useRoute } from 'vue-router'

const dialogVisible = ref<boolean>(false)
const timeCounter = ref<number>(180)
const imageBase64 = ref<string>('')
const qrcodeKey = ref<string>('')
const QRSESSDATA = ref<string>('')
const DedeUserID = ref<string>('')
const biliJct = ref<string>('')
const baseStore = useBaseStore()
const ifLoginByQrCode = ref<boolean>(true)
const $router = useRouter()
const $route = useRoute()
let timer: any = null

const handleClose = (done: () => void) => {
  clearInterval(timer)
  done()
}

const open = () => {
  createQrCode()
  dialogVisible.value = true
}

const chooseQrCodeLogin = () => {
  ifLoginByQrCode.value = true
  createQrCode()
}

const choosePwdLogin = () => {
  ifLoginByQrCode.value = false
  clearInterval(timer)
}

const createQrCode = async () => {
  const { body } = await getLoginUrl()
  const qr = await qrcode.toDataURL(body.data.url, {
    margin: 0,
    errorCorrectionLevel: 'H',
    width: 140,
  })
  imageBase64.value = qr
  qrcodeKey.value = body.data.qrcode_key
  timeCounter.value = 180
  if (timer) {
    clearInterval(timer)
  } else {
    timer = setInterval(() => {
      if (timeCounter.value < 0) {
        clearInterval(timer)
        return
      }
      timeCounter.value--
    }, 1000)
  }
  checkScanStatus()
}

const checkScanStatus = async () => {
  const { body } = await getScanInfo(qrcodeKey.value)
  if (body.code === 0 && body.data.code === 0) {
    // 扫码登陆成功,获取SESSDATA
    QRSESSDATA.value = body.data.url.match(/SESSDATA=(\S*)&bili_jct/)[1]
    DedeUserID.value = body.data.url.match(/DedeUserID=(\S*)&DedeUserID__ckMd5/)[1]
    biliJct.value = body.data.url.match(/bili_jct=(\S*)&gourl/)[1]
    // 登录
    login()
    return
  }
  setTimeout(() => {
    checkScanStatus()
  }, 1500)
}

const login = async () => {
  const userData = await checkLogin(QRSESSDATA.value)
  const token: TokenData = {
    SESSDATA: QRSESSDATA.value,
    DedeUserID: DedeUserID.value,
    biliJct: biliJct.value,
  }
  baseStore.setToken(token)
  baseStore.loginStatus = userData.loginStatus
  baseStore.username = userData.username
  baseStore.avatar = userData.avatar
  dialogVisible.value = false
  clearInterval(timer)
  ElMessage({
    type: 'success',
    message: '登录成功',
  })
  refresh()
}

const refresh = () => {
  let query = {
    t: 0,
  }
  if ($route.query) {
    query = JSON.parse(JSON.stringify($route.query))
  }
  query.t = Date.now()
  $router.push({
    path: $route.path,
    query,
  })
}

defineExpose({
  open,
})
</script>

<style lang="scss">
.loginDialog {
  border-radius: 10px;
  .el-dialog__headerbtn .el-dialog__close {
    font-size: 20px;
  }
  .el-dialog__body {
    padding: 0;
  }
  .switch-btn {
    width: calc(50% - 1px);
    height: calc(100% - 2px);
    border-radius: 99999px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
}
</style>
