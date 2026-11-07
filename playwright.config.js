import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const CI = !!process.env.CI

// 测试对象是生产构建产物：先 yarn build，再由 webServer 启动 vite preview
export default defineConfig({
  testDir: 'e2e',
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/`,
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: `yarn preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !CI
  }
})
