import app from '../hono/hono';
import userService from '../service/user-service';
import result from '../model/result';
import userContext from '../security/user-context';

app.get('/user/loginUserInfo', async (c) => {
	const user = await userService.loginUserInfo(c, await userContext.getUserId(c));
	return c.json(result.ok(user));
});

app.put('/user/resetPassword', async (c) => {
	await userService.resetPassword(c, await c.req.json(), await userContext.getUserId(c));
	return c.json(result.ok());
});

app.delete('/user/delete', async (c) => {
	await userService.delete(c, await userContext.getUserId(c));
	return c.json(result.ok());
})




