import Vue from 'vue'
import axios from "axios"

axios.defaults.timeout = 5000 //请求超时的时间设定

Vue.prototype.$axios = axios