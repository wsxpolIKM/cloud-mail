import JwtUtils from '../utils/jwt-utils';
import constant from '../const/constant';

const userContext = {
	async getUserId(c) {
		const jwt = c.req.header(constant.TOKEN_HEADER);
		const { userId } = await JwtUtils.verifyToken(c, jwt);
		return Number(userId);
	},
	async getToken(c) {
		const jwt = c.req.header(constant.TOKEN_HEADER);
		const { token } = JwtUtils.verifyToken(c,jwt);
		return token;
	},
};
export default userContext;
