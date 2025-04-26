import BizError from '../error/biz-error';
import constant from '../const/constant';
import jwtUtils from '../utils/jwt-utils';
import KvConst from '../const/kv-const';
import { userConst } from '../const/entity-const';
import dayjs from 'dayjs';

const exclude = [
	'/login',
	'/register',
	'/setting/query'
];

const adminPerm  = [
	'/setting/set'
]

const verify = async (c) => {

	if (c.req.path.startsWith('/test')) {
		return true
	}

	if (exclude.includes(c.req.path)) {
		return true;
	}

	const jwt = c.req.header(constant.TOKEN_HEADER);

	const result  = await jwtUtils.verifyToken(c, jwt)

	if (!result) {
		throw new BizError('身份认证失效,请重新登录',401)
	}

	const {userId, token} = result
	const authInfo = await c.env.kv.get(KvConst.AUTH_INFO + userId,{ type: 'json' });

	if (!authInfo) {
		throw new BizError('身份认证失效,请重新登录',401)
	}

	if(!authInfo.tokens.includes(token)) {
		throw new BizError('身份认证失效,请重新登录',401)
	}

	if (adminPerm.includes(c.req.path) && c.env.admin !== authInfo.user.email) {
		throw new BizError('权限不足',403)
	}

	if (dayjs().diff(dayjs(authInfo.createTime), 'day') >= 1) {
		authInfo.refreshTime = new Date().toISOString()
		await c.env.kv.put(KvConst.AUTH_INFO + userId, JSON.stringify(authInfo), { expirationTtl: constant.TOKEN_EXPIRE });
	}

	return true

};

export default verify;
