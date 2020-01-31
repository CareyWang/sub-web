import Vue from 'vue'
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/zh-CN'
// import '@/assets/css/element-ui.scss'
// import '@/assets/css/element-element-variables.scss'

Vue.use(Element, {
    locale,
    size: 'small'
})

Vue.use(Element.Loading.directive);

Vue.prototype.$loading = Element.Loading.service;
Vue.prototype.$msgbox = Element.MessageBox;
Vue.prototype.$alert = Element.MessageBox.alert;
Vue.prototype.$confirm = Element.MessageBox.confirm;
Vue.prototype.$prompt = Element.MessageBox.prompt;
Vue.prototype.$notify = Element.Notification;
Vue.prototype.$message = Element.Message;
