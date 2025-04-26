<template>
  <div class="email-container">
    <div class="header-actions">
      <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          :disabled="!emailList.length"
          @change="handleCheckAllChange"
      >
      </el-checkbox>
      <Icon class="icon" icon="ion:reload" width="18" height="18"  @click="refreshList" />
      <Icon class="icon" icon="uiw:delete" width="16" height="16" v-if="getSelectedMailsIds().length > 0" @click="handleDelete" />
      <Icon class="more-icon icon" width="16" height="16"  icon="akar-icons:dot-grid-fill" @click="changeAccountShow" />
    </div>


    <div ref="scroll"  class="scroll">
      <el-scrollbar>
        <div style="height: 100%;" :infinite-scroll-immediate="false" v-infinite-scroll="loadData" infinite-scroll-distance="600">
          <div v-for="item in emailList" :key="item.emailId">
            <div class="email-row"
                 :data-checked="item.checked"
                 @click="jumpDetails(item)"
            >
              <el-checkbox v-model="item.checked"  @click.stop></el-checkbox>
              <div @click.stop="starChange(item)" class="pc-star">
                <Icon v-if="item.isStar"   icon="fluent-color:star-16" width="20" height="20" />
                <Icon v-else icon="solar:star-line-duotone" width="18" height="18" />
              </div>
              <div  class="title" :class="accountShow ? 'title-column' : ''">
                <div class="email-sender">{{ item.name }}</div>
                <div class="email-subject">{{ item.subject}}</div>
              </div>
              <div class="email-right">
                <span class="email-time">{{ fromNow(item.createTime) }}</span>
                <div class="phone-star" :class="item.isStar ? 'star-pd' : ''" @click.stop="starChange(item)">
                  <Icon v-if="item.isStar" icon="fluent-color:star-16" width="20" height="20" />
                  <Icon v-else icon="solar:star-line-duotone" width="18" height="18" />
                </div>
              </div>
            </div>

          </div>
          <div class="loading" v-if="loading">
            <Loading />
          </div>
          <div class="follow-loading" v-if="emailList.length > 0 && !noLoading">
            <Loading />
          </div>
          <div class="noLoading" v-if="noLoading && emailList.length > 0">
            <div>没有更多数据了</div>
          </div>
          <div class="empty" v-if="noLoading && emailList.length === 0">
            <el-empty description="没有任何邮件" />
          </div>
        </div>
      </el-scrollbar>

    </div>
  </div>
</template>

<script setup>
import Loading from "@/components/loading/index.vue";
import {Icon} from "@iconify/vue";
import {computed, onActivated, reactive, ref, watch} from "vue";
import router from "@/router/index.js";
import {onBeforeRouteLeave} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";
import {useEmailStore} from "@/store/email.js";
import {useUiStore} from "@/store/ui.js";
import {useSettingStore} from "@/store/setting.js";
import {fromNow} from "@/day/day.js";

const props = defineProps({
  getEmailList: Function,
  emailDelete: Function,
  starAdd: Function,
  starCancel: Function,
  cancelSuccess: Function,
  starSuccess: Function,
  allowStar: {
    type: Boolean,
    default: true
  }
})


const settingStore = useSettingStore()
const uiStore = useUiStore();
const emailStore = useEmailStore();
const loading = ref(false);
const followLoading = ref(false);
const noLoading = ref(false);
const emailList = reactive([])
const mailTotal = ref(0);
const checkAll = ref(false);
const isIndeterminate = ref(false);
const scroll = ref(null)
const firstLoad = ref(true)
let scrollTop = 0
const queryParam = reactive({
  emailId: 0,
  size: 30,
});

defineExpose({
  refreshList,
  deleteEmail,
  addItemStar,
  editEmailStar,
  emailList,
  firstLoad
})

onActivated(() => {
  scroll.value.scrollTop = scrollTop
})

getEmailList()

onBeforeRouteLeave(() => {
  scrollTop = scroll.value.scrollTop
})


watch(
    () => emailList.map(item => item.checked),
    () => {
      if (emailList.length > 0) {
        updateCheckStatus();
      }
    },
    { deep: true }
);


watch(() => emailStore.deleteIds, () => {
  if (emailStore.deleteIds) {
    deleteEmail(emailStore.deleteIds)
  }
})

const accountShow = computed(() => {
  return uiStore.accountShow && settingStore.settings.manyEmail === 0
})


function starChange(email) {

  if (!email.isStar) {

    if (!props.allowStar) return;

    email.isStar = 1;
    props.starAdd(email.emailId).then(() => {
      email.isStar = 1;
      props.starSuccess(email)
    }).catch(() => {
      email.isStar = 0
    })
  } else {

    email.isStar = 0;
    props.starCancel(email.emailId).then(() => {
      email.isStar = 0;
      props.cancelSuccess?.(email)
    }).catch(() => {
      email.isStar = 1;
    })
  }
}

function changeAccountShow() {
  uiStore.accountShow = !uiStore.accountShow;
}


const handleDelete = () => {
  ElMessageBox.confirm('确认批量删除这些邮件吗?', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const emailIds = getSelectedMailsIds();
    props.emailDelete(emailIds).then(() => {
      ElMessage({
        message: '删除成功',
        type: 'success',
        plain: true,
      })
      emailStore.deleteIds = emailIds;
    })
  })
}

function deleteEmail(emailIds) {
  emailIds.forEach(emailId => {
    emailList.forEach((item,index) => {
      if (emailId === item.emailId) {
        emailList.splice(index,1);
      }
    })
  })
  if (emailList.length < queryParam.size && !noLoading.value) {
    getEemailList()
  }
}

function addItemStar(email) {

  const existIndex = emailList.findIndex(item => item.emailId === email.emailId)

  if (existIndex > -1) {
    return
  }

  const index = emailList.findIndex(item => item.emailId < email.emailId)

  if (index !== -1) {
    emailList.splice(index, 0, email);
  } else {
    if (noLoading.value) {
      emailList.push(email)
    }
  }
}

function editEmailStar(emailId,isStar) {
  const index = emailList.findIndex(item => item.emailId === emailId)
  if (index !== -1) {
    emailList[index].isStar = isStar
  }
}

function handleCheckAllChange(val) {
  emailList.forEach(item => item.checked = val);
  isIndeterminate.value = false;
}

// 获取选中的邮件列表id
function getSelectedMailsIds() {
  return emailList.filter(item => item.checked).map(item => item.emailId);
}


function updateCheckStatus() {
  const checkedCount = emailList.filter(item => item.checked).length;
  checkAll.value = checkedCount === emailList.length;
  isIndeterminate.value = checkedCount > 0 && checkedCount < emailList.length;
}

function jumpDetails(email) {
  emailStore.readEmail = email
  router.push("/content");
}

function getEmailList() {

  if (loading.value || followLoading.value || noLoading.value) return;

  if (emailList.length === 0) {
    loading.value = true
  }else {
    followLoading.value = true
  }

  props.getEmailList(queryParam.emailId, queryParam.size).then(data => {

    if (emailList.length === 0) {
      firstLoad.value = false
    }

    let list = data.list.map(item => ({
      ...item,
      checked: false
    }));

    if (data.list.length < queryParam.size) {
      noLoading.value = true
    }

    emailList.push(...list);
    mailTotal.value = data.total;
    queryParam.emailId = data.list.at(-1).emailId;
    loading.value = false
    followLoading.value = false
  }).catch(() => {
    loading.value = false
    followLoading.value = false
  })
}


function refreshList() {
  emailList.splice(0);
  noLoading.value = false;
  mailTotal.value = 0;
  checkAll.value = false;
  firstLoad.value = true
  isIndeterminate.value = false;
  queryParam.emailId = 0;
  getEmailList();
}

function loadData() {
  getEmailList()
}

</script>

<style lang="scss" scoped>

.email-container {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 0;
  font-size: 14px;
  color: #2e2e2e;
  overflow: hidden;
  height: 100%;
}

.scroll {
  margin: 0;
  height: calc(100% - 38px);
  overflow: auto;
  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  .noLoading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0;
    color: gray;
  }
  .follow-loading {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
}

.email-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  justify-content: space-between;
  box-shadow: inset 0 -1px 0 0 rgba(100, 121, 143, 0.12);
  cursor: pointer;
  position: relative;
  transition: background 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  .el-checkbox{
    width: 40px;
    display: flex;
    justify-content: center;
    padding-left: 6px;
  }

  .title-column {
    @media (max-width: 1200px) {
      grid-template-columns: 1fr !important;
      gap: 4px !important;
    }
  }

  .title {
    flex: 1;
    display: grid;
    gap: 20px;
    grid-template-columns: 200px 1fr;

    @media (max-width: 991px) {
      grid-template-columns: 1fr;
      gap: 4px;
    }

    .email-sender {
      font-weight: bold;
      color: #1a1a1a;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .email-subject {
      color: #333;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }


  .email-right {
    align-self: center;
    text-align: right;
    font-size: 12px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    color: #333;
    padding-left: 20px;
  }

  &:hover {
    box-shadow:
        inset 1px 0 0 rgb(218, 220, 224),
        inset -1px 0 0 rgb(218, 220, 224),
        0 1px 2px 0 rgba(60, 64, 67, 0.3),
        0 1px 3px 1px rgba(60, 64, 67, 0.15);
    z-index: 2;
  }

  /*&[data-checked="true"] {
    background-color: #c2dbff;
  }*/
}


.phone-star {
  display: none;
}

.pc-star {
  padding-left: 8px;
  display: flex;
  width: 40px;
}

@media (max-width: 991px) {
  .pc-star {
    display: none;
  }
  .email-right {
    display: flex;
    flex-direction: column;
  }
  .phone-star {
    display: block;
    align-self: end;
    padding-right: 16px;
    padding-top: 8px;
  }
  .star-pd{
    padding-top: 6px !important;
  }
  .title {
    padding-left: 8px;
  }
}

.email-time {
  padding-right: 16px !important;
}

:deep(.el-scrollbar__view) {
  height: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 3px 16px;
  box-shadow: inset 0 -1px 0 0 rgba(100, 121, 143, 0.12);
  .icon {
    font-size: 18px;
    margin-left: 16px;
    cursor: pointer;
  }
  .more-icon {
    margin-left: auto;
  }
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

</style>
