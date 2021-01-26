<template>
  <main>
    <!-- <h2 id="map">
      <a href="#map">Map <small>(with GeoJSON &amp; image converter)</small></a>
      <button
        :class="{
          round: true,
          expand: expand.map
        }"
        @click="expand.map = !expand.map"
        aria-label="toggle"
      ></button>
    </h2> -->
    <section>
      <figure style="background-color: #0C1626;margin:0;padding:0;">
        <chart
          :options="map"
          :init-options="initOptions"
          :manualUpdate="true"
          ref="map"
          @click="updateCityInfo"
          autoresize
        />
      </figure>
    </section>
    <div id="leftHeader">
    </div>
    <div id="rightHeader">
    </div>
    <div id="cityInfo">
        <h4>港口详情</h4>
        <p id="cityName">{{cityInfo.cityName}}</p>
        <p id="cityValue">{{cityInfo.cityValue}}</p>
        <button @click="add100()">+ 100</button>
        <button @click="minus100()">- 100</button>
        <button @click="moveShip()">▶</button>
        <button @click="resetShipPosition()">reset</button>
    </div>
    <chart
      id="dataChart2"
      :options="dataChart2"
      :init-options="initOptions"
      :manualUpdate="true"
      ref="dataChart2"
      autoresize
    />
    <chart
      id="dataChart1"
      :options="dataChart1"
      :init-options="initOptions"
      :manualUpdate="true"
      ref="dataChart1"
      autoresize
    />

  </main>
</template>

<script>
/* eslint-disable no-console */
import qs from 'qs'
import ECharts from '../components/ECharts.vue'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/lines'
import 'echarts/lib/chart/map'
import 'echarts/lib/chart/effectScatter'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/geo'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/title'
import 'echarts/lib/component/visualMap'
import 'echarts/lib/component/dataset'
// import 'echarts/extension/bmap'
import 'echarts/extension/bmap/bmap'
import 'echarts/map/js/world'
import 'zrender/lib/svg/svg'

import 'echarts-liquidfill'
import getBar from './data/bar'
import pie from './data/pie'
import polar from './data/polar'
import scatter from './data/scatter'
// import map from './data/map'
import { c1, c2 } from './data/connect'
import store from './store'

// built-in theme
// import 'echarts/theme/dark'

// custom theme
import theme from './theme.json'

// Map of China
import chinaMap from './china.json'

// registering map data
ECharts.registerMap('china', chinaMap)

// registering custom theme
ECharts.registerTheme('ovilia-green', theme)

export default {
  components: {
    chart: ECharts
  },
  store,
  data () {
    const options = qs.parse(location.search, { ignoreQueryPrefix: true })
    return {
      options,
      bar: getBar(),
      dataChart2: {
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLine: {
            lineStyle: {
              color: '#43b7d6'
            }
          }
        },
        grid: {
          x: 35,
          y: 15,
          x2: 20,
          y2: 25
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#43b7d6'
            }
          }
        },
        series: [{
          data: [150, 230, 224, 218, 135, 147, 260],
          type: 'line'
        }]
      },
      cityInfo: {
        cityName: '上海',
        cityValue: 355
      },
      dataChart1: {
        legend: {
          width: '100',
          height: 'auto',
          padding: 0,
          align: 'left'
        },
        tooltip: {
          confine: true
        },
        grid: {
          x: 35,
          y: 15,
          x2: 20,
          y2: 25
        },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLine: {
            lineStyle: {
              color: '#43b7d6'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#43b7d6'
            }
          }
        },
        series: [{
          data: [120, 200, 150, 80, 70, 110, 130],
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        }]
      },
      pie,
      pointPositionArr: [
        [-20.56, 12.10, 123],
        [15.56, 4.10, 123],
        [55.56, 4.40, 123],
        [98.56, 15.40, 123]],
      planePath: 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z',
      polar,
      scatter,
      c1,
      c2,
      expand: {
        bar: true,
        pie: true,
        polar: true,
        scatter: true,
        map: true,
        radar: true,
        connect: true,
        flight: true
      },
      initOptions: {
        renderer: options.renderer || 'canvas'
      },
      polarTheme: 'dark',
      seconds: -1,
      asyncCount: false,
      connected: true,
      metricIndex: 0,
      open: false,
      img: {},
      flightLoaded: false,
      flightOptions: null,
      map: {
        backgroundColor: '#0C1626',
        title: {
          text: 'Maro 地图',
          padding: [25, 400],
          left: 'center',
          top: 0,
          textStyle: {
            fontSize: 52,
            color: '#43b7d6'
          }
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          y: 'bottom',
          x: 'right',
          data: ['pm3.5', 'Top 4'], // 修改数值以不显示 legend
          textStyle: {
            color: '#fff'
          }
        },
        geo: {
          map: 'world',
          show: true,
          center: [20.114129, 5.550339],
          zoom: 0.9,
          roam: 'move',
          label: {
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              areaColor: '#101F32',
              borderColor: '#43b7d6'
            },
            emphasis: {
              areaColor: '#2a333d'
            }
          }
          // regions: [{
          //   name: 'China',
          //   itemStyle: {
          //     areaColor: 'green',
          //     color: 'red'
          //   }
          // }]
        },
        series: [{
          name: 'pm2.5',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: this.convertData(this.$store.state.data),
          symbolSize: val => val[2] / 30,
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
          data: this.convertData(this.$store.state.data.sort((a, b) => b.value - a.value).slice(0, 6)),
          symbolSize: val => val[2] / 30,
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
        },
        {
          type: 'lines',
          coordinateSystem: 'geo',
          data: [{
            coords: [[121.43, 31.18, 100], [121.50, 25.05, 200]],
            lineStyle: {
              type: 'dashed',
              width: 1,
              color: 'red',
              curveness: 0.1,
              opacity: 0.6,
              animationEasing: 'linear',
              animationDuration: 1000
            }
          }, {
            // 台北 - 东京
            coords: [[121.50, 25.05, 200], [139.46, 35.42, 300]],
            lineStyle: {
              type: 'dashed',
              width: 1,
              color: 'red',
              curveness: 0.1,
              opacity: 0.6,
              animationEasing: 'linear',
              animationDuration: 1000
            }
          }, {
            // 东京 - 上海
            coords: [[139.46, 35.42, 300], [121.43, 31.18, 100]],
            lineStyle: {
              type: 'dashed',
              width: 1,
              color: 'red',
              curveness: 0.1,
              opacity: 0.6,
              animationEasing: 'linear',
              animationDuration: 1000
            }
          }, {
            // 台北 - 纽约
            coords: [[121.50, 25.05, 200], [-73.56, 40.40]],
            lineStyle: {
              type: 'dashed',
              width: 1,
              color: 'red',
              curveness: 0.4,
              opacity: 0.6,
              animationEasing: 'linear',
              animationDuration: 1000
            }
          }],
          // polyline: true,
          // effect: {
          //   show: true,
          //   period: 5,
          //   // symbol: 'image://http://ivens-zhang.top/ship.png',
          //   trailLength: 0.9,
          //   symbolSize: 15
          //   // symbol: this.planePath,
          // },
          // lineStyle: {
          //   type: 'dashed',
          //   width: 1,
          //   color: 'red',
          //   curveness: 0.1,
          //   opacity: 0.6,
          //   animationEasing: 'linear',
          //   animationDuration: 1000
          // },
          animation: false,
          // // silent: true,
          zlevel: 10
        }, {
          name: '',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: [{ name: '123', value: [-50.56, 25.40, 123] }],
          symbol: 'image://http://dreamoon.top/ship1.png',
          symbolSize: 18,
          itemStyle: {
            normal: {
              color: '#ddb926'
            }
          }
        }
        ]
      }
    }
  },
  computed: {
    scoreRadar () {
      return this.$store.getters.scoreRadar
    },
    metrics () {
      return this.$store.state.scores.map(({ name }) => name)
    },
    isMax () {
      const { value, max } = this.$store.state.scores[this.metricIndex]
      return value === max
    },
    isMin () {
      return this.$store.state.scores[this.metricIndex].value === 0
    }
  },
  methods: {
    resetShipPosition () {
      this.map.series[3].data[0].value = [-50.56, 25.40, 123]
      this.$refs.map.mergeOptions(this.map)
    },
    async moveShip () {
      for (const val of this.pointPositionArr) {
        await this.sleep(2000)
        await this.changeShipPosition(val)
      }
    },
    async changeShipPosition (newPosition) {
      this.map.series[3].data[0].value = newPosition
      this.$refs.map.mergeOptions(this.map)
    },
    // sleep time expects milliseconds
    sleep (time) {
      return new Promise((resolve) => setTimeout(resolve, time))
    },
    updateCityInfo (param) {
      console.log(param)
      this.$set(this.cityInfo, 'cityName', param.data.name)
      this.$set(this.cityInfo, 'cityValue', param.data.value[2])
    },
    convertData (data) {
      const res = []
      for (let i = 0; i < data.length; i++) {
        const geoCoord = this.$store.state.geoCoordMap[data[i].name]
        if (geoCoord) {
          res.push({
            name: data[i].name,
            value: geoCoord.concat(data[i].value)
          })
        }
      }
      console.log(res, 'res')
      return res
    },
    add100 () {
      this.$store.dispatch('add100Action', this.cityInfo.cityName)
      this.map.series[1].data = this.convertData(this.$store.state.data.sort((a, b) => b.value - a.value).slice(0, 6))
      this.cityInfo.cityValue += 100
      const { map } = this.$refs
      console.log(map)
    },
    minus100 () {
      this.$store.dispatch('minus100Action', this.cityInfo.cityName)
      this.map.series[1].data = this.convertData(this.$store.state.data.sort((a, b) => b.value - a.value).slice(0, 6))
      this.cityInfo.cityValue -= 100
    },
    handleClick () {
      console.log('click from echarts')
    },
    handleZrClick () {
      console.log('click from zrender')
    },
    refresh () {
      // simulating async data from server
      this.seconds = 3
      const bar = this.$refs.bar
      bar.showLoading({
        text: 'Loading…',
        color: '#4ea397',
        maskColor: 'rgba(255, 255, 255, 0.4)'
      })
      const timer = setInterval(() => {
        this.seconds--
        if (this.seconds === 0) {
          clearTimeout(timer)
          bar.hideLoading()
          this.bar = getBar()
        }
      }, 1000)
    },
    toggleRenderer () {
      if (this.initOptions.renderer === 'canvas') {
        this.initOptions.renderer = 'svg'
      } else {
        this.initOptions.renderer = 'canvas'
      }
    },
    increase (amount) {
      if (!this.asyncCount) {
        this.$store.commit('increment', { amount, index: this.metricIndex })
      } else {
        this.$store.dispatch('asyncIncrement', {
          amount,
          index: this.metricIndex,
          delay: 500
        })
      }
    },
    loadFlights () {
      this.flightLoaded = true

      const { flight } = this.$refs
      flight.showLoading({
        text: '',
        color: '#c23531',
        textColor: 'rgba(255, 255, 255, 0.5)',
        maskColor: '#003',
        zlevel: 0
      })
      import('./data/flight.json').then(({ default: data }) => {
        flight.hideLoading()

        function getAirportCoord (idx) {
          return [data.airports[idx][3], data.airports[idx][4]]
        }
        const routes = data.routes.map(function (airline) {
          return [getAirportCoord(airline[1]), getAirportCoord(airline[2])]
        })

        this.flightOptions = {
          title: {
            text: 'World Flights',
            left: 'center',
            textStyle: {
              color: '#eee'
            }
          },
          backgroundColor: '#003',
          tooltip: {
            formatter (param) {
              const route = data.routes[param.dataIndex]
              return (
                data.airports[route[1]][1] + ' > ' + data.airports[route[2]][1]
              )
            }
          },
          geo: {
            map: 'world',
            left: 0,
            right: 0,
            silent: true,
            itemStyle: {
              normal: {
                borderColor: '#003',
                color: '#005'
              }
            }
          },
          series: [
            {
              type: 'lines',
              coordinateSystem: 'geo',
              data: routes,
              large: true,
              largeThreshold: 100,
              lineStyle: {
                normal: {
                  opacity: 0.05,
                  width: 0.5,
                  curveness: 0.3
                }
              },
              // 设置混合模式为叠加
              blendMode: 'lighter'
            }
          ]
        }
      })
    }
  },
  watch: {
    connected: {
      handler (value) {
        ECharts[value ? 'connect' : 'disconnect']('radiance')
      },
      immediate: true
    },
    'initOptions.renderer' (value) {
      this.options.renderer = value === 'svg' ? value : undefined
      let query = qs.stringify(this.options)
      query = query ? '?' + query : ''
      history.pushState(
        {},
        document.title,
        `${location.origin}${location.pathname}${query}${location.hash}`
      )
    }
    // 'map.renderer' (value) {
    //   this.options.renderer = value === 'svg' ? value : undefined
    //   let query = qs.stringify(this.options)
    //   query = query ? '?' + query : ''
    //   history.pushState(
    //     {},
    //     document.title,
    //     `${location.origin}${location.pathname}${query}${location.hash}`
    //   )
    // }
    // 观察option的变化
    // map: {
    //   handler (newVal, oldVal) {
    //     if (this.chart) {
    //       if (newVal) {
    //         this.chart.setOption(newVal)
    //       } else {
    //         this.chart.setOption(oldVal)
    //       }
    //     } else {
    //       this.$refs.map.init()
    //     }
    //     console.log('123')
    //     this.updateCityInfo()
    //   },
    //   deep: true
    // }
  },
  mounted () {
    setTimeout(() => {
      this.$refs.dataChart1.resize()
    })
  }
}
</script>

<style lang="stylus">
#cityInfo {
    width: 300px;
    height: 170px;
    background-color: rgba(16,31,50,.3);
    border 1px solid #43b7d6;
    margin: 0;
    padding: 0;
    display: block;
    position: absolute;
    top: 250px;
    right: 20px;
    opacity: 50%;
    color: whitesmoke;
}
#dataChart2 {
  width: 200px;
  height: 170px;
  background-color: rgba(16,31,50,.3);
  margin: 0;
  padding: 0;
  display: block;
  position: absolute;
  bottom: 210px;
  left: 10px;
  opacity: 50%;
  color: whitesmoke;
  overflow: hidden;
}
#dataChart1 {
  width: 200px;
  height: 170px;
  background-color: rgba(16,31,50,.3);
  margin: 0;
  padding: 0;
  display: block;
  position: absolute;
  bottom: 40px;
  left: 10px;
  opacity: 50%;
  color: whitesmoke;
  overflow: hidden;
}
#leftHeader {
  z-index: 199;
  width: 950px;
  height: 30px;
  position: absolute;
  top: 5px;
  left: 0px;
  opacity: 30%;
  border-bottom: 70px solid blue;
  border-left: 0px solid transparent;
  border-right: 50px solid transparent;
  box-shadow: -50px 10px 58px #DDD;
}
#rightHeader {
  z-index: 199;
  width: 950px;
  height: 30px;
  position: absolute;
  top: 5px;
  right: 0px;
  opacity: 30%;
  border-bottom: 70px solid blue;
  border-left: 50px solid transparent;
  border-right: 0px solid transparent;
  box-shadow: 50px 10px 58px #DDD;
}
*,
*::before,
*::after
  box-sizing border-box

html
  scroll-behavior smooth

body
  margin 0
  font-family "Source Sans Pro", "Helvetica Neue", Arial, sans-serif
  color #666
  text-align center

a
  color inherit
  text-decoration none

h1
  margin-bottom 1em
  font-family Dosis, "Source Sans Pro", "Helvetica Neue", Arial, sans-serif

h1,
h2
  color #2c3e50
  font-weight 300

h2
  margin-top 2em
  padding-top 1em
  font-size 1.2em

  button
    margin-left 1em
    vertical-align middle

.desc
  margin-bottom 3em
  color #7f8c8d

h2 small
  opacity .7

p small
  font-size .8em
  color #7f8c8d

p
  line-height 1.5

pre
  display inline-block
  padding .8em
  background-color #f9f9f9
  box-shadow 0 1px 2px rgba(0,0,0,.125)
  line-height 1.1
  color #2973b7

pre,
code
  font-family "Roboto Mono", Monaco, courier, monospace

pre code
  font-size .8em

.attr
  color #e96900

.val
  color #42b983

footer
  margin 5em 0 3em
  font-size .5em
  vertical-align middle

  a
    display inline-block
    margin 0 5px
    padding 3px 0 6px
    color #7f8c8d
    font-size 2em
    text-decoration none

  a:hover
    padding-bottom 3px
    border-bottom 3px solid #42b983

button
  border 1px solid #4fc08d
  border-radius 2em
  background-color #fff
  color #42b983
  cursor pointer
  font inherit
  transition opacity .3s

  &:focus
    outline none
    box-shadow 0 0 1px #4fc08d

  &:active
    background rgba(79, 192, 141, .2)

  &[disabled]
    opacity .5
    cursor not-allowed

  &.round
    width 1.6em
    height 1.6em
    position relative

    &::before,
    &::after
      content ""
      position absolute
      top 50%
      left 50%
      transform translate(-50%, -50%)
      width 9px
      height 1px
      background-color #42b983

    &::after
      width 1px
      height 9px

    &.expand::after
      display none

button,
label
  font-size .75em

figure
  display inline-block
  position relative
  margin 2em auto
  border 1px solid rgba(0, 0, 0, .1)
  border-radius 8px
  box-shadow 0 0 45px rgba(0, 0, 0, .2)
  padding 1.5em 2em
  min-width: calc(40vw + 4em)

  .echarts
    width 100%
    min-width 400px
    height 300px

#logo
  display inline-block
  width 128px
  height 128px
  pointer-events none

.modal
  display none
  position fixed
  top 0
  right 0
  bottom 0
  left 0
  background-color rgba(0, 0, 0, .2)
  z-index 1

  &.open
    display block

  img
    position absolute
    top 50%
    left 50%
    transform translate(-50%, -50%)
    background-color #404a59
    max-width 80vw
    border 2px solid #fff
    border-radius 3px
    box-shadow 0 0 30px rgba(0, 0, 0, .2)

@media (max-width 9980px)
  p
    display flex
    justify-content center

    select
      text-indent calc(50% - 1em)

    select,
    label
      border 1px solid #4fc08d
      border-radius 2em
      background-color #fff
      color #42b983
      cursor pointer
      transition opacity .3s

    button,
    input,
    select,
    label
      flex 1 0
      margin 0 .5em
      padding 0
      line-height 2.4em
      max-width 40vw
      border-radius 2px
      font-size .8em

    select
      -webkit-appearance none

    input[type="checkbox"]
      display none

      &:checked + label
        background #42b983
        color #fff

  figure
    width 100%
    margin 1em auto
    border none
    border-radius 0
    box-shadow none

    .echarts
      width 100%
      min-width 0
      height 50vw

.renderer
  position fixed
  top 10px
  left 10px
  font-size 12px
  text-align center

  button
    float left
    position relative
    width 48px
    border-radius 4px

    &.active
      z-index 1
      background-color #4fc08d
      color #fff

    &:first-child
      border-top-right-radius 0
      border-bottom-right-radius 0

    &:last-child
      left -1px
      border-top-left-radius 0
      border-bottom-left-radius 0
</style>
