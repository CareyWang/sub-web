import { CONSTANTS } from '@/config/constants';

/**
 * 短链接生成服务
 */
export class ShortUrlService {
  /**
   * 生成短链接
   * @param {Object} $axios - Axios实例
   * @param {string} longUrl - 长链接
   * @returns {Promise<string>} 短链接
   */
  static async generateShortUrl($axios, longUrl) {
    // 构建请求数据
    const formData = new FormData();
    formData.append("longUrl", btoa(longUrl));

    const response = await $axios.post(CONSTANTS.SHORT_URL_API, formData, {
      headers: {
        "Content-Type": "application/form-data; charset=utf-8"
      }
    });

    if (response.data.Code === 1 && response.data.ShortUrl !== "") {
      return response.data.ShortUrl;
    } else {
      throw new Error(response.data.Message || "短链接获取失败");
    }
  }

  /**
   * 处理短链接成功响应
   * @param {Object} res - 响应对象
   * @param {Function} $copyText - 复制文本函数
   * @param {Function} $message - 消息提示函数
   * @returns {string} 短链接
   */
  static handleShortUrlSuccess(res, $copyText, $message) {
    if (res.data.Code === 1 && res.data.ShortUrl !== "") {
      const shortUrl = res.data.ShortUrl;
      $copyText(shortUrl);
      $message.success("短链接已复制到剪贴板");
      return shortUrl;
    } else {
      throw new Error(res.data.Message);
    }
  }

  /**
   * 处理短链接错误
   * @param {Function} $message - 消息提示函数
   */
  static handleShortUrlError($message) {
    $message.error("短链接获取失败");
  }
}
