import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))
const svgDir = fileURLToPath(new URL('./src/icons/svg', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [svgDir],
      symbolId: 'icon-[name]'
    })
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
