<template>
  <div
    class="fixed top-0 right-0 w-navbarWidth h-navbarHeight flex items-center justify-between pl-10 pr-7 useDrag"
  >
    <div class="text-xs flex noDrag text-noSelect">
      <Icon
        icon="fluent-mdl2:chevron-left"
        :class="[routeHistory.hasPrev() ? 'text-[#777] cursor-pointer hover:text-primary' : '']"
        @click="prev()"
      />
      <Icon
        icon="fluent-mdl2:chevron-right"
        :class="[
          routeHistory.hasNext() ? 'text-[#777] cursor-pointer hover:text-primary' : '',
          'ml-6',
        ]"
        @click="next()"
      />
    </div>
    <div class="flex text-[#777] text-xs noDrag items-center">
      <div v-if="loginStatus === 0" class="flex items-center">
        <img
          src="@/assets/avatar.gif"
          alt=""
          srcset=""
          class="w-8 h-8 rounded-full mx-3 cursor-pointer"
        />
        <span class="cursor-pointer" @click="loginDialog.open()">点击登录</span>
      </div>
      <div v-else class="flex items-center" @click="quitLogin">
        <img :src="avatar" alt="" srcset="" class="w-8 h-8 rounded-full mx-3 cursor-pointer" />
        <span :class="['cursor-pointer', loginStatus === 2 ? 'text-[#fb7299]  font-bold' : '']">{{
          username
        }}</span>
        <img v-if="loginStatus === 2" src="@/assets/vip.png" alt="" class="h-5 w-auto ml-2" />
      </div>
      <Icon icon="fluent-mdl2:separator" class="mx-3 text-xl" />
      <Icon
        icon="fluent-mdl2:chrome-minimize"
        class="cursor-pointer hover:text-primary"
        @click="onMinimize"
      />
      <Icon
        icon="fluent-mdl2:chrome-restore"
        class="ml-5 cursor-pointer hover:text-primary"
        @click="onMaximize"
      />
      <Icon
        icon="fluent-mdl2:chrome-close"
        class="ml-5 cursor-pointer hover:text-primary"
        @click="onClose"
      />
    </div>
  </div>
  <LoginDialogVue ref="loginDialog" />
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { useRouteHistoryStore, useBaseStore } from '@/store/index'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import LoginDialogVue from '@/components/LoginDialog.vue'
import { ref } from 'vue'
import { logout } from '@/api/login'
import { ElMessageBox, ElMessage } from 'element-plus'

const baseStore = useBaseStore()
const routeHistory = useRouteHistoryStore()
const $router = useRouter()
const { loginStatus, username, avatar } = storeToRefs(baseStore)
const loginDialog = ref<any>(null)

const prev = () => {
  if (routeHistory.hasPrev()) {
    routeHistory.changeStatus(true).then(() => {
      $router.back()
      routeHistory.prev()
    })
  }
}

const next = () => {
  if (routeHistory.hasNext()) {
    routeHistory.changeStatus(true).then(() => {
      $router.forward()
      routeHistory.next()
    })
  }
}

const onMinimize = () => {
  window.electronApi.minimizeApp()
}
const onMaximize = () => {
  window.electronApi.maximizeApp()
}
const onClose = () => {
  window.electronApi.closeApp()
}

const quitLogin = async () => {
  ElMessageBox.confirm('你确定要退出登录吗', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    draggable: true,
    customClass: 'custom-confirm',
    closeOnClickModal: false,
  })
    .then(async () => {
      const res = await logout(
        baseStore.token.SESSDATA,
        baseStore.token.DedeUserID,
        baseStore.token.biliJct
      )
      const resData = JSON.parse(res.body)
      if (resData.code === 0 && resData.status === true) {
        baseStore.$reset()
        window.electronApi.deleteStore('token')
        ElMessage('已注销')
      } else {
        ElMessage('退出失败')
      }
    })
    .catch(() => {
      console.log('已取消')
    })
}
</script>

<style lang="scss">
.custom-confirm {
  border-radius: 10px !important;
  padding-bottom: 15px !important;
  .el-message-box__header {
    border-bottom: 1px solid #dcdfe6;
    padding-top: 16px;
    padding-bottom: 16px;
  }
  .el-message-box__content {
    padding-left: 40px;
    padding-top: 45px;
    padding-bottom: 45px;
  }
  .el-button {
    width: 88px;
    height: 28px;
    border: none;
  }
  .el-message-box__btns button:nth-child(1) {
    background-color: #e3e3e3;
    color: black;
    &:hover {
      background-color: #c4c4c4;
    }
  }
  .el-message-box__btns button:nth-child(2) {
    background-image: linear-gradient(to right, #1fd4ae, #1ecc95);
    &:hover {
      background-image: linear-gradient(to right, #1ec9a4, #1cb987);
    }
  }
}
</style>
