import Vue from 'vue'
import {
  Autocomplete,
  Button,
  Card,
  Checkbox,
  Col,
  Container,
  Dialog,
  Divider,
  Form,
  FormItem,
  Input,
  Link,
  Loading,
  Message,
  MessageBox,
  Notification,
  Option,
  OptionGroup,
  Popover,
  Radio,
  Row,
  Select
} from 'element-ui'
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
