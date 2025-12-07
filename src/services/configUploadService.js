import { CONSTANTS } from '@/config/constants';

/**
 * 配置上传服务
 */
export class ConfigUploadService {
  /**
   * 上传配置
   * @param {Object} $axios - Axios实例
   * @param {string} content - 配置内容
   * @returns {Promise<Object>} 上传结果
   */
  static async uploadConfig($axios, content) {
    const body = {
      content: content,
    };

    const response = await $axios.post(CONSTANTS.CONFIG_UPLOAD_API, body);
    return response.data;
  }

  /**
   * 处理上传成功响应
   * @param {Object} res - 响应对象 (已经是response.data)
   * @param {Function} $copyText - 复制文本函数
   * @param {Function} $message - 消息提示函数
   * @returns {Object} 处理结果
   */
  static handleUploadSuccess(res, $copyText, $message) {
    // res 已经是 response.data，所以直接访问 res.code, res.msg, res.data.url
    if (res.code === 0 && res.data && res.data.url) {
      const configUrl = res.data.url;
      $copyText(configUrl);
      $message.success(
        "远程配置上传成功，配置链接已复制到剪贴板，有效期三个月望知悉"
      );
      return {
        success: true,
        url: configUrl
      };
    } else {
      const errorMsg = res.msg || "远程配置上传失败";
      throw new Error(errorMsg);
    }
  }

  /**
   * 处理上传错误
   * @param {Function} $message - 消息提示函数
   */
  static handleUploadError($message) {
    $message.error("远程配置上传失败");
  }
}
