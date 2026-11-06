import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' })
after(() => server.close())
const { default: page } = await server.ssrLoadModule('/src/views/Subconverter.vue')

const { useSubscription, createSubscriptionForm } = await server.ssrLoadModule('/src/composables/useSubscription.js')
const { useGeneratedLinks } = await server.ssrLoadModule('/src/composables/useGeneratedLinks.js')
const { ConfigUploadService } = await server.ssrLoadModule('/src/services/configUploadService.js')
const { ShortUrlService } = await server.ssrLoadModule('/src/services/shortUrlService.js')
const { makeUrl, parseUrl } = useSubscription('https://default.example/sub?')


function createPage() {
  const vm = {
    ...page.data(),
    messages: [],
    $message: { success() {}, warning() {}, error() {} }
  }
  for (const [name, method] of Object.entries(page.methods)) vm[name] = method.bind(vm)
  for (const [name, computed] of Object.entries(page.computed)) {
    Object.defineProperty(vm, name, { get: () => computed.call(vm) })
  }
  vm.$message.error = message => vm.messages.push(message)
  vm.copyToClipboard = async () => true
  vm.form.clientType = 'clash'
  vm.form.customBackend = 'https://converter.example/sub?'
  vm.form.sourceSubUrl = 'https://source.example/A'
  return vm
}

const importedUrl = 'https://converter.example/sub?target=clash&url=https%3A%2F%2Fsource.example%2FA'

test('import and regenerate preserves explicit UDP', async () => {
  const vm = createPage()
  vm.loadConfig = importedUrl + '&udp=true'
  await vm.confirmLoadConfig()
  vm.makeUrlClick()
  assert.equal(new URL(vm.customSubUrl).searchParams.get('udp'), 'true')
})

test('invalid import leaves the current form unchanged', async () => {
  const vm = createPage()
  const original = structuredClone(vm.form)
  vm.loadConfig = 'https://other.example/sub?target=surge'
  await vm.confirmLoadConfig()
  assert.deepEqual(vm.form, original)
})

test('generating B invalidates the short link for A', async () => {
  const vm = createPage()
  vm.$axios = { post: async () => ({ data: { Code: 1, ShortUrl: 'https://short.example/A' } }) }
  vm.makeUrlClick()
  await vm.makeShortUrlClick()
  vm.form.sourceSubUrl = 'https://source.example/B'
  vm.makeUrlClick()
  assert.equal(vm.curtomShortSubUrl, '')
})


function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

for (const udp of ['true', 'false', null]) {
  test(`UDP round trip preserves ${udp === null ? 'absence' : udp}`, () => {
    const result = parseUrl(importedUrl + (udp === null ? '' : '&udp=' + udp))
    assert.equal(result.success, true)
    const output = makeUrl(result.form, '2', result.customParams)
    assert.equal(new URL(output).searchParams.get('udp'), udp)
  })
}

test('round trip preserves Surge version, filters, explicit booleans, and repeated custom values', () => {
  const form = createSubscriptionForm()
  Object.assign(form, {
    clientType: 'surge&ver=3',
    sourceSubUrl: 'https://source.example/A?a=1&b=2\r\nss://example',
    remoteConfig: 'https://config.example/test?token=a+b',
    excludeRemarks: '香港|日本',
    includeRemarks: 'a & b',
    filename: '节点 #1',
    emoji: false,
    scv: false,
    expand: false,
    udp: false,
    insert: true
  })
  form.tpl.surge.doh = true
  const customParams = [{ name: 'extra', value: 'a+b' }, { name: 'extra', value: '' }]
  const url = makeUrl(form, '2', customParams)
  assert.equal(new URL(url).searchParams.get('url'), 'https://source.example/A?a=1&b=2|ss://example')
  const result = parseUrl(url)
  assert.equal(result.success, true)
  assert.equal(result.form.clientType, form.clientType)
  for (const field of ['remoteConfig', 'excludeRemarks', 'includeRemarks', 'filename', 'emoji', 'scv', 'expand', 'udp', 'insert']) {
    assert.equal(result.form[field], form[field], field)
  }
  assert.equal(result.form.tpl.surge.doh, true)
  assert.deepEqual(result.customParams, customParams)
  assert.equal(makeUrl(result.form, '2', result.customParams), url)
})

test('Clash template flags and legacy names survive a round trip', () => {
  const result = parseUrl(importedUrl + '&clash.doh=true&new_name=false')
  const output = new URL(makeUrl(result.form, '2', []))
  assert.equal(output.searchParams.get('clash.doh'), 'true')
  assert.equal(output.searchParams.get('new_name'), 'false')
})

test('basic generation includes only source, target, version, and insert', () => {
  const form = createSubscriptionForm()
  Object.assign(form, { sourceSubUrl: 'ss://example', clientType: 'surge&ver=4', udp: true, remoteConfig: 'https://config.example/' })
  const params = new URL(makeUrl(form, '1', [{ name: 'x', value: 'y' }])).searchParams
  assert.deepEqual([...params.keys()], ['target', 'ver', 'url', 'insert'])
})

test('missing boolean options preserve import semantics and text fields remain strings', () => {
  const { form } = parseUrl(importedUrl)
  assert.equal(form.emoji, false)
  assert.equal(form.scv, false)
  assert.equal(form.expand, false)
  assert.equal(form.new_name, false)
  assert.equal(form.remoteConfig, '')
  const other = parseUrl(importedUrl).form
  form.tpl.clash.doh = true
  assert.equal(other.tpl.clash.doh, false)
})

test('invalid import never replaces form or custom parameter state', async () => {
  for (const url of ['', 'broken', 'ftp://example/sub?target=clash&url=ss://example', importedUrl.replace('target=clash', 'target='), importedUrl.replace('url=https%3A%2F%2Fsource.example%2FA', 'url=%20')]) {
    const vm = createPage()
    const form = vm.form
    const custom = vm.customParams
    custom.push({ name: 'original', value: 'value' })
    vm.loadConfig = url
    assert.equal(await vm.confirmLoadConfig(), false, url)
    assert.equal(vm.form, form)
    assert.equal(vm.customParams, custom)
    assert.equal(vm.parsing, false)
  }
})

test('generation validates required values and chooses the configured backend internally', () => {
  const form = createSubscriptionForm()
  assert.equal(makeUrl(form, '2', []), '')
  Object.assign(form, { clientType: 'clash', sourceSubUrl: '  ' })
  assert.equal(makeUrl(form, '2', []), '')
  form.sourceSubUrl = 'ss://example'
  assert.equal(new URL(makeUrl(form, '2', [])).origin, 'https://default.example')
  form.customBackend = 'https://custom.example/sub?token=x'
  const output = new URL(makeUrl(form, '2', []))
  assert.equal(output.origin, 'https://custom.example')
  assert.equal(output.searchParams.get('token'), 'x')
  assert.equal(output.searchParams.get('target'), 'clash')
})

test('late response for A cannot replace B or end B’s pending state', async () => {
  const links = useGeneratedLinks()
  const a = deferred(), b = deferred()
  links.setLongUrl('A')
  const pendingA = links.shorten(() => a.promise)
  links.setLongUrl('B')
  const pendingB = links.shorten(() => b.promise)
  a.resolve('short A')
  assert.equal(await pendingA, null)
  assert.equal(links.importUrl, 'B')
  assert.equal(links.pending, true)
  b.resolve('short B')
  assert.equal(await pendingB, 'short B')
  assert.equal(links.importUrl, 'short B')
  assert.equal(links.pending, false)
})

test('obsolete errors are ignored; current failures reset pending and allow retry', async () => {
  const links = useGeneratedLinks()
  const a = deferred()
  links.setLongUrl('A')
  const pending = links.shorten(() => a.promise)
  links.setLongUrl('B')
  a.reject(new Error('old error'))
  assert.equal(await pending, null)
  await assert.rejects(links.shorten(async () => { throw new Error('current error') }), /current error/)
  assert.equal(links.pending, false)
  assert.equal(links.importUrl, 'B')
  await links.shorten(async () => 'short B')
  assert.equal(links.importUrl, 'short B')
})

test('duplicate shorten action does not dispatch another request', async () => {
  const links = useGeneratedLinks()
  const request = deferred()
  let calls = 0
  const shorten = () => { calls++; return request.promise }
  links.setLongUrl('A')
  const pending = links.shorten(shorten)
  assert.equal(await links.shorten(shorten), null)
  assert.equal(calls, 1)
  request.resolve('short A')
  await pending
})

test('page imports the new long link after regeneration', async () => {
  const vm = createPage()
  vm.$axios = { post: async () => ({ data: { Code: 1, ShortUrl: 'https://short.example/A' } }) }
  vm.makeUrlClick()
  await vm.makeShortUrlClick()
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
  let opened
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { open: url => { opened = url } } })
  try {
    vm.clashInstall()
    assert.equal(new URL(opened).searchParams.get('url'), 'https://short.example/A')
    vm.form.sourceSubUrl = 'https://source.example/B'
    vm.makeUrlClick()
    vm.clashInstall()
    assert.equal(new URL(opened).searchParams.get('url'), vm.customSubUrl)
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous)
    else delete globalThis.window
  }
})

for (const mode of ['success', 'false', 'throw']) {
  test(`upload retains URL when clipboard outcome is ${mode}`, async () => {
    let copiedUrl
    const axios = { post: async (endpoint, body) => {
      assert.equal(body.content, 'configuration')
      return { data: { code: 0, data: { url: 'https://config.example/result' } } }
    } }
    const result = await ConfigUploadService.uploadConfig(axios, 'configuration', async url => {
      copiedUrl = url
      if (mode === 'throw') throw new Error('clipboard denied')
      return mode === 'success'
    })
    assert.deepEqual(result, { url: 'https://config.example/result', copied: mode === 'success' })
    assert.equal(copiedUrl, result.url)
  })
}

test('rejected or malformed uploads never attempt copying', async () => {
  for (const data of [{ code: 1, msg: 'rejected' }, { code: 0, data: {} }, null]) {
    let copied = false
    await assert.rejects(ConfigUploadService.uploadConfig({ post: async () => ({ data }) }, 'config', async () => { copied = true }))
    assert.equal(copied, false)
  }
})

test('page blocks duplicate uploads and retains manual-copy recovery on success', async () => {
  const vm = createPage()
  const request = deferred()
  let calls = 0
  vm.$axios = { post: () => { calls++; return request.promise } }
  vm.dialogUploadConfigVisible = true
  const upload = vm.handleConfigUpload('first')
  assert.equal(vm.uploading, true)
  await vm.handleConfigUpload('second')
  vm.handleUploadCancel()
  assert.equal(vm.uploadConfig, 'first')
  assert.equal(vm.dialogUploadConfigVisible, true)
  assert.equal(calls, 1)
  // No browser clipboard exists in this test: the module must retain the upload result.
  request.resolve({ data: { code: 0, data: { url: 'https://config.example/result' } } })
  await upload
  assert.equal(vm.form.remoteConfig, 'https://config.example/result')
  assert.equal(vm.uploadResultUrl, vm.form.remoteConfig)
  assert.equal(vm.dialogUploadConfigVisible, true)
  assert.equal(vm.uploading, false)
})

test('failed upload retains existing remote config and allows retry', async () => {
  const vm = createPage()
  vm.form.remoteConfig = 'https://config.example/original'
  vm.$axios = { post: async () => { throw new Error('upload rejected') } }
  await vm.handleConfigUpload('configuration')
  assert.equal(vm.form.remoteConfig, 'https://config.example/original')
  assert.equal(vm.uploading, false)
  assert.match(vm.messages[0], /upload rejected/)
})

test('short-link resolution checks query parameters instead of the target substring', async () => {
  const fetchUrl = async (url, options) => {
    assert.equal(url, 'https://short.example/target-name')
    assert.equal(options.redirect, 'follow')
    return { url: importedUrl }
  }
  assert.equal(await ShortUrlService.resolveUrl('https://short.example/target-name', fetchUrl), importedUrl)
  const unexpectedFetch = async () => { assert.fail('direct URLs must not be fetched') }
  assert.equal(await ShortUrlService.resolveUrl(importedUrl, unexpectedFetch), importedUrl)
  assert.equal(await ShortUrlService.resolveUrl('invalid', unexpectedFetch), 'invalid')
  const cause = new TypeError('network')
  await assert.rejects(
    ShortUrlService.resolveUrl('https://short.example/a', async () => { throw cause }),
    error => {
      assert.match(error.message, /跨域/)
      assert.equal(error.cause, cause)
      return true
    }
  )
})

test('backend version URL is derived from every supported backend form', async () => {
  const { BackendService } = await server.ssrLoadModule('/src/services/backendService.js')
  const cases = [
    ['https://h.example/sub?', 'https://h.example/version'],
    ['https://h.example/sub', 'https://h.example/version'],
    ['https://h.example/sub?token=x', 'https://h.example/version'],
    ['https://h.example/api/sub?', 'https://h.example/api/version']
  ]
  for (const [backend, expected] of cases) {
    let requested
    const $axios = { get: async url => { requested = url; return { data: 'subconverter v0.9.0 backend' } } }
    await BackendService.getBackendVersion($axios, backend)
    assert.equal(requested, expected)
  }
})
