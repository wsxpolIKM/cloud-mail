export function isEmail(email) {
    const reg = /^[a-zA-Z0-9]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+$/;
    return reg.test(email);
}