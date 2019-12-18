import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import theme from 'muse-ui/lib/theme';
import * as colors from 'muse-ui/lib/theme/colors';
// import 'typeface-roboto'
// import './scrollbar'

/**
 * muse 主题
 */
theme.add('custom-theme', {
  primary: '#009688',
  secondary: colors.pinkA200,
  background: {
    default: '#263238'
  }
});
theme.use('custom-theme');
Vue.use(MuseUI);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
