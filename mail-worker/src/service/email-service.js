import orm from '../entity/orm';
import email from '../entity/email';
import { isDel } from '../const/entity-const';
import { and, desc, eq, gt, inArray, lt, sql } from 'drizzle-orm';
import { star } from '../entity/star';

const emailService = {

	async list(c, params, userId) {

		let { emailId, accountId, size } = params;
		size = Number(size);
		emailId = Number(emailId);

		if (size > 30) {
			size = 30;
		}

		if (!emailId) {
			emailId = 9999999999;
		}

		const list = await orm(c)
			.select({
				...email,
				starId: star.starId
			})
			.from(email)
			.leftJoin(
				star,
				and(
					eq(star.emailId, email.emailId),
					eq(star.userId, userId)
				)
			)
			.where(
				and(
					lt(email.emailId, emailId),
					eq(email.accountId, accountId),
					eq(email.userId, userId),
					eq(email.isDel, isDel.NORMAL)
				)
			)
			.orderBy(desc(email.emailId))
			.limit(size)
			.all();

		const resultList = list.map(item => ({
			...item,
			isStar: item.starId != null ? 1 : 0
		}));

		return { list: resultList };
	},

	async delete(c, params, userId) {
		const { emailIds } = params;
		const emailIdList = emailIds.split(',').map(Number);
		await orm(c).update(email).set({ isDel: isDel.DELETE }).where(
			and(
				eq(email.userId, userId),
				inArray(email.emailId, emailIdList)))
			.run();
	},

	receive(c, params) {
		return orm(c).insert(email).values({ ...params }).returning().get();
	},

	async removeByAccountId(c, accountId) {
		await orm(c).update(email)
			.set({ isDel: isDel.DELETE })
			.where(eq(email.accountId, accountId))
			.run();
	},

	async removeByUserId(c, userId) {
		await orm(c).update(email).set({ isDel: isDel.DELETE }).where(eq(email.userId, userId)).run();
	},
	selectById(c, emailId) {
		return orm(c).select().from(email).where(
			and(eq(email.emailId, emailId),
				eq(email.isDel, isDel.NORMAL)))
			.get();
	},

	latest(c, params, userId) {
		let { emailId,accountId } = params;
		return orm(c).select().from(email).where(
			and(
				eq(email.userId, userId),
				eq(email.isDel, isDel.NORMAL),
				eq(email.accountId, accountId),
				gt(email.emailId, emailId)
			))
			.orderBy(desc(email.emailId))
			.limit(20);
	}

};

export default emailService;
