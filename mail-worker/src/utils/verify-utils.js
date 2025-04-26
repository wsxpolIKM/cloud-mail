const verifyUtils = {
	isEmail(str) {
		return /^[a-zA-Z0-9]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+$/.test(str);
	}
}

export default  verifyUtils
