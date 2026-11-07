import { test as base, expect } from '@playwright/test'

// 通过替换 config.js 把后端、短链、上传接口指到同源的假地址，由 page.route 应答
const BACKEND = '/__e2e/backend/sub?'
const SHORT_URL_API = '/__e2e/short'
const CONFIG_UPLOAD_API = '/__e2e/upload'
const SOURCE = 'https://source.example/sub?token=abc'

const test = base.extend({
  page: async ({ page, context, baseURL }, use) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    // 被拦截的外部请求也会产生 console.error，可借此发现意外的网络依赖
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text())
    })

    // 只放行 preview 服务；其余外部请求一律拦截，测试不依赖网络
    await page.route(url => !url.href.startsWith(baseURL), route => route.abort())
    await page.route('**/config.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: 'window.__SUB_WEB_CONFIG__ = ' + JSON.stringify({
        VITE_SUBCONVERTER_DEFAULT_BACKEND: new URL(BACKEND, baseURL).href,
        VITE_MYURLS_API: new URL(SHORT_URL_API, baseURL).href,
        VITE_CONFIG_UPLOAD_API: new URL(CONFIG_UPLOAD_API, baseURL).href
      })
    }))
    await page.route('**/__e2e/backend/version', route => route.fulfill({ body: 'subconverter v0.9.0-e2e backend\n' }))

    await use(page)
    expect(errors, '页面运行时错误').toEqual([])
  }
})

const sourceInput = page => page.getByPlaceholder('支持订阅或ss/ssr/vmess链接')
const includeInput = page => page.getByPlaceholder('节点名包含的关键字')
const linkInput = (page, label) => page.locator('.el-form-item', { hasText: label }).locator('input')
const clipboard = page => page.evaluate(() => navigator.clipboard.readText())

async function generateLink(page) {
  await sourceInput(page).fill(SOURCE)
  await includeInput(page).fill('HK')
  await page.getByRole('button', { name: '生成订阅链接' }).click()
  await expect(linkInput(page, '定制订阅:')).not.toHaveValue('')
  return linkInput(page, '定制订阅:').inputValue()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('v0.9.0-e2e')).toBeVisible()
})

test('生成订阅链接并复制', async ({ page, baseURL }) => {
  const link = new URL(await generateLink(page))

  expect(link.origin + link.pathname).toBe(new URL('/__e2e/backend/sub', baseURL).href)
  expect(link.searchParams.get('target')).toBe('clash')
  expect(link.searchParams.get('url')).toBe(SOURCE)
  expect(link.searchParams.get('include')).toBe('HK')
  expect(await clipboard(page)).toBe(link.href)
})

test('生成短链接并复制', async ({ page }) => {
  const link = await generateLink(page)
  let longUrl
  await page.route('**/__e2e/short', async route => {
    longUrl = atob(route.request().postDataBuffer().toString().match(/name="longUrl"\r\n\r\n(.*)\r\n/)[1])
    await route.fulfill({ json: { Code: 1, ShortUrl: 'https://s.example/abc', Message: '' } })
  })

  await page.getByRole('button', { name: '生成短链接' }).click()

  await expect(linkInput(page, '订阅短链:')).toHaveValue('https://s.example/abc')
  expect(longUrl).toBe(link)
  expect(await clipboard(page)).toBe('https://s.example/abc')
})

test('解析短链接并回填表单', async ({ page, baseURL }) => {
  const longUrl = new URL(BACKEND, baseURL).href + 'target=surge&ver=4&url=' + encodeURIComponent(SOURCE) + '&include=JP&udp=true'
  await page.route('**/__e2e/s/abc', route => route.fulfill({ status: 302, headers: { location: longUrl } }))
  await page.route('**/__e2e/backend/sub?*', route => route.fulfill({ body: '' }))

  await page.getByRole('button', { name: '从 URL 解析' }).click()
  const dialog = page.locator('.el-dialog', { hasText: '解析 Subconverter 链接' })
  await dialog.getByRole('textbox').fill(new URL('/__e2e/s/abc', baseURL).href)
  await dialog.getByRole('button', { name: '确 定' }).click()

  await expect(dialog).toBeHidden()
  await expect(sourceInput(page)).toHaveValue(SOURCE)
  await expect(includeInput(page)).toHaveValue('JP')
  await expect(page.locator('.el-form-item', { hasText: '客户端:' })).toContainText('Surge')
})

test('上传远程配置并复制配置链接', async ({ page }) => {
  let content
  await page.route('**/__e2e/upload', async route => {
    content = route.request().postDataJSON().content
    await route.fulfill({ json: { code: 0, data: { url: 'https://cfg.example/e2e.ini' }, msg: '' } })
  })

  await page.getByRole('button', { name: '上传配置' }).click()
  const dialog = page.locator('.el-dialog', { hasText: 'Remote config upload' })
  await dialog.getByRole('textbox').fill('[custom]\nenable_rule_generator=true')
  await dialog.getByRole('button', { name: '确 定' }).click()

  await expect(dialog).toBeHidden()
  expect(content).toBe('[custom]\nenable_rule_generator=true')
  expect(await clipboard(page)).toBe('https://cfg.example/e2e.ini')
  await expect(page.locator('.el-form-item', { hasText: '远程配置:' })).toContainText('https://cfg.example/e2e.ini')
})

test('切换基础模式隐藏进阶选项', async ({ page }) => {
  await expect(includeInput(page)).toBeVisible()
  await page.getByText('基础模式').click()
  await expect(includeInput(page)).toBeHidden()
})

test('进阶模式完整渲染所有组件', async ({ page }) => {
  // 生产构建不输出 [Vue warn]：未注册的组件会以自定义标签原样留在 DOM 中
  const unresolved = await page.evaluate(() =>
    [...new Set([...document.querySelectorAll('*')]
      .filter(el => el.localName.includes('-') || el instanceof HTMLUnknownElement)
      .map(el => el.localName))])
  expect(unresolved, '未解析的组件标签').toEqual([])

  for (const label of ['模式设置:', '订阅链接:', '客户端:', '后端地址:', '远程配置:', 'Include:', 'Exclude:', 'FileName:', '定制订阅:', '订阅短链:']) {
    await expect(page.locator('.el-form-item__label', { hasText: label })).toBeVisible()
  }
  for (const name of ['前往项目仓库', '更多选项', '定制功能', '生成订阅链接', '生成短链接', '上传配置', '一键导入 Clash', '从 URL 解析']) {
    await expect(page.getByRole('button', { name })).toBeVisible()
  }
  await expect(page.getByText('输出为 Node List')).toBeVisible()
  await expect(page.locator('.el-form-item', { hasText: '客户端:' })).toContainText('Clash')
  await expect(page.locator('.el-card__header .svg-icon path')).toHaveCount(1)
  for (const name of ['上传配置', '一键导入 Clash', '从 URL 解析']) {
    await expect(page.getByRole('button', { name }).locator('.el-icon svg')).toBeVisible()
  }
  await expect(page.getByText('隐私提示')).toBeVisible()
})

const box = locator => locator.boundingBox()
const center = b => b.x + b.width / 2

async function expectNoHorizontalScroll(page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() =>
    ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  expect(scrollWidth, '页面出现横向滚动').toBeLessThanOrEqual(clientWidth)
}

async function expectOptionsInOneRow(page) {
  const tops = await Promise.all(['输出为 Node List', '更多选项', '定制功能'].map(async text => (await box(page.getByText(text, { exact: true }))).y))
  expect(Math.max(...tops) - Math.min(...tops), '选项行折行').toBeLessThanOrEqual(2)
}

test.describe('桌面布局', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('标签与输入框同行，操作按钮居中', async ({ page }) => {
    await expectNoHorizontalScroll(page)

    const item = page.locator('.el-form-item', { hasText: '后端地址:' })
    const label = await box(item.locator('.el-form-item__label'))
    const input = await box(page.getByPlaceholder('动动小手'))
    expect(label.x + label.width).toBeLessThanOrEqual(input.x)
    expect(Math.abs(label.y - input.y)).toBeLessThanOrEqual(4)
    await expect(page.locator('.backend-link-text')).toBeVisible()

    await expectOptionsInOneRow(page)

    const content = await box(page.locator('.actions-row .el-form-item__content').first())
    const first = await box(page.getByRole('button', { name: '生成订阅链接' }))
    const last = await box(page.getByRole('button', { name: '生成短链接' }))
    expect(Math.abs((first.x + last.x + last.width) / 2 - center(content)), '操作按钮未居中').toBeLessThanOrEqual(2)
  })
})

test.describe('移动端布局', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('标签置顶，输入框不被挤压，按钮不溢出', async ({ page }) => {
    await expectNoHorizontalScroll(page)

    const item = page.locator('.el-form-item', { hasText: '后端地址:' })
    const label = await box(item.locator('.el-form-item__label'))
    const content = await box(item.locator('.el-form-item__content'))
    const input = await box(page.getByPlaceholder('动动小手'))
    expect(label.y + label.height, '标签未置顶').toBeLessThanOrEqual(input.y)
    expect(input.width, '后端地址输入框被挤压').toBeGreaterThanOrEqual(content.width * 0.7)
    await expect(page.locator('.backend-link-text')).toBeHidden()
    await expect(page.getByRole('button', { name: '前往项目仓库' })).toBeVisible()

    await expectOptionsInOneRow(page)

    for (const name of ['生成订阅链接', '生成短链接', '上传配置', '一键导入 Clash', '从 URL 解析']) {
      const button = await box(page.getByRole('button', { name }))
      expect(button.x, name + ' 左侧溢出').toBeGreaterThanOrEqual(0)
      expect(button.x + button.width, name + ' 右侧溢出').toBeLessThanOrEqual(375)
    }
  })
})
