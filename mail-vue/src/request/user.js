import http from '@/axios/index.js';

export function loginUserInfo() {
    return http.get('/user/loginUserInfo')
}

export function resetPassword(password) {
    return http.put('/user/resetPassword', {password})
}

export function userDelete() {
    return http.delete('/user/delete')
}