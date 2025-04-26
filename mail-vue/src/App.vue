<template>
  <router-view/>
  <div class="loading" v-if="uiStore.init">
    <loading/>
  </div>
</template>
<script setup>
import loading from "@/components/loading/index.vue";
import {useUiStore} from "@/store/ui.js";
import {useSettingStore} from "@/store/setting.js";
import {watch} from "vue";

const settingStore = useSettingStore();
const uiStore = useUiStore();

watch(() => settingStore.settings.title,
    (title) => document.title = title,
    {immediate: true}
)
</script>

<style>

.loading {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>