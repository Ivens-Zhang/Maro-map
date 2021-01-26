import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

const i18n = new VueI18n({
      // 使用localStorage存储语言状态是为了保证页面刷新之后还是保持原来选择的语言状态
    locale: localStorage.getItem('lang') ? localStorage.getItem('lang') : 'zh', // 定义默认语言为中文 
    messages: {
        'zh': require('@/assets/languages/zh.json'),
        'en': require('@/assets/languages/en.json')
    }
})

export default i18n