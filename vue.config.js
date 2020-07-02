
const CompressionPlugin = require("compression-webpack-plugin");
module.exports = {
	publicPath: "/",
	lintOnSave: false,
	// outputDir:'wap',
	css: {
		
	},
	devServer: {
		proxy: {
			'/service': {
				target: 'http://183.129.170.180:4000/service',
				changeOrigin: true,
				pathRewrite: {//重写路径
					"^/service": ''
				}
			},
			
			'/arcgis':{
				target: 'http://183.129.170.180:6080/arcgis',
				secure: false,
				// 设置跨域
				changeOrigin: true,
				pathRewrite: {
					'^/arcgis': ''
				}
			}
		}
	},
	configureWebpack: config => {
		return {
			plugins: [
				new CompressionPlugin({
					test: /\.js$|\.html$|\.css/,
					threshold: 1024,
					deleteOriginalAssets: false
				})
			],
			externals: {
				'AMap': 'AMap'
			}
		}
	}
}
