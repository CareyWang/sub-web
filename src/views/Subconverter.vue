<template>
  <div>
    <el-row style="margin-top: 10px">
      <el-col>
        <el-card>
          <div slot="header">Subscription Converter</div>
          <el-container>
            <el-form
              :model="form"
              label-width="120px"
              label-position="left"
              style="width: 100%"
            >
              <el-form-item label="模式设置:">
                <el-radio v-model="advanced" label="1">基础模式</el-radio>
                <el-radio v-model="advanced" label="2">进阶模式</el-radio>
              </el-form-item>
              <el-form-item label="订阅链接:">
                <el-input
                  v-model="form.sourceSubUrl"
                  type="textarea"
                  rows="3"
                  placeholder="支持订阅或ss/ssr/vmess单链接。多个链接请每行一个或用 | 分隔"
                />
              </el-form-item>
              <el-form-item label="客户端:">
                <el-select v-model="form.clientType" style="width: 100%">
                  <el-option
                    v-for="(v, k) in options.clientTypes"
                    :key="k"
                    :label="k"
                    :value="v"
                  />
                </el-select>
              </el-form-item>

              <div v-if="advanced === '2'">
                <el-form-item label="emoji:">
                  <el-radio v-model="form.emoji" label="true">是</el-radio>
                  <el-radio v-model="form.emoji" label="false">否</el-radio>
                </el-form-item>
                <el-form-item label="后端地址:">
                  <el-input
                    ref="backend"
                    v-model="form.customBackend"
                    placeholder="动动小手，（建议）自行搭建后端服务。例：http://127.0.0.1:25500?sub"
                  >
                    <el-button
                      slot="append"
                      @click="gotoGayhub"
                      icon="el-icon-link"
                      >前往项目仓库</el-button
                    >
                  </el-input>
                </el-form-item>
                <el-form-item label="远程配置:">
                  <el-select
                    v-model="form.remoteConfig"
                    allow-create
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option-group
                      v-for="group in options.remoteConfig"
                      :key="group.label"
                      :label="group.label"
                    >
                      <el-option
                        v-for="item in group.options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-option-group>
                    <el-button
                      slot="append"
                      @click="gotoRemoteConfig"
                      icon="el-icon-link"
                      >配置示例</el-button
                    >
                  </el-select>
                </el-form-item>
                <el-form-item label="IncludeRemarks:">
                  <el-input
                    v-model="form.includeRemarks"
                    placeholder="节点名包含的关键字，支持正则"
                  />
                </el-form-item>
                <el-form-item label="ExcludeRemarks:">
                  <el-input
                    v-model="form.excludeRemarks"
                    placeholder="节点名不包含的关键字，支持正则"
                  />
                </el-form-item>
              </div>

              <div style="margin-top: 50px"></div>

              <el-divider content-position="center">
                <i class="el-icon-magic-stick" />
              </el-divider>

              <el-form-item label="定制订阅:">
                <el-input class="copy-content" disabled v-model="customSubUrl">
                  <el-button
                    slot="append"
                    v-clipboard:copy="customSubUrl"
                    v-clipboard:success="onCopy"
                    ref="copy-btn"
                    icon="el-icon-document-copy"
                    >复制</el-button
                  >
                </el-input>
              </el-form-item>

              <el-form-item
                label-width="0px"
                style="margin-top: 40px; text-align: center"
              >
                <el-button style="width: 120px" type="danger" @click="makeUrl"
                  >生成订阅链接</el-button
                >
                <el-button
                  style="width: 120px"
                  type="primary"
                  @click="clashInstall"
                  icon="el-icon-connection"
                  >一键导入Clash</el-button
                >
                <el-button
                  style="width: 120px"
                  type="primary"
                  @click="surgeInstall"
                  icon="el-icon-connection"
                  >一键导入Surge</el-button
                >
              </el-form-item>
            </el-form>
          </el-container>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const remoteConfigSample =
  "https://raw.githubusercontent.com/tindy2013/subconverter/master/base/example_external_config.ini";
const gayhubRelease = "https://github.com/tindy2013/subconverter/releases";
const defaultBackend = "https://api.wcc.best/sub?";

export default {
  data() {
    return {
      advanced: "2",

      options: {
        clientTypes: {
          clash: "clash",
          clashr: "clashr",
          surge2: "surge&ver=2",
          surge3: "surge&ver=3",
          surge4: "surge&ver=4",
          quantumult: "quan",
          quantumultx: "quanx",
          surfboard: "surfboard",
          ss: "ss",
          ssr: "ssr",
          ssd: "ssd",
          v2ray: "v2ray"
        },
        customBaseRules: [
          "ClashBaseRule",
          "SurgeBaseRule",
          "SurfboardRuleBase"
        ],
        remoteConfig: [
          {
            label: "universal",
            options: [
              {
                label: "No-Urltest",
                value:
                  "https://careywong-public-docs.oss-cn-shanghai.aliyuncs.com/subconverter/universal/no-urltest.ini"
              },
              {
                label: "Urltest",
                value:
                  "https://careywong-public-docs.oss-cn-shanghai.aliyuncs.com/subconverter/universal/urltest.ini"
              }
            ]
          },
          {
            label: "customized",
            options: [
              {
                label: "Maying",
                value:
                  "https://careywong-public-docs.oss-cn-shanghai.aliyuncs.com/subconverter/customized/maying.ini"
              },
              {
                label: "Nexitally",
                value:
                  "https://careywong-public-docs.oss-cn-shanghai.aliyuncs.com/subconverter/customized/nexitally.ini"
              }
            ]
          },
          {
            label: "Special",
            options: [
              {
                label: "NeteaseUnblock",
                value:
                  "https://careywong-public-docs.oss-cn-shanghai.aliyuncs.com/subconverter/special/netease.ini"
              }
            ]
          }
        ]
      },
      form: {
        sourceSubUrl: "",
        clientType: "",
        emoji: "true",
        customBackend: "",
        remoteConfig: "",
        excludeRemarks: "",
        includeRemarks: "",
        ClashBaseRule: "",
        SurgeBaseRule: "",
        SurfboardRuleBase: "",
        rename_node: "",
        ruleset: ""
      },

      loading: false,
      customSubUrl: ""
    };
  },
  created() {
    document.title = "Subscription Converter";
  },
  mounted() {
    this.form.clientType = "clashr";
  },
  methods: {
    onCopy() {
      this.$message.success("Copied!");
    },
    gotoGayhub() {
      window.open(gayhubRelease);
    },
    gotoRemoteConfig() {
      window.open(remoteConfigSample);
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },
    clashInstall() {
      if (this.customSubUrl === "") {
        this.$message.error("请先填写必填项，生成订阅链接");
        return false;
      }

      const url = "clash://install-config?url=";
      window.open(url + encodeURIComponent(this.customSubUrl));
    },
    surgeInstall() {
      if (this.customSubUrl === "") {
        this.$message.error("请先填写必填项，生成订阅链接");
        return false;
      }

      const url = "surge://install-config?url=";
      window.open(url + this.customSubUrl);
    },
    makeUrl() {
      if (this.form.sourceSubUrl === "" || this.form.clientType === "") {
        this.$message.error("订阅链接与客户端为必填项");
        return false;
      }

      let backend =
        this.form.customBackend === ""
          ? defaultBackend
          : this.form.customBackend;

      let sourceSub = this.form.sourceSubUrl;
      sourceSub = sourceSub.replace(/[\n|\r|\n\r]/g, "|");

      this.customSubUrl =
        backend +
        "target=" +
        this.form.clientType +
        "&url=" +
        encodeURIComponent(sourceSub);

      if (this.advanced === "2") {
        if (this.form.remoteConfig !== "") {
          this.customSubUrl +=
            "&config=" + encodeURIComponent(this.form.remoteConfig);
        }
        if (this.form.emoji === "false") {
          this.customSubUrl += "&emoji=" + this.form.emoji;
        }
        if (this.form.excludeRemarks !== "") {
          this.customSubUrl +=
            "&exclude=" + encodeURIComponent(this.form.excludeRemarks);
        }
        if (this.form.includeRemarks !== "") {
          this.customSubUrl +=
            "&include=" + encodeURIComponent(this.form.includeRemarks);
        }
      }

      this.$copyText(this.customSubUrl);
      this.$message.success("定制订阅已复制到剪切板");
    }
  }
};
</script>
