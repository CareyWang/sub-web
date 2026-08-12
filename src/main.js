import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupElementPlus } from '@/plugins/element-plus'
import { setupAxios } from '@/plugins/axios'
import { setupDevice } from '@/plugins/device'

import { setupIcons } from '@/icons' // icon

const app = createApp(App)

setupElementPlus(app)
setupAxios(app)
setupDevice(app)
setupIcons(app)

app.use(router)
app.mount('#app')
