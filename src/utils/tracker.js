const userAgent = require('user-agent');

// 额外数据
function getExtraData() {
	return {
		title: document.title, // 页面标题
		url: location.href, // 访问url
		timestamp: Date.now(), //访问时间戳
		userAgent: userAgent.parse(navigator.userAgent).name, // 用户浏览器类型

		// :TODO 这里可以加入一些token或者登录的用户名好去排查问题
		token: 'token111',
		userName: 'lyk111',
	};
}

// 跟踪类   向服务器发送埋点日志信息
// https://sls.console.aliyun.com/lognext/profile
// 阿里云的日志服务配置信息
// https://help.aliyun.com/document_detail/29008.html?spm=a2c4g.11186623.0.0.6f963341feXc3W     查看host域名
const host = 'cn-shanghai.log.aliyuncs.com'; // 你选择的所属区域的host域名   选择离你最近的区域
// 华东2(北京) cn-beijing.log.aliyuncs.com
// 华东2(上海) cn-shanghai.log.aliyuncs.com
const project = 'lykmonitor'; // 项目名
const logstore = 'lykmonitor-store'; // 仓库名
class Tracker {
	constructor() {
		//  https://help.aliyun.com/document_detail/120218.html  向Webtracking插入数据
		// 请求实例:
		// POST /logstores/lykmonitor-store/track HTTP/1.1         =>  lykmonitor-store => logstore
		// Host: lykmonitor.cn-shanghai.log.aliyuncs.com       => project + '.' + host
		// Content-Type:application/json        请求头类型
		this.url = `http://${project}.${host}/logstores/${logstore}/track`; // 阿里云日志服务接口地址

		// https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest
		this.xhr = new XMLHttpRequest();
	}
	send(data = {}, callback) {
		// 获取额外数据
		const extraData = getExtraData();
		// 拼接额外数据和传入的数据
		const logs = { ...extraData, ...data };

		// 阿里云日志服务，值不能是数字，需要转换成字符串
		for (let key in logs) {
			if (typeof logs[key] === 'number') {
				logs[key] = '' + logs[key];
			}
		}
		// 将数据转换成阿里云需要的json字符串格式
		let body = JSON.stringify({
			__topic__: 'lyk_app', // 日志主题
			__source__: 'app', // 日志来源
			__logs__: [logs], // 日志内容列表
		});

		// 初始化一个请求
		this.xhr.open('POST', this.url, true);

		// 设置 HTTP 请求头的值。必须在 open() 之后、send() 之前调用 setRequestHeader() 方法
		// 设置请求体类型为json格式
		this.xhr.setRequestHeader(
			'Content-Type',
			'application/json;charset=UTF-8'
		);
		// 阿里云日志服务必须要着两个请求头
		this.xhr.setRequestHeader('x-log-apiversion', '0.6.0'); // 日志版本
		this.xhr.setRequestHeader('x-log-bodyrawsize', body.length); // 请求体大小

		// 请求完成 https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
		this.xhr.addEventListener('load', function () {
			// console.log(111, this.status, this.readyState, this.responseText);
			if (
				(this.status >= 200 && this.status <= 300) ||
				this.status == 304
			) {
				console.log('日志上报成功!', logs);
				callback && callback();
			}
		});
		// 请求失败
		this.xhr.addEventListener('error', function (error) {
			console.log('日志上报失败!', error);
		});

		// 发送请求。如果请求是异步的（默认），那么该方法将在请求发送后立即返回。
		this.xhr.send(body);
	}
}

export default new Tracker();
