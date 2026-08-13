<template>
  <el-config-provider :locale="locale" :z-index="3000">
    <div id="app">
      <router-view/>
    </div>
  </el-config-provider>
</template>

<script>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

export default {
  name: 'App',
  components: {
    ElConfigProvider
  },
  computed: {
    locale() {
      return zhCn
    }
  }
}
</script>
