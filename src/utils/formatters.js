/**
 * 格式化错误消息
 * @param {Error|string} error - 错误对象或字符串
 * @returns {string} 格式化后的错误消息
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return "操作失败，请重试";
};

/**
 * 清理版本信息格式
 * @param {string} version - 原始版本信息
 * @returns {string} 清理后的版本信息
 */
export const formatVersion = (version) => {
  let cleaned = version.replace(/backend\n$/gm, "");
  cleaned = cleaned.replace("subconverter", "");
  return cleaned;
};

/**
 * 处理订阅链接（去除换行符）
 * @param {string} url - 原始订阅链接
 * @returns {string} 处理后的订阅链接
 */
export const processSubUrl = (url) => {
  return url.replace(/(\n|\r|\n\r)/g, "|");
};
