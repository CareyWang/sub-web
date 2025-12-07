/**
 * URL解析逻辑
 */
export function useUrlParser() {
  /**
   * 异步分析URL
   * @param {string} loadConfig - 待分析的URL
   * @returns {Promise<string>} 分析结果
   */
  const analyzeUrl = async (loadConfig) => {
    // Check if `loadConfig` includes "target"
    if (loadConfig.includes("target")) {
      // If it does, return `loadConfig`
      return loadConfig;
    } else {
      // Otherwise, fetch the data from `loadConfig` using GET method and follow redirects
      try {
        let response = await fetch(loadConfig, {
          method: "GET",
          redirect: "follow",
        });
        // Return the URL from the response
        return response.url;
      } catch (e) {
        throw new Error("解析短链接失败，请检查短链接服务端是否配置跨域：" + e);
      }
    }
  };

  /**
   * 确认并加载配置
   * @param {string} loadConfig - 待解析的配置URL
   * @param {Object} form - 表单对象
   * @param {Array} customParams - 自定义参数数组
   * @param {Function} onSuccess - 成功回调
   * @param {Function} onError - 错误回调
   * @returns {Promise<boolean>} 是否成功
   */
  const parseUrl = async (loadConfig, form, customParams, onSuccess, onError) => {
    // Check if 'loadConfig' is empty
    if (loadConfig.trim() === "") {
      onError("订阅链接不能为空");
      return false;
    }

    try {
      // Analyze the URL and extract its components
      const url = new URL(await analyzeUrl(loadConfig));

      // Set the custom backend URL
      form.customBackend = url.origin + url.pathname + "?";

      // Parse the URL parameters
      const params = new URLSearchParams(url.search);

      // Record parameters have been read
      const getParam = params.get.bind(params);
      const excludeParams = new Set();
      params.get = key => {
        excludeParams.add(key);
        return getParam(key);
      };

      // Get the 'target' parameter
      const target = params.get("target");

      // Set the client type based on the 'target' parameter
      if (target === "surge") {
        const ver = params.get("ver") || "4";
        form.clientType = target + "&ver=" + ver;
      } else {
        form.clientType = target;
      }

      // Set other form properties based on the URL parameters
      form.sourceSubUrl = params.get("url").replace(/\|/g, "\n");
      form.insert = params.get("insert") === "true";
      form.remoteConfig = params.get("config");
      form.excludeRemarks = params.get("exclude");
      form.includeRemarks = params.get("include");
      form.filename = params.get("filename");
      form.appendType = params.get("append_type") === "true";
      form.emoji = params.get("emoji") === "true";
      form.nodeList = params.get("list") === "true";
      form.tfo = params.get("tfo") === "true";
      form.scv = params.get("scv") === "true";
      form.fdn = params.get("fdn") === "true";
      form.sort = params.get("sort") === "true";
      form.udp = params.get("udp") === "true";
      form.expand = params.get("expand") === "true";
      form.tpl.surge.doh = params.get("surge.doh") === "true";
      form.tpl.clash.doh = params.get("clash.doh") === "true";
      form.new_name = params.get("new_name") === "true";

      // Filter custom parameters
      customParams.splice(0, customParams.length);
      Array.from(params
        .entries()
        .filter(e => !excludeParams.has(e[0]))
        .map(e => ({ name: e[0], value: e[1] }))
      ).forEach(param => customParams.push(param));

      onSuccess();
      return true;
    } catch (error) {
      onError("请输入正确的订阅地址!");
      return false;
    }
  };

  return {
    analyzeUrl,
    parseUrl
  };
}
