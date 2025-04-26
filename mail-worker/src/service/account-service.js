import BizError from '../error/biz-error';
import verifyUtils from '../utils/verify-utils';
import emailUtils from '../utils/email-utils';
import userService from './user-service';
import emailService from './email-service';
import orm from '../entity/orm';
import account from '../entity/account';
import { and, asc, eq, gt } from 'drizzle-orm';
import { isDel } from '../const/entity-const';
import settingService from './setting-service';
import turnstileService from './turnstile-service';

const accountService = {

	async add(c, params, userId) {


		if (!await settingService.isAddEmail(c)) {
			throw new BizError('添加邮箱功能已关闭');
		}

		let { email, token } = params;

		if (!email) {
			throw new BizError('邮箱不能为空');
		}

		if (!verifyUtils.isEmail(email)) {
			throw new BizError('非法邮箱');
		}

		if (!c.env.domain.includes(emailUtils.getDomain(email))) {
			throw new BizError('未配置改邮箱域名');
		}

		const accountRow = await this.selectByEmailIncludeDel(c, email);

		if (accountRow && accountRow.isDel === isDel.DELETE) {
			throw new BizError('该邮箱已被注销');
		}

		if (accountRow) {
			throw new BizError('该邮箱已被注册');
		}

		if (await settingService.isAddEmailVerify(c)) {
			await turnstileService.verify(c, token);
		}

		return orm(c).insert(account).values({ email: email, userId: userId }).returning().get();
	},

	selectByEmailIncludeDel(c, email) {
		return orm(c).select().from(account).where(eq(account.email, email)).get();
	},

	selectByEmail(c, email) {
		return orm(c).select().from(account).where(
			and(
				eq(account.email, email),
				eq(account.isDel, isDel.NORMAL)))
			.get();
	},

	list(c, params, userId) {

		let { accountId, size } = params;

		accountId = Number(accountId);
		size = Number(size);

		if (size > 30) {
			size = 30;
		}

		if (!accountId) {
			accountId = 0;
		}
		return orm(c).select().from(account).where(
			and(
				eq(account.userId, userId),
				eq(account.isDel, isDel.NORMAL),
				gt(account.accountId, accountId)))
			.orderBy(asc(account.accountId))
			.limit(size)
			.all();
	},

	async delete(c, params, userId) {

		let { accountId } = params;

		const user = await userService.selectById(c, userId);
		const accountRow = await this.selectById(c, accountId);

		if (accountRow.email === user.email) {
			throw new BizError('不可以删除自己的邮箱');
		}

		if (accountRow.userId !== user.userId) {
			throw new BizError('该邮箱不属于当前用户');
		}

		await orm(c).update(account).set({ isDel: isDel.DELETE }).where(
			and(eq(account.userId, userId),
				eq(account.accountId, accountId)))
			.run();
		await emailService.removeByAccountId(c, accountId);
	},

	selectById(c, accountId) {
		return orm(c).select().from(account).where(
			and(eq(account.accountId, accountId),
				eq(account.isDel, isDel.NORMAL)))
			.get();
	},

	async insert(c, params) {
		await orm(c).insert(account).values({ ...params }).returning();
	},

	async removeByUserId(c, userId) {
		await orm(c).update(account).set({ isDel: isDel.DELETE }).where(eq(account.userId, userId)).run();
	}
};

export default accountService;
