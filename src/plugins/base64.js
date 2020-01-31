import Vue from 'vue'
import btoa from 'btoa'
import atob from 'atob'

Vue.prototype.$btoa = (string) => btoa(string)
Vue.prototype.$atob = (string) => atob(string)
