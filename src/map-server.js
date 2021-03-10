const http = require('http');
const fs = require('fs'); //引入文件读取模块

// 设置侦听端口号
const port = 8081

// 需要访问的文件的存放目录
// 这里使用相对路径，匹配当前地图文件存放在前端项目中的情况。
let documentRoot = 'assets/map_';

let server = http.createServer((req, res) => {

		// 这里对 url 做了去除首字母的处理
		let url = req.url.substr(1);
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
	}).listen(port);

console.log(`地图服务器开启成功，端口：${port}`);
