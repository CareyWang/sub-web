<template>
  <div>
    <el-row style="margin-top: 10px">
      <el-col>
        <el-card>
          <template #header>
            Subscription Converter
            <svg-icon icon-class="github" style="margin-left: 20px" @click="goToProject" />

            <div style="display: inline-block; position:absolute; right: 20px">{{ backendVersion }}</div>
          </template>
          <el-container>
            <el-form :model="form" label-width="140px" label-position="left" style="width: 100%">
              <el-form-item label="模式设置:">
                <el-radio v-model="advanced" value="1">基础模式</el-radio>
                <el-radio v-model="advanced" value="2">进阶模式</el-radio>
              </el-form-item>
              <el-form-item label="订阅链接:">
                <el-input v-model="form.sourceSubUrl" type="textarea" :rows="3"
                  placeholder="支持订阅或ss/ssr/vmess链接，多个链接每行一个或用 | 分隔" @blur="saveSubUrl" />
              </el-form-item>
              <el-form-item label="客户端:">
                <el-select v-model="form.clientType" style="width: 100%">
                  <el-option v-for="(v, k) in options.clientTypes" :key="k" :label="k" :value="v"></el-option>
                </el-select>
              </el-form-item>

              <div v-if="advanced === '2'">
                <el-form-item label="后端地址:">
                  <el-autocomplete style="width: 100%" v-model="form.customBackend" :fetch-suggestions="backendSearch"
                    placeholder="动动小手，（建议）自行搭建后端服务。例：http://127.0.0.1:25500/sub?">
                    <template #append>
                      <el-button @click="gotoGayhub" :icon="Link">前往项目仓库</el-button>
                    </template>
                  </el-autocomplete>
                </el-form-item>
                <el-form-item label="远程配置:">
                  <el-select v-model="form.remoteConfig" allow-create filterable placeholder="请选择" style="width: 100%">
                    <el-option-group v-for="group in options.remoteConfig" :key="group.label" :label="group.label">
                      <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                    </el-option-group>
                  </el-select>
                </el-form-item>
                <el-form-item label="Include:">
                  <el-input v-model="form.includeRemarks" placeholder="节点名包含的关键字，支持正则" />
                </el-form-item>
                <el-form-item label="Exclude:">
                  <el-input v-model="form.excludeRemarks" placeholder="节点名不包含的关键字，支持正则" />
                </el-form-item>
                <el-form-item label="FileName:">
                  <el-input v-model="form.filename" placeholder="返回的订阅文件名" />
                </el-form-item>

                <el-form-item v-for="(param, i) in customParams" :key="i">
                  <template #label>
                    <el-input v-model="param.name" placeholder="自定义参数名">
                      <template #suffix>
                        <div style="width: 10px;">:</div>
                      </template>
                    </el-input>
                  </template>
                  <el-input v-model="param.value" placeholder="自定义参数内容">
                    <template #suffix>
                      <el-button link :icon="Delete" style="margin-right: 5px" @click="customParams.splice(i, 1)" />
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item label-width="0px">
                  <el-row class="options-row">
                    <el-col>
                      <el-checkbox v-model="form.nodeList" border>输出为 Node List</el-checkbox>
                    </el-col>
                    <el-popover placement="bottom" trigger="click" v-model:visible="form.extraset">
                      <template #reference>
                        <el-button>更多选项</el-button>
                      </template>
                      <el-row>
                        <el-checkbox v-model="form.emoji">Emoji</el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.scv">跳过证书验证</el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.udp" @change="needUdp = true">启用 UDP</el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.appendType">节点类型</el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.sort">排序节点</el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.fdn">过滤非法节点</el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.expand">规则展开</el-checkbox>
                      </el-row>
                    </el-popover>
                    <el-popover placement="bottom" trigger="click">
                      <template #reference>
                        <el-button style="margin-left: 10px">定制功能</el-button>
                      </template>
                      <el-row>
                        <el-checkbox v-model="form.tpl.surge.doh">Surge.DoH</el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.tpl.clash.doh">Clash.DoH</el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.insert">网易云</el-checkbox>
                      </el-row>
                    </el-popover>
                    <el-popover placement="top-end" title="添加自定义转换参数" trigger="hover">
                      <template #reference>
                        <el-button @click="addCustomParam" style="margin-left: 10px">
                          <el-icon><Plus /></el-icon>
                        </el-button>
                      </template>
                      <el-link type="primary" :href="subDocAdvanced" target="_blank" :icon="InfoFilled">参考文档</el-link>
                    </el-popover>
                  </el-row>
                </el-form-item>
              </div>

              <div style="margin-top: 50px"></div>

              <el-divider content-position="center">
                <el-icon><MagicStick /></el-icon>
              </el-divider>

              <el-form-item label="定制订阅:">
                <el-input class="copy-content" disabled v-model="customSubUrl">
                  <template #append>
                    <el-button :icon="DocumentCopy" @click="copyToClipboard(customSubUrl)">复制</el-button>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="订阅短链:">
                <el-input class="copy-content" disabled v-model="curtomShortSubUrl">
                  <template #append>
                    <el-button :icon="DocumentCopy" @click="copyToClipboard(curtomShortSubUrl)">复制</el-button>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 操作按钮组 -->
              <el-form-item class="actions-row" label-width="0px" style="margin-top: 40px">
                <el-button
                  :style="buttonStyle"
                  type="danger"
                  @click="makeUrlClick"
                  :disabled="!canGenerateUrl">
                  生成订阅链接
                </el-button>
                <el-button
                  :style="buttonStyle"
                  type="danger"
                  @click="makeShortUrlClick"
                  :loading="loading"
                  :disabled="!canGenerateShortUrl">
                  生成短链接
                </el-button>
              </el-form-item>

              <el-form-item class="actions-row" label-width="0px">
                <el-button
                  :style="buttonStyle"
                  type="primary"
                  @click="dialogUploadConfigVisible = true"
                  :icon="UploadFilled"
                  :loading="loading">
                  上传配置
                </el-button>
                <el-button
                  :style="buttonStyle"
                  type="primary"
                  @click="clashInstall"
                  :icon="Connection"
                  :disabled="!canImportClash">
                  一键导入 Clash
                </el-button>
              </el-form-item>

              <el-form-item class="actions-row" label-width="0px">
                <el-button
                  :style="{ width: '290px' }"
                  type="primary"
                  @click="dialogLoadConfigVisible = true"
                  :icon="CopyDocument"
                  :loading="loading">
                  从 URL 解析
                </el-button>
              </el-form-item>
            </el-form>
          </el-container>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配置上传对话框 -->
    <ConfigUploadDialog
      v-model:visible="dialogUploadConfigVisible"
      :upload-config="uploadConfig"
      :result-url="uploadResultUrl"
      :loading="loading"
      @cancel="handleUploadCancel"
      @confirm="handleConfigUpload"
    />

    <!-- URL解析对话框 -->
    <UrlParseDialog
      v-model:visible="dialogLoadConfigVisible"
      :load-config="loadConfig"
      :loading="loading"
      @cancel="handleLoadCancel"
      @confirm="handleUrlParse"
    />
  </div>
</template>

<script>
import { h } from 'vue';
import {
  Connection,
  CopyDocument,
  Delete,
  DocumentCopy,
  InfoFilled,
  Link,
  MagicStick,
  Plus,
  UploadFilled
} from '@element-plus/icons-vue';

// 导入配置
import { CONSTANTS } from '@/config/constants';
import { CLIENT_TYPES } from '@/config/client-types';
import { REMOTE_CONFIGS } from '@/config/remote-configs';

// 导入Composables
import { useSubscriptionForm, addCustomParam, saveSubUrl as saveSubscriptionUrl } from '@/composables/useSubscriptionForm';
import { useSubscription } from '@/composables/useSubscription';
import { useUrlParser } from '@/composables/useUrlParser';

// 导入工具函数
import { getLocalStorageItem } from '@/utils/storage';
import { copyText } from '@/utils/clipboard';

// 导入服务
import { BackendService } from '@/services/backendService';
import { ShortUrlService } from '@/services/shortUrlService';
import { ConfigUploadService } from '@/services/configUploadService';

// 导入组件
import ConfigUploadDialog from '@/components/ConfigUploadDialog.vue';
import UrlParseDialog from '@/components/UrlParseDialog.vue';

export default {
  name: 'Subconverter',
  components: {
    ConfigUploadDialog,
    UrlParseDialog,
    MagicStick,
    Plus
  },
  data() {
    const subscriptionForm = useSubscriptionForm();

    return {
      // 配置选项
      options: {
        clientTypes: CLIENT_TYPES,
        backendOptions: [{ value: "http://127.0.0.1:25500/sub?" }],
        remoteConfig: REMOTE_CONFIGS
      },

      // 状态
      backendVersion: "",
      loading: false,
      curtomShortSubUrl: "",
      dialogUploadConfigVisible: false,
      loadConfig: "",
      dialogLoadConfigVisible: false,
      uploadConfig: "",
      uploadResultUrl: "",
      subDocAdvanced: CONSTANTS.DOC_ADVANCED,

      // 是否为 PC 端
      isPC: true,

      // 合并表单状态
      ...subscriptionForm
    };
  },
  computed: {
    // 图标组件经 computed 暴露，避免放入 data 被转换为响应式对象
    Connection() {
      return Connection;
    },

    CopyDocument() {
      return CopyDocument;
    },

    Delete() {
      return Delete;
    },

    DocumentCopy() {
      return DocumentCopy;
    },

    InfoFilled() {
      return InfoFilled;
    },

    Link() {
      return Link;
    },

    UploadFilled() {
      return UploadFilled;
    },

    // 按钮统一样式
    buttonStyle() {
      return { width: '140px' };
    },

    canGenerateShortUrl() {
      return this.customSubUrl.length > 0 && !this.loading;
    },

    canGenerateUrl() {
      return this.form.sourceSubUrl.length > 0 && this.form.clientType;
    },

    canImportClash() {
      return this.customSubUrl.length > 0;
    },

    processedSubUrl() {
      return this.form.sourceSubUrl.replace(/(\n|\r|\n\r)/g, "|");
    },

    currentBackend() {
      return this.form.customBackend || CONSTANTS.DEFAULT_BACKEND;
    }
  },
  watch: {
    dialogUploadConfigVisible(visible) {
      if (!visible) {
        this.uploadResultUrl = "";
      }
    }
  },
  created() {
    document.title = "Subscription Converter";
    this.isPC = this.$getOS().isPc;

    // 获取 url cache
    if (import.meta.env.VITE_USE_STORAGE === 'true') {
      const cachedUrl = getLocalStorageItem('sourceSubUrl');
      if (cachedUrl) {
        this.form.sourceSubUrl = cachedUrl;
      }
    }
  },
  mounted() {
    this.form.clientType = CONSTANTS.DEFAULT_CLIENT_TYPE;
    this.getBackendVersion();

    // 延迟加载隐私提示，避免阻塞页面初始化
    this.notifyTimer = setTimeout(() => {
      this.notify();
    }, 1000);
  },
  beforeUnmount() {
    clearTimeout(this.notifyTimer);
  },
  methods: {
    async copyToClipboard(text, successMessage = "Copied!") {
      if (!text) {
        return false;
      }

      const copied = await copyText(text);
      if (copied) {
        this.$message.success(successMessage);
      } else {
        this.$message.error("复制失败，请手动选中链接复制");
      }

      return copied;
    },

    goToProject() {
      window.open(CONSTANTS.PROJECT);
    },

    gotoGayhub() {
      window.open(CONSTANTS.BACKEND_RELEASE);
    },

    clashInstall() {
      if (this.customSubUrl === "") {
        this.$message.error("请先填写必填项，生成订阅链接");
        return false;
      }

      const url = "clash://install-config?url=";
      window.open(
        url +
        encodeURIComponent(
          this.curtomShortSubUrl !== ""
            ? this.curtomShortSubUrl
            : this.customSubUrl
        )
      );
    },

    makeUrlClick() {
      const url = this.makeUrl(this.form, this.advanced, this.processedSubUrl, this.currentBackend, this.customParams, this.needUdp);
      if (url) {
        this.customSubUrl = url;
        this.copyToClipboard(this.customSubUrl, "定制订阅已复制到剪贴板");
      } else {
        this.$message.error("订阅链接与客户端为必填项");
      }
    },

    makeShortUrlClick() {
      if (this.customSubUrl === "") {
        this.$message.warning("请先生成订阅链接，再获取对应短链接");
        return false;
      }

      this.loading = true;

      ShortUrlService.generateShortUrl(this.$axios, this.customSubUrl)
        .then(shortUrl => {
          this.curtomShortSubUrl = shortUrl;
          this.copyToClipboard(shortUrl, "短链接已复制到剪贴板");
        })
        .catch(error => {
          this.$message.error("短链接获取失败：" + error.message);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    confirmUploadConfig() {
      if (this.uploadConfig === "") {
        this.$message.warning("远程配置不能为空");
        return false;
      }

      this.loading = true;

      ConfigUploadService.uploadConfig(this.$axios, this.uploadConfig)
        .then(async res => {
          const result = await ConfigUploadService.handleUploadSuccess(res, copyText, this.$message);
          if (result.success) {
            // 自动填充至『表单-远程配置』
            this.form.remoteConfig = result.url;
            if (result.copied) {
              this.dialogUploadConfigVisible = false;
              this.uploadConfig = "";
              this.uploadResultUrl = "";
            } else {
              this.uploadResultUrl = result.url;
            }
          }
        })
        .catch(error => {
          this.$message.error("远程配置上传失败: " + error.message);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    handleUploadCancel() {
      this.uploadConfig = "";
      this.uploadResultUrl = "";
      this.dialogUploadConfigVisible = false;
    },

    handleConfigUpload(configContent) {
      this.uploadConfig = configContent;
      this.confirmUploadConfig();
    },

    handleLoadCancel() {
      this.loadConfig = "";
      this.dialogLoadConfigVisible = false;
    },

    handleUrlParse(url) {
      this.loadConfig = url;
      this.confirmLoadConfig();
    },

    confirmLoadConfig() {
      this.loading = true;

      this.parseUrl(
        this.loadConfig,
        this.form,
        this.customParams,
        () => {
          this.dialogLoadConfigVisible = false;
          this.loadConfig = "";
          this.$message.success("长/短链接已成功解析为订阅信息");
        },
        (error) => {
          this.$message.error(error);
        }
      ).then(() => {
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },

    backendSearch(queryString, cb) {
      const results = this.backendSearchSuggestions(queryString, this.options.backendOptions);
      cb(results);
    },

    backendSearchSuggestions(queryString, backends) {
      if (queryString) {
        return backends.filter(backend => {
          return backend.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
        });
      }
      return backends;
    },

    async getBackendVersion() {
      this.backendVersion = await BackendService.getBackendVersion(this.$axios);
    },

    notify() {
      this.$notify({
        title: "隐私提示",
        type: "warning",
        message: h(
          "i",
          { style: "color: teal" },
          "各种订阅链接（短链接服务除外）生成纯前端实现，无隐私问题。默认提供后端转换服务，隐私担忧者请自行搭建后端服务。"
        )
      });
    },

    // 表单相关方法
    saveSubUrl() {
      saveSubscriptionUrl(this.form);
    },

    addCustomParam() {
      addCustomParam(this.customParams);
    },

    // 使用 composables
    ...useSubscription(),
    ...useUrlParser()
  }
};
</script>

<style scoped>
/* el-form-item__content 在 Element Plus 中是 flex 容器，text-align 无法居中按钮 */
.actions-row :deep(.el-form-item__content) {
  justify-content: center;
}

/* el-form-item__content 为 flex 容器，行宽默认由内容撑开，需显式占满 */
/* 同时覆盖 Element Plus 中 el-row 默认的 flex-wrap: wrap，保持选项与按钮同行 */
.options-row {
  width: 100%;
  flex-wrap: nowrap;
}

/* 占满剩余空间，将右侧选项按钮推至行尾 */
.options-row :deep(.el-col) {
  flex: 1;
}
</style>
