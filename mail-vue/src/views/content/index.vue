<template>
  <div class="box">
    <div class="header-actions">
      <Icon class="icon" icon="material-symbols-light:arrow-back-ios-new" width="20" height="20" @click="handleBack"/>
      <Icon class="icon" icon="uiw:delete" width="16" height="16" @click="handleDelete"/>
      <Icon class="icon" @click="changeStar" v-if="email.isStar" icon="fluent-color:star-16" width="20" height="20"/>
      <Icon class="icon" @click="changeStar" v-else icon="solar:star-line-duotone" width="18" height="18"/>
    </div>
    <div></div>
    <el-scrollbar class="scrollbar">
      <div class="container">
        <div class="email-title">
          {{ email.subject }}
        </div>
        <div class="content">
          <div class="email-info">
            <div>
              <div class="send"><span class="send-source">发件人</span>
                <div class="send-name">
                  <span class="send-name-title">{{ email.name }}</span>
                  <span><{{ email.sendEmail }}></span>
                </div>
              </div>
              <div class="receive"><span class="source">收件人</span><span>{{ email.receiveEmail }}</span></div>
              <div class="date">
                <div>{{ formatDetailDate(email.createTime) }}</div>
              </div>
            </div>
            <div class="icon">

            </div>
          </div>
          <el-scrollbar class="htm-scrollbar">
            <div v-html="email.content"/>
          </el-scrollbar>
          <div class="att" v-if="atts.length > 0">
            <div class="att-title">附件列表</div>
            <div class="att-item" v-for="att in atts" :key="att.attId">
              <img v-if="isImage(att.filename)" class="att-image" :src="cvtR2Url(att.key)"/>
              <div class="att-icon" v-else>
                <Icon :icon="toIcon(att.filename)" width="20" height="20"/>
              </div>
              <div class="att-name">
                {{ att.filename }}
              </div>
              <div>{{ formatBytes(att.size) }}</div>
              <div class="down-icon att-icon">
                <a :href="cvtR2Url(att.key)" download>
                  <Icon icon="system-uicons:push-down" width="22" height="22"/>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>
<script setup>
import {reactive, watch} from "vue";
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {attList, emailDelete} from "@/request/email.js";
import {Icon} from "@iconify/vue";
import {useEmailStore} from "@/store/email.js";
import {useAccountStore} from "@/store/account.js";
import day from "@/day/day.js";
import {starAdd, starCancel} from "@/request/star.js";
import {getExtName, formatBytes} from "@/utils/file-utils.js";
import {cvtR2Url} from "@/utils/convert-utils.js";

const accountStore = useAccountStore();

const emailStore = useEmailStore();

const router = useRouter()
const email = emailStore.readEmail
const atts = reactive([])

attList(email.emailId).then(list => {
  atts.push(...list)
})

watch(() => accountStore.currentAccountId, () => {
  handleBack()
})

function toIcon(filename) {
  const extName = getExtName(filename)
  if (['zip', 'rar', '7z', 'tar', 'tgz'].includes(extName)) return 'hugeicons:file-zip';
  if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'].includes(extName)) return 'fluent:video-clip-24-regular';
  if (['txt', 'doc', 'docx', 'md'].includes(extName)) return 'hugeicons:google-doc'
  if (['xls', 'csv', 'xlsx'].includes(extName)) return 'codicon:table';
  if (['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a'].includes(extName)) return 'mynaui:music';
  if (['.ppt', 'pptx', 'pps', 'potx', 'pot'].includes(extName)) return 'lsicon:file-ppt-filled'
  if (extName === 'pdf') return 'hugeicons:pdf-02';
  if (extName === 'apk') return 'proicons:android';
  if (extName === 'exe') return 'bi:filetype-exe';
  return "hugeicons:attachment-01"
}


function isImage(filename) {
  return ['png', 'jpg', 'jpeg', 'bmp', 'gif'].includes(getExtName(filename))
}


const formatDetailDate = (time) => {
  return day(time).format('YYYY年M月D日 ddd AH:mm')
}

function changeStar() {
  if (email.isStar) {
    email.isStar = 0;
    starCancel(email.emailId).then(() => {
      email.isStar = 0;
      emailStore.emailScroll?.editEmailStar(email.emailId, 0)
      emailStore.starScroll?.deleteEmail([email.emailId])
    }).catch((e) => {
      console.error(e)
      email.isStar = 1;
    })
  } else {
    email.isStar = 1;
    starAdd(email.emailId).then(() => {
      email.isStar = 1;
      emailStore.emailScroll?.editEmailStar(email.emailId, 1)
      emailStore.starScroll?.addItemStar(email)
    }).catch((e) => {
      console.error(e)
      email.isStar = 0;
    })
  }
}

const handleBack = () => {
  router.back()
}

const handleDelete = () => {
  ElMessageBox.confirm('确认删除该邮件吗？', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emailDelete(email.value.emailId).then(() => {
      ElMessage({
        message: '删除成功',
        type: 'success',
        plain: true,
      })
      emailStore.deleteIds = [email.value.emailId]
    })
    router.back()
  })
}
</script>
<style scoped lang="scss">
.box {
  height: 100%;
  overflow: hidden;
}

.header-actions {
  padding: 9px 15px;
  display: flex;
  align-items: center;
  gap: 28px;
  box-shadow: inset 0 -1px 0 0 rgba(100, 121, 143, 0.12);
  font-size: 18px;

  .icon {
    cursor: pointer;
  }
}


.scrollbar {
  height: calc(100% - 38px);
  width: 100%;
}

.container {
  font-size: 14px;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 10px;

  .email-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .htm-scrollbar {
    padding-bottom: 15px;
    word-break: break-all;
  }

  .content {
    display: flex;
    flex-direction: column;

    .att {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e7e9ec;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .att-title {
        font-weight: bold;
      }

      .att-item {
        div {
          align-self: center;
        }

        padding: 10px;
        border-radius: 4px;
        align-self: start;
        border: 1px solid #e7e9ec;
        display: grid;
        grid-template-columns: auto 1fr auto 20px;
        gap: 10px;

        .att-icon {
          display: grid;
        }

        .att-name {

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-all;
        }

        .att-image {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }

        .down-icon {
          cursor: pointer;
        }
      }
    }

    .email-info {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e7e9ec;
      margin-bottom: 15px;

      /*.date {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
      }*/

      .date {
        color: #585d69;
        margin-bottom: 6px;
      }

      .send {
        display: flex;
        margin-bottom: 6px;

        .send-name {
          color: #585d69;
          display: flex;
          flex-wrap: wrap;
        }

        .send-name-title {
          padding-right: 10px;
        }
      }

      .receive {
        margin-bottom: 6px;

        span:nth-child(2) {
          color: #585d69;
        }
      }

      .send-source {
        white-space: nowrap;
        font-weight: bold;
        padding-right: 10px;
      }

      .source {
        white-space: nowrap;
        font-weight: bold;
        padding-right: 10px;
      }
    }
  }
}
</style>