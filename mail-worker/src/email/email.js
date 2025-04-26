import PostalMime from 'postal-mime';
import emailService from '../service/email-service';
import accountService from '../service/account-service';
import { isDel } from '../const/entity-const';
import settingService from '../service/setting-service';
import attService from '../service/att-service';
import r2Service from '../service/r2-service';
import constant from '../const/constant';
import { v4 as uuidv4 } from 'uuid';
import fileUtils from '../utils/file-utils';

export async function email(message, env, ctx) {

	try {

		if (!await settingService.isReceive({ env })) {
			return;
		}

		const account = await accountService.selectByEmailIncludeDel({ env: env }, message.to);

		const reader = message.raw.getReader();
		let content = '';

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			content += new TextDecoder().decode(value);
		}

		const email = await PostalMime.parse(content);

		const params = {
			sendEmail: email.from.address,
			name: email.from.name,
			receiveEmail: message.to,
			subject: email.subject,
			content: email.html,
			text: email.text,
			userId: account.userId,
			accountId: account.accountId
		};

		const emailRow = await emailService.receive({ env }, params);


		if (email.attachments.length > 0) {

			let attachments = email.attachments.map(item => {
				let attachment = { ...item };
				attachment.emailId = emailRow.emailId;
				attachment.userId = emailRow.userId;
				attachment.accountId = emailRow.accountId;
				attachment.key = constant.ATTACHMENT_PREFIX + uuidv4() + fileUtils.getExtFileName(item.filename);
				attachment.size = item.content.length ?? item.content.byteLength;
				return attachment;
			});

			await attService.addAtt({ env }, attachments);

			if (!env.r2) {
				console.log('r2对象存储未配置, 附件取消保存');
				return;
			}

			for (let attachment of attachments) {
				await r2Service.putObj({ env }, attachment.key, attachment.content, {
					contentType: attachment.mimeType,
					contentDisposition: `attachment; filename="${attachment.filename}"`
				});
			}

		}
	} catch (e) {
		console.error('邮件接收异常: ', e);
	}
}
