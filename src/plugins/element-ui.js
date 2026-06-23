import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
// 按路径引入组件，避免命中 element-ui 入口的完整 CommonJS 包（1.2MB），保证按需打包生效
import Autocomplete from 'element-ui/lib/autocomplete'
import Button from 'element-ui/lib/button'
import Card from 'element-ui/lib/card'
import Checkbox from 'element-ui/lib/checkbox'
import Col from 'element-ui/lib/col'
import Container from 'element-ui/lib/container'
import Dialog from 'element-ui/lib/dialog'
import Divider from 'element-ui/lib/divider'
import Form from 'element-ui/lib/form'
import FormItem from 'element-ui/lib/form-item'
import Input from 'element-ui/lib/input'
import Link from 'element-ui/lib/link'
import Loading from 'element-ui/lib/loading'
import Message from 'element-ui/lib/message'
import MessageBox from 'element-ui/lib/message-box'
import Notification from 'element-ui/lib/notification'
import Option from 'element-ui/lib/option'
import OptionGroup from 'element-ui/lib/option-group'
import Popover from 'element-ui/lib/popover'
import Radio from 'element-ui/lib/radio'
import Row from 'element-ui/lib/row'
import Select from 'element-ui/lib/select'
import lang from 'element-ui/lib/locale/lang/zh-CN'
import locale from 'element-ui/lib/locale'

locale.use(lang)

Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 }

Vue.use(Row)
Vue.use(Col)
Vue.use(Card)
Vue.use(Container)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Radio)
Vue.use(Input)
Vue.use(Select)
Vue.use(Option)
Vue.use(OptionGroup)
Vue.use(Autocomplete)
Vue.use(Button)
Vue.use(Checkbox)
Vue.use(Popover)
Vue.use(Link)
Vue.use(Divider)
Vue.use(Dialog)

Vue.use(Loading.directive)

Vue.prototype.$loading = Loading.service
Vue.prototype.$msgbox = MessageBox
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$notify = Notification
Vue.prototype.$message = Message
