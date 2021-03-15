const fs = require('fs'); //引入文件读取模块
const request = require('request');

// ================== Config =========================================
// 图片保存到的地址
const dir = `assets/map_en`
// 爬取层级, 每级的横纵块数
const level = 6
// 地图配置相关
let imgUrlRoot = `https://api.mapbox.com/styles/v1/meroychen/ckiod6ao60b0p17sg086wtnb4/tiles/512`
const token = `pk.eyJ1IjoibWVyb3ljaGVuIiwiYSI6ImNraTc2NTR2ejRlNGQyeHJtc29jcTJ4ZXUifQ.xrCXPnyPfIuxHpXXdmcPMQ`
// ================== Config =========================================

// 错误处理
const catchErr = err => {
  if (err) throw err;
}

// 三层循环（x、y、z轴）爬取地图
for (let levelTemp = 1; levelTemp <= level; levelTemp ++) {
  // 创建对应深度文件夹
  fs.mkdirSync(`${dir}/${levelTemp}`, catchErr)
  // 在瓦片地图中每个深度的横轴、纵轴数量相等，数量为 2^(深度数)
  const horizontalNum = Math.pow(2, levelTemp) -1

  for (let horizontal = 0; horizontal <= horizontalNum; horizontal ++ ) {
    // 创建对应横轴文件夹
    fs.mkdirSync(`${dir}/${levelTemp}/${horizontal}`, catchErr)
    const verticalNum = Math.pow(2, levelTemp) -1

    for ( let vertical = 0; vertical <= verticalNum; vertical ++) {
      // 创建对应纵轴文件夹
      const imgUrl = `${imgUrlRoot}/${levelTemp}/${horizontal}/${vertical}?access_token=${token}`

      // 利用 request 获取图片，在管道中创建文件写入流
      request(imgUrl).pipe(fs.createWriteStream(`${dir}/${levelTemp}/${horizontal}/${vertical}.jpg`));
    }
  }
}

console.log(`is Downloading map`);
