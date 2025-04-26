import { sqliteTable, text, integer} from 'drizzle-orm/sqlite-core';
export const setting = sqliteTable('setting', {
	register: integer('register').default(0).notNull(),
	receive: integer('receive').default(0).notNull(),
	title: text('title').default('').notNull(),
	manyEmail: integer('many_email').default(1).notNull(),
	addEmail: integer('add_email').default(0).notNull(),
	autoRefreshTime: integer('auto_refresh_time').default(0).notNull(),
	registerVerify: integer('register_verify').default(1).notNull(),
	addEmailVerify: integer('add_email_verify').default(1).notNull()
});
export default setting
