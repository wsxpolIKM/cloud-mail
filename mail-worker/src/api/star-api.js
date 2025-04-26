import app from '../hono/hono';
import startService from '../service/star-service';
import userContext from '../security/user-context';
import result from '../model/result';

app.post('/star/add', async (c) => {
	await startService.add(c, await c.req.json(), await userContext.getUserId(c));
	return c.json(result.ok());
});

app.get('/star/list', async (c) => {
	const data = await startService.list(c, c.req.query(), await userContext.getUserId(c));
	return c.json(result.ok(data));
});

app.delete('/star/cancel', async (c) => {
	await startService.cancel(c, await c.req.query(), await userContext.getUserId(c));
	return c.json(result.ok());
});
