<template>
  <div class="header">
    <div class="btn">
      <hanburger @click="changeAside"></hanburger>
      <span class="breadcrumb-item">{{ route.meta.title }}</span>
    </div>
    <div class="toolbar">
      <div class="email">{{ userStore.user.email }}</div>
      <el-dropdown>
        <div class="avatar">
          <div class="avatar-text">
            <div>{{ formatName(userStore.user.email) }}</div>
          </div>
          <Icon class="setting-icon" icon="mingcute:down-small-fill" width="24" height="24" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push('/setting')">
              个人设置
            </el-dropdown-item>
            <el-dropdown-item @click="clickLogout">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import hanburger from '@/components/hamburger/index.vue'
import { logout} from "@/request/login.js";
import {Icon} from "@iconify/vue";
import {useUiStore} from "@/store/ui.js";
import {useUserStore} from "@/store/user.js";
import { useRoute } from "vue-router";

const route = useRoute();
const userStore = useUserStore();
const uiStore = useUiStore();
function changeAside() {
  uiStore.asideShow = !uiStore.asideShow
}

function clickLogout() {
  logout().then(() => {
    localStorage.removeItem("token")
    router.push('/login')
  })
}

function formatName(email) {
  return email[0]?.toUpperCase() || ''
}

</script>

<style lang="scss" scoped>

.breadcrumb-item {
  font-weight: bold;
  font-size: 16px;
  white-space: nowrap;
}

.setting-icon {
  margin-right: 10px;
  position: relative;
  bottom: 10px;
}

.header {
  text-align: right;
  font-size: 12px;
  display: grid;
  height: 100%;
  gap: 10px;
  grid-template-columns: auto 1fr;
}

.btn {
  display: inline-flex;
  align-items: center;
  height: 100%;
}



.toolbar {
  display: grid;
  grid-template-columns: 1fr auto;
  margin-left: auto;
  gap: 10px;
  .email {
    align-self: center;
    font-size: 14px;
    margin-right: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: bold;
    width: 100%;
  }

  .avatar {
    display: flex;
    align-items: center;

    .avatar-text {
      height: 30px;
      width: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
      border: 1px solid #ccc;
    }

    .setting-icon {
      position: relative;
      top: 0;
    }
  }

}
.el-tooltip__trigger:first-child:focus-visible {
  outline: unset;
}
</style>
