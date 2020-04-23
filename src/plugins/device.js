import Vue from 'vue'

Vue.prototype.$getOS = () => {
  let ua = navigator.userAgent,
    isWindowsPhone = /(?:Windows Phone)/.test(ua),
    isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
    isAndroid = /(?:Android)/.test(ua),
    isFireFox = /(?:Firefox)/.test(ua),
    // isChrome = /(?:Chrome|CriOS)/.test(ua),
    isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
    isIPhone = /(?:iPhone)/.test(ua) && !isTablet,
    isPc = !isIPhone && !isAndroid && !isSymbian && !isWindowsPhone;

  return {
    isTablet: isTablet,
    isIPhone: isIPhone,
    isAndroid: isAndroid,
    isPc: isPc
  };
}
