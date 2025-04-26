import app from '../hono/hono';
import result from '../model/result';
import settingService from '../service/setting-service';

app.put('/setting/set', async (c) => {
	await settingService.set(c, await c.req.json());
	return c.json(result.ok());
})

app.get('/setting/query', async (c) => {
	const setting = await settingService.query(c);
	return c.json(result.ok(setting));
})
