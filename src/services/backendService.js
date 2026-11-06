import { CONSTANTS } from '@/config/constants';
import { formatVersion } from '@/utils/formatters';

/**
 * 后端版本检查服务
 */
export class BackendService {
  /**
   * 获取后端版本信息
   * @param {Object} $axios - Axios实例
   * @param {string} backend - 后端转换地址
   * @returns {Promise<string>} 版本信息
   */
  static async getBackendVersion($axios, backend = CONSTANTS.DEFAULT_BACKEND) {
    // 去掉查询参数和末尾的 /sub，得到版本 API 路径
    const versionApiUrl = backend.split('?')[0].replace(/\/sub$/, '') + "/version";

    try {
      const response = await $axios.get(versionApiUrl);
      // 清理版本信息格式
      let version = formatVersion(response.data);
      return version;
    } catch (error) {
      // 静默处理，不显示错误信息，避免干扰用户体验
      return "";
    }
  }
}
