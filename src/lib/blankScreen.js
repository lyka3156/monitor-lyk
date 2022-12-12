/**
 * 监控白屏上报日志
 * 实现思路:
 * 1. 记录以哪些元素当作参考依据来代表现在是白屏的           TODO: 这个也可以用户去定义标准
 *      - 例如：刚开始页面就有html,body,#root
 * 2. 页面加载完成时，从页面中取 n 个点，判断这些点是否还在上面依据为空白的元素上面      TODO: n个点也可以用户去定义标准
 *      - 选取点的方式可以自己设置，
 *          - 例如：x , y轴 各取10个点      一个十字
 *          - 例如：x ，y轴 各取10个点，然后从左右角落下去再分别取10个点    +,x
 * 3. 初始化一个变量，来计算空白点的数量
 * 4. 空白点的数量大于一个临界值 (m) 就代表当前页面是白屏页面           TODO: 这个临界值也可以用户传入进来
 *      - 这个临界值可以自己设置
 * 5. 白屏日志上报
 */
import { onload, tracker, getSelector } from '../utils';

export function blankScreen() {
	// 1. 初始化依据为空白元素
	const blankWrapperSelectors = ['html', 'body', '#root'];

	// 3. 记录空白点
	let emptyPoints = 0;
	// 元素是否是空白元素包裹
	function isBlankWrapper(element) {
		// 获取当前点的元素: HTML BODY #root   ,  HTML BODY #root #btn3-1
		let selector = getSelector(element);

		// 通过空格分割，获取最后一个元素 HTML BODY #root  => #root
		const eleList = selector.split(' ');
		const insideEle = eleList.pop() || '';

		// 当前选中点的元素就是空白元素，空白点++
		if (blankWrapperSelectors.indexOf(insideEle.toLocaleLowerCase()) >= 0)
			emptyPoints++;
	}

	// 2. 页面加载完成时，从页面中取 n 个点，判断这些点是否还在上面依据为空白的元素上面
	onload(function () {
		// 初始化 x ， y 轴坐标点的元素
		let xElements, yElements;
		for (let i = 1; i <= 9; i++) {
			// x 点元素
			xElements = document.elementsFromPoint(
				(window.innerWidth * i) / 10,
				window.innerHeight / 2
			);
			// y 点元素
			yElements = document.elementsFromPoint(
				window.innerWidth / 2,
				(window.innerHeight * i) / 10
			);
			// 记录空白元素
			isBlankWrapper(xElements[0]);
			isBlankWrapper(yElements[0]);
		}
		// 4. 空白点大于 0 代表在页面中选取的坐标点元素有空白的地方，就代表现在还是白屏的
		console.log('空白点：', emptyPoints);
		if (emptyPoints >= 0) {
			let centerElements = document.elementsFromPoint(
				window.innerWidth / 2,
				window.innerHeight / 2
			);
			// 5. 白屏日志上报
			tracker.send({
				kind: 'stability', // 大类
				type: 'blank', // 小类
				emptyPoints, // 空白点
				screen: window.screen.width + 'x' + window.screen.height, // 分辨率
				viewPoint: window.innerWidth + 'x' + window.innerHeight, // 视口
				selector: getSelector(centerElements[0]), // 选择器
			});
		}
	});
}
