import { Hono } from 'hono';

const app = new Hono();
import initDB from '../init/init-db';
import initCache from '../init/init-cache';
import verify from '../security/security';
import result from '../model/result';
import { cors } from 'hono/cors';

app.use('*', cors());

let initStatus = true;
app.use('*', async (c, next) => {
	if (initStatus) {
		await initDB(c);
		initStatus = false;
	}
	await next();
});


let initCacheStatus = true;
app.use('*', async (c, next) => {
	if (initCacheStatus) {
		await initCache(c);
		initCacheStatus = false;
	}
	await next();
});


app.use('*', async (c, next) => {
	if(await verify(c)) {
		await next();
	}
});


app.onError((err, c) => {
	if (err.name === 'BizError') {
		console.log(err.message);
	}else {
		console.error(err);
	}
	return c.json(result.fail(err.message, err.code));
});

export default app;


