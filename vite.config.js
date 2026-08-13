import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ElementPlus from 'unplugin-element-plus/vite'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    // 按需注入组件样式，避免引入 element-plus 全量 CSS
    ElementPlus()
  ],
  resolve: {
    alias: {
      '@': srcDir
    }
  },
  server: {
    host: '0.0.0.0'
  }
})
