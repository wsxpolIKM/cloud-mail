import http from '@/axios/index.js';

export function emailList(accountId, emailId, size) {
    return http.get('/email/list', {params: {accountId, emailId, size}})
}

export function emailDelete(emailIds) {
    return http.delete('/email/delete?emailIds=' + emailIds)
}

export function attList(emailId) {
    return http.get('/email/attList', {params: {emailId}})
}

export function emailLatest(emailId,accountId) {
    return http.get('/email/latest',{params: {emailId,accountId}})
}