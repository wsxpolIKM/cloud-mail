import orm from '../entity/orm';
import { att } from '../entity/att';
import { and, eq } from 'drizzle-orm';

const attService = {
	async addAtt(c, params) {
		await orm(c).insert(att).values(params).run();
	},
	async list(c, params, userId) {
		const { emailId } = params;

		const list = await orm(c).select().from(att).where(
			and(
				eq(att.emailId, emailId),
				eq(att.userId, userId)))
			.all();

		return list;
	}
};

export default attService;
