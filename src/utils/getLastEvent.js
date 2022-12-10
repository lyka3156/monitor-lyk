// 初始化最后埋点的事件对象
let lastEvent;

// 监控要埋点的事件类型
const eventTypes = [
	'click',
	'pointerdown',
	'touchstart',
	'mousedown',
	'keydown',
	'mouseover',
];

// 遍历埋点的事件类型，获取最后一个埋点的事件对象
eventTypes.forEach((event) => {
	document.addEventListener(
		event,
		(event) => {
			lastEvent = event;
		},
		{
			capture: true, // capture 控制监听器是在捕获阶段执行还是在冒泡阶段执行
			passive: true, // passive 的意思是顺从的，表示它不会对事件的默认行为说 no
		}
	);
});
// 返回最后一个埋点的对象
export default function getLastEvent() {
	return lastEvent;
}
