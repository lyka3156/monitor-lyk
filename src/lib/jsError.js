// -   JS 错误
//     -   JS 错误		监听error
//     -   Promise 异常	监听unhandledrejection
// -   资源异常			监听error

import { getLines, getLastEvent, getSelector, tracker } from '../utils';
export function injectJsError() {
	// 1. 一般JS运行时错误使用window.onerror捕获处理
	window.addEventListener('error',
		function (event) {
			// console.log('错误对象:', event);
			// 判断是否是资源加载错误
			const isResoureError = event.target && (event.target.src || event.target.href)

			// （1） js 报错
			if (!isResoureError) {
				// 1. 获取最后一个埋点的事件对象
				const lastEvent = getLastEvent();

				// 2. 解构错误信息对象
				const { lineno = 0, colno = 0, message, filename, error } = event;

				// 3. 封装需要上报的日志对象信息
				const log = {
					kind: 'stability', // 大类  stability: 稳定性
					type: 'error', // 小类
					errorType: 'jsError', // JS错误类型
					message, //类型详情
					filename, //访问的文件名
					position: `${lineno}:${colno}`, //行列信息
					stack: getLines(error.stack), //堆栈信息
					selector: getSelector(lastEvent.path || lastEvent.target), // 选择器    HTML BODY #container .content INPUT
				};

				// 4. 日志上报
				tracker.send(log);
			} else {
				//（3）	资源异常
				// 1. 获取最后一个埋点的事件对象
				const lastEvent = getLastEvent();

				// 2. 解构错误信息对象
				const { target, path } = event;

				// 3. 封装需要上报的日志对象信息
				const log = {
					kind: 'stability', // 大类  stability: 稳定性
					type: 'error', // 小类
					errorType: 'resourceError', // JS错误类型
					filename: target.src || target.href,//加载失败的资源
					tagName: target.tagName, // 标签名
					selector: getSelector(path || target), // 选择器    HTML BODY #container .content INPUT
				};


				// 4. 日志上报
				tracker.send(log);
			}
		},
		true // true代表在捕获阶段调用
	);

	// （2）. 监听promise错误日志上报
	// 触发条件：
	// promise里面的语法错误 / reject()抛出的错误，状态是rejected状态，
	// 后续没有通过then的失败回调或者catch去捕获错误就会触发此监听函数
	window.addEventListener('unhandledrejection', function (event) {
		// 1. 获取最后一个埋点的事件对象
		const lastEvent = getLastEvent();

		// 2. 初始化日志需要收集的信息
		let message = ''; // 错误信息
		let lineno = 0; // 行
		let colno = 0; // 列
		let filename = ''; // 文件名
		let stack = ''; // 栈

		let reason = event.reason;

		// 2.1 获取错误message
		// 1. 如果reason是字符串，promise手动reject抛出的字符串     reject("错误")
		if (typeof reason === 'string') {
			message = reason;
		} else if (typeof reason === 'object') {
			// 2. 如果reason是object，promise里面语法错误       js语法错误/reject(`js语法错误`)
			message = reason.message;
		}

		// 2.2 将js语法错误的错误信息给提取出来
		if (typeof reason === 'object') {
			stack = reason.stack;
			if (stack) {
				// 使用正则从错误栈中匹配一些信息
				var matchResult = stack.match(/at\s+(.+):(\d+):(\d+)/);
				if (matchResult) {
					filename = matchResult[1];
					lineno = matchResult[2];
					colno = matchResult[3];
				}
				stack = getLines(`${stack}`);
			}
		}
		// 3. 封装需要上报的日志对象信息
		const log = {
			kind: 'stability', // 大类  stability: 稳定性
			type: 'error', // 小类
			errorType: 'promiseError', // promise错误类型
			message, //类型详情
			filename, //访问的文件名
			position: `${lineno}:${colno}`, //行列信息
			stack, //堆栈信息
			selector: getSelector(lastEvent.path || lastEvent.target), // 选择器    HTML BODY #container .content INPUT
		};
		// 4. 日志上报
		tracker.send(log);
	});
}
