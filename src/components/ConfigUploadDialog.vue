<template>
  <el-dialog
    :visible.sync="localVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="700px"
  >
    <div slot="title">
      Remote config upload
      <el-popover trigger="hover" placement="right" style="margin-left: 10px">
        <el-link type="primary" :href="sampleConfig" target="_blank" icon="el-icon-info">参考配置</el-link>
        <i class="el-icon-question" slot="reference"></i>
      </el-popover>
    </div>

    <el-form label-position="left">
      <el-form-item prop="uploadConfig">
        <el-input
          v-model="localUploadConfig"
          type="textarea"
          :autosize="{ minRows: 15, maxRows: 30 }"
          maxlength="10000"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm" :disabled="localUploadConfig.length === 0">
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { CONSTANTS } from '@/config/constants';

export default {
  name: 'ConfigUploadDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    uploadConfig: {
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
      sampleConfig: CONSTANTS.REMOTE_CONFIG_SAMPLE,
      localUploadConfig: this.uploadConfig,
      localVisible: this.visible
    };
  },
  watch: {
    uploadConfig(newVal) {
      this.localUploadConfig = newVal;
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
      this.$emit('confirm', this.localUploadConfig);
    }
  }
};
</script>
