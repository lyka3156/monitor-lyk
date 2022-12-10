const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const resolvePath = (p) => path.resolve(__dirname, p);

// npm i webpack webpack-cli html-webpack-plugin webpack-dev-server user-agent -D
// 导出webpack配置信息
module.exports = {
	mode: 'development', // 开发模式
	context: process.cwd(), // 工作目录
	entry: './src/index.js', // 入口文件
	output: {
		path: resolvePath('dist'), // 输出目录
		filename: 'monitor.js', // 输出文件名
	},
	// 开发服务器
	devServer: {
		// 运行代码的目录   老版写法: 		contentBase: resolvePath('dist'),
		static: {
			directory: resolvePath('dist'),
		},
		open: true
	},
	// 配置插件
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html', // 模板html文件
			filename: 'index.html', // 打包之后的文件名称
			// 在head头部插入打包之后的资源
			inject: 'head',
			// HtmlWebpackPlugin版本5，  默认defer: 加了该属性的script，脚本会在文档渲染完毕后，DOMContentLoaded事件调用前执行
			scriptLoading: "blocking", 	// 加载的脚本默认是defer，  设置blocking同步加载js，不然捕获不到资源错误   ******	
		}),
	],
};
