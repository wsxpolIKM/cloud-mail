import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
    state: () => ({
        asideShow: window.innerWidth > 991,
        loginLoading: false,
        accountShow: false,
        init: true,
    }),
    persist: {
        pick: ['accountShow'],
    },
})