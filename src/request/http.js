import axios from "axios";
import router from "../router";
import store from "../store";
import { Message } from "view-design";
const tip = msg => {
	Message({ message: msg, type: 'danger' })
};
const tip2 = msg => {
	Message({ message: msg, type: 'success' })
};
const toLogin = () => {
	localStorage.removeItem('STOKEN')
	router.replace({
		path: "/",
	});
};
const errorHandle = (status, other) => {

	switch (status) {
		case '0':
			tip2('登录成功')
			break;
		case '600000':
			tip('登录过期')
			toLogin();
			break;
		case '600001':
			tip("用户名或密码错误");
			break;
		default:
			tip(other);
			break;
	}
};
var instance = axios.create({
	timeout: 1000 * 12
});
instance.defaults.headers.post["Content-Type"] = "application/json";
// 请求拦截器
instance.interceptors.request.use(
	config => {
		const requestToken = localStorage.getItem("STOKEN");
		if (requestToken) {
			if (
				config.data == "" ||
				config.data == null ||
				config.data == undefined
			) {
				
				if (config.params) {
					config.params["requestToken"] = requestToken; // get请求
				} else {
					config.params = {};
					config.params["requestToken"] = requestToken;
					
				}
				
				return config;
			} else {
				
					config.data["requestToken"] = requestToken; //post请求
				

				return config;
			}
		} else {
			return config;
		}
	},
	error => Promise.error(error)
);
// 响应拦截器
instance.interceptors.response.use(res => {


	if (res.data.resultCode == 0) {
		return Promise.resolve(res.data);
	} else {
		errorHandle(res.data.resultCode, res.data.resultMessage);
		return Promise.reject(res.data);
	}


});
export default instance;
