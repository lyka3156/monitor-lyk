/**
 * 监听load事件: 页面资源加载完成触发
 * @param {*} callback
 */
export default function onload(callback) {
	if (document.readyState === 'complete') {
		callback();
	} else {
		window.addEventListener('load', callback);
	}
}
