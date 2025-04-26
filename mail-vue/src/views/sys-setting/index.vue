<template>
  <div class="box">
    <div class="setting">
      <div class="title">网站设置</div>
      <div class="setting-item">
        <div><span>用户注册</span></div>
        <div>
          <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                     v-model="setting.register"/>
        </div>
      </div>
      <div class="setting-item">
        <div><span>添加邮箱</span></div>
        <div>
          <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                     v-model="setting.addEmail"/>
        </div>
      </div>

      <div class="setting-item">
        <div><span>邮件接收</span></div>
        <div>
          <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                     v-model="setting.receive"/>
        </div>
      </div>
      <div class="setting-item">
        <div><span>注册验证</span></div>
        <div>
          <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                     v-model="setting.registerVerify"/>
        </div>
      </div>
      <div class="setting-item">
        <div><span>添加验证</span></div>
        <div>
          <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                     v-model="setting.addEmailVerify"/>
        </div>
      </div>
      <div class="setting-item">
        <div>
          <span>多号模式</span>
          <el-popover
              content="开启后账号栏出现一个用户可以添加多个邮箱"
          >
            <template #reference>
              <Icon class="warning" icon="fe:warning" width="20" height="20" />
            </template>
          </el-popover>
        </div>
        <div>
          <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                     v-model="setting.manyEmail"/>
        </div>
      </div>
      <div class="setting-item ">
        <div>
          <span>轮询刷新</span>
          <el-popover

              content="轮询请求服务器获取最新邮件人多可能会超出免费额度"
          >
            <template #reference>
              <Icon class="warning" icon="fe:warning" width="20" height="20" />
            </template>
          </el-popover>
        </div>
        <div class="item-select">
          <el-select
              @change="change"
              style="width: 80px;"
              v-model="setting.autoRefreshTime"
              placeholder="Select"
          >
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="setting-item">
        <div class="title-item"><span>网站标题</span></div>
        <div class="email-title">
          <div>{{ setting.title }}</div>
          <div @click="editTitleShow = true">
            <Icon icon="iconamoon:edit-light" width="24" height="24"/>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="editTitleShow" title="修改标题" width="340" @close="editTitle = ''">
      <form>
        <el-input type="text" placeholder="网站标题" v-model="editTitle"/>
        <el-button type="primary" :loading="editTitleLoading" @click="saveTitle">保存</el-button>
      </form>
    </el-dialog>
  </div>
</template>
<script setup>
import {defineOptions} from "vue";
import {ref} from 'vue'
import {settingSet} from "@/request/setting.js";
import {ElMessage} from "element-plus";
import {useSettingStore} from "@/store/setting.js";
import {useUserStore} from "@/store/user.js";
import {useAccountStore} from "@/store/account.js";
import {Icon} from "@iconify/vue";

defineOptions({
  name: 'sys-setting'
})

const accountStore = useAccountStore();
const userStore = useUserStore();
const editTitleShow = ref(false)
const settingStore = useSettingStore();
let setting = ref(settingStore.settings)
const editTitle = ref('')
const editTitleLoading = ref(false)
let backup = {}
const options = [
  {
    label: '关闭',
    value: 0,
  },
  {
    label: '3s',
    value: 3,
  },
  {
    label: '5s',
    value: 5,
  },
  {
    label: '7s',
    value: 7,
  },
  {
    label: '10s',
    value: 10,
  },
  {
    label: '15s',
    value: 15,
  },
  {
    label: '20s',
    value: 20,
  }
]

function beforeChange() {
  backup = JSON.stringify(setting.value)
  return true
}

function change() {
  editSetting(setting)
}

function saveTitle() {
  backup = JSON.stringify(setting.value)
  setting.value.title = editTitle.value
  editSetting(setting)
}

function editSetting(setting) {
  editTitleLoading.value = true
  settingSet(setting.value).then(() => {
    editTitleLoading.value = false
    ElMessage({
      message: "设置成功",
      type: "success",
      plain: true
    })
    if (setting.value.manyEmail === 1) {
      accountStore.currentAccountId = userStore.user.accountId;
    }
    editTitleShow.value = false
  }).catch(() => {
    editTitleLoading.value = false
    setting.value = JSON.parse(backup)
  })
}

</script>
<style scoped lang="scss">
.box {

  padding: 40px 40px;

  .title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .setting {
    font-size: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 40px;

    .setting-item {
      display: flex;
      gap: 140px;
      font-weight: bold;
      position: relative;
      @media (max-width: 767px) {
        gap: 80px;
      }

      >div:first-child {
        display: flex;
        justify-content: center;
        align-items: center;
      }

    }

    .warning {
      position: absolute;
      left: 65px;
      color: gray;
    }
  }
}

.email-title {
  font-weight: normal !important;
  display: flex;
  gap: 10px;
  div:first-child {
    display: flex;
    align-items: center;
  }
}

.el-button {
  margin-top: 15px;
  width: 100%;
}
</style>