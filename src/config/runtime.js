const runtimeConfig =
  typeof window !== 'undefined' && window.__SUB_WEB_CONFIG__
    ? window.__SUB_WEB_CONFIG__
    : {}

/** 读取容器启动时注入的配置，未设置时回退到构建时环境变量。 */
export function getRuntimeConfig(key, fallback = '') {
  const value = runtimeConfig[key]
  return value === undefined || value === null || value === '' ? fallback : value
}
