import SvgIcon from '@/components/SvgIcon/index.vue'// svg component

// register globally
export function setupIcons(app) {
  app.component('svg-icon', SvgIcon)
}
