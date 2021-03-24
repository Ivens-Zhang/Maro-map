const http = require('http');
const fs = require('fs'); //引入文件读取模块
const request = require('request');

// 设置侦听端口号
const port = 8081

// 需要访问的文件的存放目录
// 这里使用相对路径，匹配当前地图文件存放在前端项目中的情况。
let documentRoot = 'assets/map_';

let server = http.createServer((req, res) => {

		// 这里对 url 做了去除首字母的处理
		let url = req.url.substr(1);
		let language = req.url.split('/')[1]									// 语言
		let level = req.url.split('/')[2]											// 层级
		let horizontal = req.url.split('/')[3]								// 横坐标
		let vertical = req.url.split('/')[4].split('.')[0]		// 纵坐标
		// 地图层级超过本地已有的 6 级则转发 mapbox 在线数据
		if (level > 6) {
			if (language === 'en') {
				let opt = {
					uri: `https://api.mapbox.com/styles/v1/meroychen/ckiod6ao60b0p17sg086wtnb4/tiles/512/${level}/${horizontal}/${vertical}?access_token=pk.eyJ1IjoibWVyb3ljaGVuIiwiYSI6ImNraTc2NTR2ejRlNGQyeHJtc29jcTJ4ZXUifQ.xrCXPnyPfIuxHpXXdmcPMQ`,
					encoding: null
				}
				request(opt, (error, response, body) => {
					if (!error && response.statusCode == 200) {
						res.writeHead(200,{'Content-Type':'image/jpeg'});
						// console.log("body",body);
						res.end(body);
					} else if (error) {
						throw new Error('mapbox 获取失败')
					}
				})
			} else if (language === 'zh') {
				let opt = {
					uri: `https://api.mapbox.com/styles/v1/zhangy123/ckkessgis1ktq17oad1yky6sf/tiles/512/${level}/${horizontal}/${vertical}?access_token=pk.eyJ1Ijoiemhhbmd5MTIzIiwiYSI6ImNra2RyMGprczA1amsybnF0NmZmMjZ0MXcifQ.cFSvfTNV6AQKP4g2FmTL7w`,
					encoding: null
				}
				request(opt, (error, response, body) => {
					if (!error && response.statusCode == 200) {
						res.writeHead(200,{'Content-Type':'image/jpeg'});
						// console.log("body",body);
						res.end(body);
					} else if (error) {
						throw new Error('mapbox 获取失败')
					}
				})
			}
		} else {	// 不大于 6 级转发本地地图资源
			let file = documentRoot + url;	// flie 格式为：assets/map_zh/5/21/12.jpg
			fs.readFile(file, (err, data) => {
				if (err) {
					res.writeHeader(404, {
						'content-type': 'text/html;charset="utf-8"'
					});
					res.write('<h1>404错误</h1><p>你要找的页面不存在</p>');
					res.end();
				} else {
					res.writeHeader(200, {
					});
					res.write(data); //将index.html显示在客户端
					res.end();
				}
			});
		}
	}).listen(port);

console.log(`地图服务器开启成功，端口：${port}`);
