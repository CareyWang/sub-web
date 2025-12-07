import { setLocalStorageItem } from '@/utils/storage';

/**
 * 订阅表单状态管理 - 为Vue 2 Options API设计
 */
export function useSubscriptionForm() {
  // 返回响应式数据和方法的集合
  return {
    // 表单数据
    form: {
      sourceSubUrl: "",
      clientType: "",
      customBackend: "",
      remoteConfig: "",
      excludeRemarks: "",
      includeRemarks: "",
      filename: "",
      emoji: true,
      nodeList: false,
      extraset: false,
      sort: false,
      udp: false,
      tfo: false,
      scv: true,
      fdn: false,
      expand: true,
      appendType: false,
      insert: false, // 是否插入默认订阅的节点，对应配置项 insert_url
      new_name: true, // 是否使用 Clash 新字段

      // tpl 定制功能
      tpl: {
        surge: {
          doh: false // dns 查询是否使用 DoH
        },
        clash: {
          doh: false
        }
      }
    },

    // 自定义参数
    customParams: [],

    // 高级模式
    advanced: "2",

    // 是否需要UDP
    needUdp: false,

    // 生成的订阅链接
    customSubUrl: ""
  };
}

/**
 * 添加自定义参数
 * @param {Array} customParams - 自定义参数数组
 */
export function addCustomParam(customParams) {
  customParams.push({
    name: "",
    value: "",
  });
}

/**
 * 保存订阅URL到本地存储
 * @param {Object} form - 表单对象
 */
export function saveSubUrl(form) {
  if (form && form.sourceSubUrl !== '') {
    const ttl = process.env.VUE_APP_CACHE_TTL || 3600;
    setLocalStorageItem('sourceSubUrl', form.sourceSubUrl, ttl);
  }
}
