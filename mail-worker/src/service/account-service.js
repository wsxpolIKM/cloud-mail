import BizError from '../error/biz-error';
import verifyUtils from '../utils/verify-utils';
import emailUtils from '../utils/email-utils';
import userService from './user-service';
import emailService from './email-service';
import orm from '../entity/orm';
import account from '../entity/account';
import { and, asc, eq, gt, inArray, count, sql } from 'drizzle-orm';
import { isDel } from '../const/entity-const';
import settingService from './setting-service';
import turnstileService from './turnstile-service';
import roleService from './role-service';
import { t } from '../i18n/i18n';

const accountService = {

	async add(c, params, userId) {

		if (!await settingService.isAddEmail(c)) {
			throw new BizError(t('addAccountDisabled'));
		}

		let { email, token } = params;

		if (!email) {
			throw new BizError(t('emptyEmail'));
		}

		if (!verifyUtils.isEmail(email)) {
			throw new BizError(t('notEmail'));
		}

		if (!c.env.domain.includes(emailUtils.getDomain(email))) {
			throw new BizError(t('notExistDomain'));
		}


		const accountRow = await this.selectByEmailIncludeDelNoCase(c, email);

		if (accountRow && accountRow.isDel === isDel.DELETE) {
			throw new BizError(t('isDelAccount'));
		}

		if (accountRow) {
			throw new BizError(t('isRegAccount'));
		}

		const userRow = await userService.selectById(c, userId);
		const roleRow = await roleService.selectById(c, userRow.type);

		if (userRow.email !== c.env.admin) {

			if (roleRow.accountCount > 0) {
				const userAccountCount = await accountService.countUserAccount(c, userId)
				if(userAccountCount >= roleRow.accountCount) throw new BizError(t('accountLimit'), 403);
			}

			if(!roleService.hasAvailDomainPerm(roleRow.availDomain, email)) {
				throw new BizError(t('noDomainPermAdd'),403)
			}

		}

		if (await settingService.isAddEmailVerify(c)) {
			await turnstileService.verify(c, token);
		}

		return orm(c).insert(account).values({ email: email, userId: userId, name: emailUtils.getName(email) }).returning().get();
	},

	selectByEmailIncludeDelNoCase(c, email) {
		return orm(c)
			.select()
			.from(account)
			.where(sql`${account.email} COLLATE NOCASE = ${email}`)
			.get();
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
			throw new BizError(t('delMyAccount'));
		}

		if (accountRow.userId !== user.userId) {
			throw new BizError(t('noUserAccount'));
		}

		await orm(c).update(account).set({ isDel: isDel.DELETE }).where(
			and(eq(account.userId, userId),
				eq(account.accountId, accountId)))
			.run();
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

	async physicsDeleteAll(c) {
		const accountIdsRow = await orm(c).select({accountId: account.accountId}).from(account).where(eq(account.isDel,isDel.DELETE)).limit(99);
		if (accountIdsRow.length === 0) {
			return;
		}
		const accountIds = accountIdsRow.map(item => item.accountId)
		await emailService.physicsDeleteAccountIds(c, accountIds);
		await orm(c).delete(account).where(inArray(account.accountId,accountIds)).run();
		if (accountIdsRow.length === 99) {
			await this.physicsDeleteAll(c)
		}
	},

	async physicsDeleteByUserIds(c, userIds) {
		await emailService.physicsDeleteUserIds(c, userIds);
		await orm(c).delete(account).where(inArray(account.userId,userIds)).run();
	},

	async selectUserAccountCountList(c, userIds, del = isDel.NORMAL) {
		const result = await orm(c)
			.select({
				userId: account.userId,
				count: count(account.accountId)
			})
			.from(account)
			.where(and(
				inArray(account.userId, userIds),
				eq(account.isDel, del)
			))
			.groupBy(account.userId)
		return result;
	},

	async countUserAccount(c, userId) {
		const { num } = await orm(c).select({num: count()}).from(account).where(and(eq(account.userId, userId),eq(account.isDel, isDel.NORMAL))).get();
		return num;
	},

	async restoreByEmail(c, email) {
		await orm(c).update(account).set({isDel: isDel.NORMAL}).where(eq(account.email, email)).run();
	},

	async restoreByUserId(c, userId) {
		await orm(c).update(account).set({isDel: isDel.NORMAL}).where(eq(account.userId, userId)).run();
	},

	async setName(c, params, userId) {
		const { name, accountId } = params
		if (name.length > 30) {
			throw new BizError(t('usernameLengthLimit'));
		}
		await orm(c).update(account).set({name}).where(and(eq(account.userId, userId),eq(account.accountId, accountId))).run();
	}
};

export default accountService;
