import { getRuntimeConfig } from './runtime'

const env = import.meta.env

/** 接受裸域名、/sub 或 /sub? 形式，统一生成后端转换地址。 */
function toBackendUrl(value) {
  if (!value) return ''
  const base = value.replace(/\/+$/, '')
  if (/\/sub(\?.*)?$/.test(base)) return base
  return base + '/sub?'
}

export const CONSTANTS = {
  PROJECT: getRuntimeConfig('VITE_PROJECT', env.VITE_PROJECT),
  REMOTE_CONFIG_SAMPLE: getRuntimeConfig('VITE_SUBCONVERTER_REMOTE_CONFIG', env.VITE_SUBCONVERTER_REMOTE_CONFIG),
  DOC_ADVANCED: getRuntimeConfig('VITE_SUBCONVERTER_DOC_ADVANCED', env.VITE_SUBCONVERTER_DOC_ADVANCED),
  BACKEND_RELEASE: getRuntimeConfig('VITE_BACKEND_RELEASE', env.VITE_BACKEND_RELEASE),
  DEFAULT_BACKEND: toBackendUrl(getRuntimeConfig('VITE_SUBCONVERTER_DEFAULT_BACKEND', env.VITE_SUBCONVERTER_DEFAULT_BACKEND)),
  SHORT_URL_API: getRuntimeConfig('VITE_MYURLS_API', env.VITE_MYURLS_API),
  CONFIG_UPLOAD_API: getRuntimeConfig('VITE_CONFIG_UPLOAD_API', env.VITE_CONFIG_UPLOAD_API),
  BOT_LINK: getRuntimeConfig('VITE_BOT_LINK', env.VITE_BOT_LINK),
  USE_STORAGE: getRuntimeConfig('VITE_USE_STORAGE', env.VITE_USE_STORAGE) === 'true',
  CACHE_TTL: Number(getRuntimeConfig('VITE_CACHE_TTL', env.VITE_CACHE_TTL)) || 3600,
  DEFAULT_CLIENT_TYPE: 'clash',
  BUTTON_WIDTH: '140px',
  LARGE_BUTTON_WIDTH: '290px'
};
