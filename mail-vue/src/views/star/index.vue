<template>
  <emailScroll type="star" ref="scroll"
               :allow-star="false"
               :cancel-success="cancelStar"
               :getEmailList="starList"
               :emailDelete="emailDelete"
               :star-add="starAdd"
               :star-cancel="starCancel"/>
</template>

<script setup>
import emailScroll from "@/components/email-scroll/index.vue"
import {emailDelete} from "@/request/email.js";
import {starAdd, starCancel, starList} from "@/request/star.js";
import {useEmailStore} from "@/store/email.js";
import {defineOptions, onMounted, ref} from "vue";

defineOptions({
  name: 'star'
})

const scroll = ref({})
const emailStore = useEmailStore();

function cancelStar(email) {
  emailStore.emailScroll?.editEmailStar(email.emailId, 0)
  scroll.value.deleteEmail([email.emailId])
}

onMounted(() => {
  emailStore.starScroll = scroll
})

</script>
