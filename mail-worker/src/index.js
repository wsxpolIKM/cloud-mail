import app from './hono/webs';
import { email } from './email/email';

export default {
	fetch(req, env, ctx) {
		const url = new URL(req.url)
		console.log(url.pathname)
		if (url.pathname.startsWith('/api/')) {
			url.pathname = url.pathname.replace('/api', '')
			req = new Request(url.toString(), req)
			return app.fetch(req, env, ctx);
		}

		return env.ASSETS.fetch(req);
	},
	email: email
};
