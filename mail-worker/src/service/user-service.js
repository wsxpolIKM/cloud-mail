import BizError from '../error/biz-error';
import accountService from './account-service';
import orm from '../entity/orm';
import user from '../entity/user';
import { eq, and } from 'drizzle-orm';
import { isDel } from '../const/entity-const';
import kvConst from '../const/kv-const';
import cryptoUtils from '../utils/crypto-utils';

const userService = {

	async loginUserInfo(c, userId) {
		let user = await userService.selectById(c, userId);
		let account = await accountService.selectByEmailIncludeDel(c, user.email);
		delete user.password;
		delete user.salt;
		user.accountId = account.accountId;
		user.type = c.env.admin === user.email ? 0 : 1;
		return user;
	},

	async resetPassword(c, params, userId) {

		const { password } = params;

		if (password < 6) {
			throw new BizError('密码不能小于6位');
		}
		const { salt, hash } = await cryptoUtils.hashPassword(password);
		await orm(c).update(user).set({ password: hash, salt: salt }).where(eq(user.userId, userId)).run();
	},

	selectByEmail(c, email) {
		return orm(c).select().from(user).where(
			and(
				eq(user.email, email),
				eq(user.isDel, isDel.NORMAL)))
			.get();
	},

	async insert(c, params) {
		const { userId } = await orm(c).insert(user).values({ ...params }).returning().get();
		return userId;
	},

	selectByEmailIncludeDel(c, email) {
		return orm(c).select().from(user).where(eq(user.email, email)).get();
	},

	selectById(c, userId) {
		return orm(c).select().from(user).where(
			and(
				eq(user.userId, userId),
				eq(user.isDel, isDel.NORMAL)))
			.get();
	},

	async delete(c, userId) {
		await orm(c).update(user).set({ isDel: isDel.DELETE }).where(eq(user.userId, userId)).run();
		await Promise.all([
			c.env.kv.delete(kvConst.AUTH_INFO + userId),
			accountService.removeByUserId(c, userId)
		]);
	}
};

export default userService;
