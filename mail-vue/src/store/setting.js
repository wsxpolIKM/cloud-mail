import { defineStore } from 'pinia'
import { settingQuery} from "@/request/setting.js";

export const useSettingStore = defineStore('setting', {
    state: () => ({
        domainList: [],
        settings: {
            title: '-'
        }
    }),
    actions: {
        async initSetting() {
            if (this.domainList.length === 0) {
                const data = await settingQuery()
                this.domainList.push(...data.domainList)
                delete data.domainList
                this.settings = data
            }
        }
    }
})
