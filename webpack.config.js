const path = require('path');


module.exports ={
	entry:'./app/src/index.js',
	plugins: [
    ],
	output:{
		filename:'main.js',
		path:path.resolve(__dirname,'app/dist')
	},
	mode:"development",
	devtool: 'inline-source-map',
	devServer: {
    	contentBase: './app'
    },
    
	module:{
		rules:[{
			test:/\.css$/,
			use:[{
				loader:'style-loader'
			},{
				loader:'css-loader'
			}]
		},{
			test: /\.scss$/,
			use: [{
			  	loader: "style-loader" // 将 JS 字符串生成为 style 节点
			}, {
			  	loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
			}, {
			  	loader: "sass-loader" // 将 Sass 编译成 CSS
			}]
		}]
	}
}