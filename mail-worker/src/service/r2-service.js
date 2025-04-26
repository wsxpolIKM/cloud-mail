const r2Service = {
	async putObj(c, key, content, metadata) {
		const body = typeof content === 'string'
			? new TextEncoder().encode(content)
			: content;
		await c.env.r2.put(key, body, {
			httpMetadata: {...metadata}
		});
	}
};
export default r2Service;
