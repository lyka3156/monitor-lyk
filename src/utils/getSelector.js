// 转换前： 将[button事件对象, body事件对象, html事件对象, document事件对象, Window事件对象]
// 转换后： "HTML BODY Button"
const getSelectorByPath = (path) => {
	// 1. 数组反转   从 window > document > html排序
	path = path.reverse();
	// 2. 过滤掉window和document对象
	path = path.filter((ele) => ele !== window && ele !== document);
	// 3. 将元素数组对象封装成字符串
	const result = path
		.map(function (ele) {
			const { id, className, nodeName } = ele;
			// id标签       a => #a
			if (id) return `#${id}`;
			// class标签        a  b  c  => .a.b.c
			if (className && typeof className === 'string') {
				return (
					'.' +
					className
						.split(' ')
						.filter((item) => !!item) // 去除空
						.join('.')
				);
			}
			// 普通标签
			return nodeName;
		})
		.join(' ');
	return result;
};

/**
 * 将元素对象或者元素对象数组封装成字符串的格式
 * @param {Object|Array} pathsOrTarget
 * @returns {String}
 */
export default function getSelector(pathsOrTarget) {
	// 1. 是一个元素对象数组
	if (Array.isArray(pathsOrTarget)) {
		return getSelectorByPath(pathsOrTarget);
	} else {
		// 2. 单个元素对象
		const paths = [];
		let element = pathsOrTarget;
		// 遍历找它的父级元素，形成一条元素对象数组
		while (element) {
			paths.push(element);
			element = element.parentNode;
		}
		return getSelectorByPath(paths);
	}
}
