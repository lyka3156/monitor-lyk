export default function getLines(stack) {
	if (!stack) return '';

	// 例子：
	// 替换前：
	// TypeError: Cannot read properties of undefined (reading 'name')\n
	// at handleError(http://10.165.224.123:8081/:17:40)\n
	// at HTMLButtonElement.onclick(http://10.165.224.123:8081/:12:37)
	// 替换后:
	// handleError (http://10.165.224.123:8081/:17:40)^HTMLButtonElement.onclick (http://10.165.224.123:8081/:12:37)

	// 以\n为分割符为数组，不要数组第一个，把其他项目的 at 替换空字符串，最后每一项用^链接成字符串
	return stack
		.split('\n')
		.slice(1)
		.map((item) => item.replace(/^\s+at\s+/g, ''))
		.join('^');
}
