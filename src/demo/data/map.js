// import vECharts from 'vue-echarts'
// import ECharts from 'echarts'
const data = [{
  name: '廊坊',
  value: 193
},
{
  name: '菏泽',
  value: 194
},
{
  name: '合肥',
  value: 229
},
{
  name: '武汉',
  value: 273
},
{
  name: '大庆',
  value: 279
},
{
  name: '东京',
  value: 319
},
{
  name: '上海',
  value: 355
},
{
  name: '台北',
  value: 279
}
]
const geoCoordMap = {
  廊坊: [116.7, 39.53],
  菏泽: [115.480656, 35.23375],
  合肥: [117.27, 31.86],
  武汉: [114.31, 30.52],
  大庆: [125.03, 46.58],
  东京: [139.46, 35.42],
  上海: [121.43, 31.18],
  台北: [121.50, 25.05]
}

function convertData (data) {
  const res = []
  for (let i = 0; i < data.length; i++) {
    const geoCoord = geoCoordMap[data[i].name]
    if (geoCoord) {
      res.push({
        name: data[i].name,
        value: geoCoord.concat(data[i].value)
      })
    }
  }
  return res
}

export default {
  backgroundColor: '#404a59',
  title: {
    text: 'Maro 地图',
    left: 'center',
    textStyle: {
      color: '#fff'
    }
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    y: 'bottom',
    x: 'right',
    data: ['pm2.5'],
    textStyle: {
      color: '#fff'
    }
  },
  geo: {
    map: 'world',
    center: [124.114129, 37.550339],
    zoom: 5,
    label: {
      emphasis: {
        show: false
      }
    },
    itemStyle: {
      normal: {
        areaColor: 'gray',
        borderColor: '#111'
      },
      emphasis: {
        areaColor: '#2a333d'
      }
    }
  },
  series: [{
    name: 'pm2.5',
    type: 'scatter',
    coordinateSystem: 'geo',
    data: convertData(data),
    symbolSize: val => val[2] / 10,
    tooltip: {
      formatter: function (val) {
        return val.name + ': ' + val.value[2]
      }
    },
    itemStyle: {
      normal: {
        color: '#ddb926'
      }
    }
  },
  {
    name: 'Top 5',
    type: 'effectScatter',
    coordinateSystem: 'geo',
    data: convertData(data.sort((a, b) => b.value - a.value).slice(0, 6)),
    symbolSize: val => val[2] / 10,
    showEffectOn: 'render',
    rippleEffect: {
      brushType: 'stroke'
    },
    hoverAnimation: true,
    tooltip: {
      formatter: function (val) {
        return val.name + ': ' + val.value[2]
      }
    },
    label: {
      normal: {
        formatter: '{b}',
        position: 'right',
        show: true
      }
    },
    itemStyle: {
      normal: {
        color: '#f4e925',
        shadowBlur: 10,
        shadowColor: '#333'
      }
    },
    zlevel: 1
  }]
}
