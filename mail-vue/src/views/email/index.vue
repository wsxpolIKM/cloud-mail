<template>
  <emailScroll ref="scroll"
               :cancel-success="cancelStar"
               :star-success="addStar"
               :getEmailList="getEmailList"
               :emailDelete="emailDelete"
               :star-add="starAdd"
               :star-cancel="starCancel"/>
</template>

<script setup>
import {useAccountStore} from "@/store/account.js";
import {useEmailStore} from "@/store/email.js";
import {useSettingStore} from "@/store/setting.js";
import emailScroll from "@/components/email-scroll/index.vue"
import {emailList, emailDelete, emailLatest} from "@/request/email.js";
import {starAdd, starCancel} from "@/request/star.js";
import {defineOptions, onMounted, ref, watch} from "vue";
import {sleep} from "@/utils/time-utils.js";

defineOptions({
  name: 'email'
})

const emailStore = useEmailStore();
const accountStore = useAccountStore();
const settingStore = useSettingStore();
const scroll = ref({})

onMounted(() => {
  emailStore.emailScroll = scroll;
  latest()
})


watch(() => accountStore.currentAccountId, () => {
  scroll.value.refreshList();
})

async function latest() {
  while (true) {
    const latestId = scroll.value.emailList[0]?.emailId ?? 0

    if (!scroll.value.firstLoad && settingStore.settings.autoRefreshTime) {
      try {
        const accountId = accountStore.currentAccountId
        const list = await emailLatest(latestId,accountId)
        if (accountId === accountStore.currentAccountId) {
          scroll.value.emailList.unshift(...list)
        }
      } catch (e) {
        console.error(e)
      }
    }
    await sleep(settingStore.settings.autoRefreshTime * 1000)
  }
}

function addStar(email) {
  emailStore.starScroll?.addItemStar(email)
}

function cancelStar(email) {
  emailStore.starScroll?.deleteEmail([email.emailId])
}

function getEmailList(emailId, size) {
  return emailList(accountStore.currentAccountId, emailId, size)
}

</script>

