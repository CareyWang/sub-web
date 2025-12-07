<template>
  <el-dialog
    :visible.sync="localVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="700px"
  >
    <div slot="title">
      解析 Subconverter 链接
    </div>

    <el-form label-position="left" :inline="true">
      <el-form-item prop="loadConfig" label="订阅链接：" label-width="85px">
        <el-input v-model="localLoadConfig" style="width: 565px" />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm" :disabled="localLoadConfig.length === 0">
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'UrlParseDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loadConfig: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localLoadConfig: this.loadConfig,
      localVisible: this.visible
    };
  },
  watch: {
    loadConfig(newVal) {
      this.localLoadConfig = newVal;
    },
    visible(newVal) {
      this.localVisible = newVal;
    },
    localVisible(newVal) {
      this.$emit('update:visible', newVal);
    }
  },
  methods: {
    handleCancel() {
      this.$emit('cancel');
    },
    handleConfirm() {
      this.$emit('confirm', this.localLoadConfig);
    }
  }
};
</script>
