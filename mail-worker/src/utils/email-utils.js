const emailUtils = {
	getDomain(email) {
		if (typeof email !== 'string') return ''
		const parts = email.split('@')
		return parts.length === 2 ? parts[1] : ''
	}
}

export default emailUtils
