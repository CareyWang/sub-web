import axios from "axios"

axios.defaults.timeout = 5000 //请求超时的时间设定

export function setupAxios(app) {
  app.config.globalProperties.$axios = axios
}
