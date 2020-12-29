import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    data: [{
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
    ],
    geoCoordMap: {
      廊坊: [116.7, 39.53],
      菏泽: [115.480656, 35.23375],
      合肥: [117.27, 31.86],
      武汉: [114.31, 30.52],
      大庆: [125.03, 46.58],
      东京: [139.46, 35.42],
      上海: [121.43, 31.18],
      台北: [121.50, 25.05]
    }
  },
  getters: {
    getData (state) {
      return state.data
    },
    getGeoCoordMap (state) {
      return state.geoCoordMap
    }
  },
  mutations: {
    add100 (state, cityName) {
      var cityIndex = state.data.findIndex(ele => {
        return ele.name === cityName
      })
      state.data[cityIndex].value += 100
    },
    minus100 (state, cityName) {
      var cityIndex = state.data.findIndex(ele => {
        return ele.name === cityName
      })
      state.data[cityIndex].value -= 100
    }
  },
  actions: {
    add100Action (context, cityName) {
      context.commit('add100', cityName)
    },
    minus100Action (context, cityName) {
      context.commit('minus100', cityName)
    }

  }
})
