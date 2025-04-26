import { defineStore } from 'pinia'

export const useEmailStore = defineStore('email', {
    state: () => ({
        deleteIds: 0,
        starScroll: null,
        emailScroll: null,
        readEmail: {},
    }),
    persist: {
        pick: ['readEmail'],
    },
})
