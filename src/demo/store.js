import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    data: [{
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
    },
    {
      name: '纽约',
      value: 289
    }
    ],
    geoCoordMap: {
      东京: [139.46, 35.42],
      上海: [121.43, 31.18],
      台北: [121.50, 25.05],
      纽约: [-73.56, 40.40]
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
