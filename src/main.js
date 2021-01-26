// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/font.css'
import '@/assets/maro_ext.css'
/*
import HistogramSlider from "vue-histogram-slider";
import "vue-histogram-slider/dist/histogram-slider.css";

Vue.component(HistogramSlider.name, HistogramSlider);
*/
import {getLocalStorage, setLocalStorage, getObjectLocalStorage ,setObjectLocalStorage, removeLocalStorage}
from '../src/stroage/stroage.js'

import i18n from '@/plugins/i18n' // 导入vue-i18n

Vue.prototype.$getLocalStorage=getLocalStorage
Vue.prototype.$setLocalStorage=setLocalStorage
Vue.prototype.$getObjectLocalStorage=getObjectLocalStorage
Vue.prototype.$setObjectLocalStorage=setObjectLocalStorage
Vue.prototype.$removeLocalStorage=removeLocalStorage

Vue.config.productionTip = false
Vue.use(ElementUI);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  i18n,
  render: h => h(App),
  components: { App },
  template: '<App/>'
})
