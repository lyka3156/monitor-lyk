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
		open: true,	// 自动打开浏览器
		// // 注册before钩子	
		// webpack5 写法	
		setupMiddlewares: (middlewares, devServer) => {
			if (!devServer) throw new Error('webpack-dev-server is not defined');
			// express 写法			
			// 注册/success路由			访问	/success
			devServer.app.get('/success', function (req, res) {
				res.json({ id: 1 });		// 响应成功
			});
			// 注册/error路由			访问	/error
			devServer.app.post('/error', function (req, res) {
				res.sendStatus(500);		// 响应失败
			});
			return middlewares
		},

	},
	// 配置插件
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html', // 模板html文件
			filename: 'index.html', // 打包之后的文件名称
			// 在head头部插入打包之后的资源
			inject: 'head',
			// HtmlWebpackPlugin版本5，  添加了 scriptLoading 属性配置
			// https://www.npmjs.com/package/html-webpack-plugin	scriptLoading
			// {'blocking'|'defer'|'module'} 支持3个配置，默认defer,异步加载（脚本会在文档渲染完毕后，DOMContentLoaded事件调用前执行）
			scriptLoading: "blocking", 	// 设置blocking同步加载js，不然捕获不到资源错误   ******	
		}),
	],
};
