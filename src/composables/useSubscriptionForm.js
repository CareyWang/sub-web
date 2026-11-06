import { CONSTANTS } from '@/config/constants'
import { setLocalStorageItem } from '@/utils/storage'
import { createSubscriptionForm } from '@/composables/useSubscription'

/** 返回供 Options API data() 使用的订阅表单状态。 */
export function useSubscriptionForm() {
  return {
    form: createSubscriptionForm(),
    customParams: [],
    advanced: '2'
  }
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
    const ttl = CONSTANTS.CACHE_TTL;
    setLocalStorageItem('sourceSubUrl', form.sourceSubUrl, ttl);
  }
}
