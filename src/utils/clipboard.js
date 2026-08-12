/**
 * 复制文本到剪贴板
 *
 * navigator.clipboard 仅在安全上下文（HTTPS / localhost）可用，
 * 自建部署常以 HTTP 提供服务，故保留 execCommand 兜底。
 * @param {string} text - 待复制的文本
 * @returns {Promise<boolean>} 是否复制成功
 */
export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (e) {
      // 用户拒绝授权或接口不可用时继续尝试兜底方案
    }
  }

  return legacyCopyText(text)
}

function legacyCopyText(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  document.body.appendChild(textarea)

  try {
    textarea.select()
    return document.execCommand('copy')
  } catch (e) {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}
