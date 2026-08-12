# Vue 3 + Element Plus Migration Design

**Scope**
- Migrate the app from Vue 2.7 to Vue 3, and from Element UI 2 to Element Plus 2.
- Replace Vue-2-only dependencies that have no Vue 3 equivalent (`vue-clipboard2`, `vue-template-compiler`).
- Keep the current feature set, routing, page layout, and Chinese UI strings unchanged.
- Keep the existing Options API structure and the `composables/` + `services/` + `utils/` split intact.

**Non-goals**
- No `<script setup>` / Composition API rewrite. The existing `useXxx()` helpers stay plain functions spread into `data()` / `methods`.
- No TypeScript, no test runner, no state management library.
- No redesign. Visual work is limited to restoring parity with the current layout.

**Strategy**

Do a single big-bang migration on a dedicated branch. The app is ~1500 lines across 25 files with one route, no Vuex, no event bus, and no custom directives, so the configuration cost of `@vue/compat` would exceed the cost of migrating directly. All pure-JS modules (`composables/`, `services/`, `utils/`, `config/`) contain no Vue API usage and require zero changes.

**Target dependency set**

Versions below were resolved from the registry on 2026-08-12 and are compatible with the existing Vite 8 setup.

| Package | From | To | Note |
|---|---|---|---|
| `vue` | 2.7.16 | ^3.5.41 | |
| `vue-router` | 3.5.1 | ^4.6.4 | Not v5 — v5 adds `pinia` and `@pinia/colada` peer deps we do not need |
| `element-ui` | 2.15.1 | removed | |
| `element-plus` | — | ^2.14.4 | |
| `@element-plus/icons-vue` | — | ^2.3.2 | Required: Element Plus has no font icon classes |
| `unplugin-element-plus` | — | ^0.11.2 | On-demand style injection, see Bundle size below |
| `vue-clipboard2` | 0.3.1 | removed | Vue 2 only, unmaintained |
| `@vitejs/plugin-vue2` | 2.3.4 | removed | |
| `@vitejs/plugin-vue` | — | ^6.0.8 | Declares Vite `^8.0.0` support |
| `vue-template-compiler` | 2.7.16 | removed | |
| `eslint` | 8.56.0 | ^8.57.1 | `eslint-plugin-vue` 10 requires `^8.57.0` |
| `eslint-plugin-vue` | 9.17.0 | ^10.10.0 | Pulls `vue-eslint-parser` ^10.3.0 |

Stay on ESLint 8 with the existing `.eslintrc.js`. Moving to ESLint 9 flat config is a separate change and should not be bundled into this migration.

---

## Phase 1 — Toolchain and bootstrap

Goal: the app builds and the page renders under Vue 3, even if styling is off.

**`package.json`** — apply the dependency table above.

**`vite.config.js`** — swap `@vitejs/plugin-vue2` for `@vitejs/plugin-vue`, add `unplugin-element-plus`. Alias and server config are unchanged.

**`src/main.js`** — replace `new Vue({ render: h => h(App) }).$mount('#app')` with `createApp(App)`. The four plugin modules currently self-register against `Vue` at import time; convert each to export an `install(app)`-shaped function (or a plain function taking `app`) and call them in order before `app.use(router)` and `app.mount('#app')`. Drop `Vue.config.productionTip`, which no longer exists.

**`src/router/index.js`** — `new VueRouter({ mode: 'history', base })` becomes `createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })`. Remove `Vue.use(VueRouter)`. The single lazy-loaded route definition is otherwise unchanged.

**`src/plugins/axios.js`** — `Vue.prototype.$axios` becomes `app.config.globalProperties.$axios`.

**`src/plugins/device.js`** — `Vue.prototype.$getOS` becomes `app.config.globalProperties.$getOS`. The UA-sniffing body is unchanged.

**`src/plugins/clipboard.js`** — delete. See Phase 4.

**`src/icons/index.js`** — `Vue.component('svg-icon', SvgIcon)` becomes `app.component('svg-icon', SvgIcon)`.

**`src/plugins/element-ui.js`** — rename to `src/plugins/element-plus.js` and rewrite. The current file imports 20 components by explicit path to avoid Element UI's 1.2 MB CommonJS entry; that workaround is unnecessary for Element Plus, which ships ESM and tree-shakes. Register with a single `app.use(ElementPlus, { size: 'small', zIndex: 3000, locale: zhCn })`, replacing the `Vue.prototype.$ELEMENT` global config. Import `zhCn` from `element-plus/es/locale/lang/zh-cn`. The seven `Vue.prototype.$loading / $msgbox / $alert / $confirm / $prompt / $notify / $message` assignments are all provided by `app.use(ElementPlus)` as globals, so they can be deleted outright — but verify `this.$message` and `this.$notify` still resolve, since those are the only two actually used in the codebase.

Exit criterion: `yarn build` succeeds and `yarn dev` renders the page without console errors.

## Phase 2 — Template syntax

**Named slots.** 15 occurrences of the removed `slot="xxx"` attribute syntax must become `<template #xxx>`:

- `Subconverter.vue`: `el-card` header (L6); `el-autocomplete` append ×2 (L32, L41); `el-form-item` label (L55); `el-input` suffix ×2 (L56, L59); `el-popover` reference ×3 (L90, L102, L106); `el-input` append ×2 (L122, L128)
- `ConfigUploadDialog.vue`: `el-dialog` title (L9), `el-popover` reference (L13), `el-dialog` footer (L29)
- `UrlParseDialog.vue`: `el-dialog` title (L9), `el-dialog` footer (L19)

`Subconverter.vue` L41 is a `<el-button slot="append">` nested inside `el-select`. `el-select` has no `append` slot in either Element UI 2 or Element Plus, so this markup never rendered. Delete it rather than porting it.

**`$listeners` removal.** `SvgIcon/index.vue` L2 uses `v-on="$listeners"`, which does not exist in Vue 3. Remove the binding; the `@click="goToProject"` on the `<svg-icon>` call site in `Subconverter.vue` L8 will reach the root `<svg>` automatically through fallthrough attributes.

**Lifecycle hook.** `Subconverter.vue` L311 `beforeDestroy()` becomes `beforeUnmount()`.

**Render function.** `Subconverter.vue` L469 `const h = this.$createElement` becomes an `import { h } from 'vue'`. The `$notify` call passing an `h('i', { style: 'color: teal' }, '...')` VNode stays otherwise identical — Vue 3 still accepts a `style` string in the props object.

## Phase 3 — Element Plus API semantics

This is the phase most likely to introduce silent behaviour regressions. Each item is a deliberate semantic change, not a rename.

**Dialog visibility.** `el-dialog` drops `:visible.sync` in favour of `v-model`. Both `ConfigUploadDialog.vue` and `UrlParseDialog.vue` currently mirror the `visible` prop into a local `localVisible`, watch it, and re-emit `update:visible` — a workaround for `.sync`. Replace the whole pattern with a `computed` get/set backed by `this.$emit('update:visible', v)`, and have the parent bind `v-model:visible`. This removes three watchers per component. Note the parent in `Subconverter.vue` (L188-203) currently binds `:visible` one-way and drives closing through the `@cancel` / `@confirm` handlers, so `update:visible` is emitted but never consumed; wiring `v-model:visible` makes ESC/overlay dismissal work consistently.

**`el-radio` value prop.** The `label` prop is deprecated in favour of `value`. Affects the two mode radios in `Subconverter.vue` L15-16 (`advanced`).

**`el-checkbox` label semantics — highest-risk item.** All 13 checkboxes are bound to a boolean `v-model` and use `label="..."` purely as display text (L66, L70, L73, L76, L79, L82, L85, L88, L94, L97, L100). In Element Plus 2.6+, `label` means the checkbox's *value* within a group, so keeping this markup emits deprecation warnings and can make the bound boolean resolve incorrectly. Move every caption into the default slot: `<el-checkbox v-model="form.emoji">Emoji</el-checkbox>`. The `border` attribute on the Node List checkbox (L66) is unaffected. Verify each of the 13 bindings individually against `useSubscriptionForm.js` defaults, since a silent failure here corrupts generated subscription URLs without any visible error.

**`el-popover` visibility.** `Subconverter.vue` L68 binds `v-model="form.extraset"`; Element Plus requires `v-model:visible`.

**`el-button type="text"`.** Deprecated. `Subconverter.vue` L59 (the custom-param delete button) becomes `link`.

**Icons.** Element Plus removed font icon classes entirely. Every occurrence must import a component from `@element-plus/icons-vue`. The `el-button icon="..."` / `el-link icon="..."` string form becomes a component binding (`:icon="Link"`), and bare `<i class="el-icon-x">` becomes `<el-icon><X /></el-icon>`.

| Location | Old class | Element Plus component |
|---|---|---|
| `Subconverter.vue` L32, L41 | `el-icon-link` | `Link` |
| `Subconverter.vue` L59 | `el-icon-delete` | `Delete` |
| `Subconverter.vue` L105 | `el-icon-info` | `InfoFilled` |
| `Subconverter.vue` L107 | `el-icon-plus` | `Plus` |
| `Subconverter.vue` L117 | `el-icon-magic-stick` | `MagicStick` |
| `Subconverter.vue` L123, L129 | `el-icon-document-copy` | `DocumentCopy` |
| `Subconverter.vue` L157 | `el-icon-upload` | `UploadFilled` |
| `Subconverter.vue` L165 | `el-icon-connection` | `Connection` |
| `Subconverter.vue` L176 | `el-icon-copy-document` | `CopyDocument` |
| `ConfigUploadDialog.vue` L12 | `el-icon-info` | `InfoFilled` |
| `ConfigUploadDialog.vue` L13 | `el-icon-question` | `QuestionFilled` |

Import icons locally per component rather than registering all of them globally, to keep them tree-shakeable.

## Phase 4 — Clipboard replacement

`vue-clipboard2` is Vue 2 only and unmaintained. Replace it with the native Clipboard API in a small `src/utils/clipboard.js` helper exporting an async `copyText(text)`, keeping all network- and browser-facing code out of components as the existing layout does.

Call sites:
- Template directives, `Subconverter.vue` L122 and L128: `v-clipboard:copy` / `v-clipboard:success` on the two copy buttons become plain `@click` handlers that await `copyText(...)` and then show the success message.
- `this.$copyText(...)`, `Subconverter.vue` L352, L370, L395.
- `ConfigUploadService.handleUploadSuccess(res, this.$copyText, this.$message)` (`Subconverter.vue` L391) — the service takes `$copyText` as a parameter, so its signature must be updated to accept the new helper. This is the only `services/` change in the whole migration.

Note that `navigator.clipboard` requires a secure context. The app is served over HTTP in some self-hosted deployments, so `copyText` needs a graceful failure path: surface `this.$message.error` rather than throwing, and keep the generated URL visible in its (disabled) input so it can be selected manually.

## Phase 5 — Visual parity

Element Plus is a design refresh, not just a Vue 3 port: border radii, control heights, form item spacing, and popover shadows all differ from Element UI 2. This form is dense and contains hard-coded dimensions that will need re-checking:

- Fixed button widths: `buttonStyle` computed returning `140px` (`Subconverter.vue` L266-268) and the inline `290px` on the URL-parse button (L173).
- `el-input style="width: 565px"` inside `UrlParseDialog.vue` L15, paired with `label-width="85px"` in a 700px dialog.
- `label-width="140px"` on the main form and the `label-width="0px"` overrides on the button rows.
- The two `el-popover` panels stacking 7 and 3 checkboxes as one-per-`el-row`.
- The absolutely positioned version string in the card header (`Subconverter.vue` L10).

Walk the page at desktop and mobile widths. The `created()` hook reads `this.$getOS().isPc` into `isPC`, so confirm that path still works after the plugin conversion.

## Phase 6 — Lint and docs

Update `.eslintrc.js`: `plugin:vue/essential` becomes `plugin:vue/vue3-essential`. Keep `vue/multi-word-component-names: 'off'`, `semi: 0`, and the `@babel/eslint-parser` `parserOptions`. Expect `eslint-plugin-vue` 10 to surface new warnings; fix them rather than suppressing them, but do not expand scope into unrelated style rules.

Update `AGENTS.md` — the Quick Facts table, the `src/plugins/` entry, the Vue Patterns section (which currently states "do not introduce Composition API"), and the Docker/Node notes if anything shifts.

---

**Bundle size**

The current `plugins/element-ui.js` deliberately imports 20 components by path to keep the Element UI CommonJS entry out of the bundle, but it still pulls the full `theme-chalk/index.css`. Element Plus's full stylesheet is larger, so `app.use(ElementPlus)` plus a blanket CSS import would regress size. `unplugin-element-plus` injects only the styles for components actually used, which is why it is in the dependency set. Record `dist/` size before and after and compare; treat a significant regression as a blocker for the phase, not a follow-up.

**Risks**

| Risk | Severity | Mitigation |
|---|---|---|
| `el-checkbox` `label` semantics silently corrupt generated URLs | High | Move all 13 captions to the default slot; manually verify each generated query string against the pre-migration output |
| No test suite, so all regressions are caught by hand | High | Use the manual checklist below; diff generated URLs before/after for a fixed set of inputs |
| Clipboard fails on non-HTTPS self-hosted deployments | Medium | Explicit error message and manual-select fallback |
| Element Plus visual drift on a dense form | Medium | Dedicated Phase 5, screenshots before/after |
| Bundle size regression | Medium | `unplugin-element-plus`, measure `dist/` |
| `analyzeUrl` short-link expansion depends on CORS, unrelated to Vue | Low | Out of scope; do not change behaviour |

**Validation**

- `yarn install` and regenerate `yarn.lock`.
- `yarn lint`.
- `yarn build`, and compare `dist/` size against the pre-migration baseline.
- `yarn preview` and `yarn dev` smoke test.
- Functional checklist, run against both the old and new build with identical inputs:
  1. Basic mode generates a correct subscription URL; advanced mode adds remote config, include/exclude, filename, and template params.
  2. All 13 advanced checkboxes toggle the expected query parameter, including the `udp` / `needUdp` interaction and the nested `tpl.surge.doh` / `tpl.clash.doh`.
  3. Add and delete custom params; confirm the delete button and the `el-form-item` label slot both render.
  4. Short-link generation, and the copy-to-clipboard success message on both copy buttons.
  5. Config upload dialog: open, cancel, submit, ESC/overlay dismissal, auto-fill of the remote config field.
  6. URL parse dialog: parse a long URL and a short URL, confirm every form field round-trips.
  7. One-click Clash import.
  8. Backend version string renders in the card header; `localStorage` URL cache restores on reload when `VITE_USE_STORAGE=true`.
  9. Mobile viewport rendering.

**Rollback**

Work on a branch and land as a single squashed commit so revert is one operation. The Docker image is built from `master` on push, so do not merge until the functional checklist passes in `yarn preview`.

---

## Execution notes

Deviations from the plan above, recorded while implementing on `feat/vue3-element-plus`.

**`eslint-plugin-vue` stays on 9.x, not 10.x.** The dependency table specified ^10.10.0, which is incompatible with the decision to keep `.eslintrc.js`: v10 ships flat configs only and no longer exports `plugin:vue/vue3-essential`. Since migrating to ESLint 9 flat config was explicitly out of scope, the plugin was pinned to ^9.33.0 (the last 9.x), which supports eslintrc and bundles `vue-eslint-parser` as a direct dependency. ESLint itself stays at ^8.57.1.

**Element Plus is registered per component, not via `app.use(ElementPlus)`.** The plan called for a single full install. That defeats `unplugin-element-plus`, whose style injection only applies to named imports, and would have forced a full `element-plus/dist/index.css` import. `src/plugins/element-plus.js` therefore keeps the existing explicit component list, matching the pattern the old `element-ui.js` used for the same reason.

**Global size/zIndex/locale moved to `ElConfigProvider` in `App.vue`.** Without a full install there is no options object to pass `locale` to, so `$ELEMENT = { size: 'small', zIndex: 3000 }` is replaced by `<el-config-provider :locale="zhCn" size="small" :z-index="3000">` wrapping `<router-view>`.

**Clipboard keeps an `execCommand` fallback.** `vue-clipboard2` wraps clipboard.js, which uses `document.execCommand('copy')` and works over plain HTTP. Replacing it with only `navigator.clipboard` would have been a regression for HTTP self-hosted deployments, not merely a degraded error path. `src/utils/clipboard.js` tries `navigator.clipboard` in a secure context and falls back to a hidden textarea plus `execCommand`, surfacing an error toast only if both fail.

**`el-popover` needs an explicit `trigger="click"`.** Not anticipated in the plan: Element UI 2 defaults `trigger` to `click`, Element Plus defaults it to `hover`. The 更多选项 and 定制功能 popovers rely on click-to-open, so both now set it explicitly. Popover margin also had to move from the `el-popover` element to its reference button, since the Element Plus popover root is the teleported popper rather than a wrapper around the trigger.

**Two layout regressions from Element Plus flex defaults**, fixed with a scoped `<style>` block in `Subconverter.vue` (previously the file had none):
- `.el-form-item__content` is now a flex container, so `text-align: center` no longer centres the three action button rows. Replaced with `justify-content: center` via a `.actions-row` class.
- `el-row` defaults to `flex-wrap: wrap` (Element UI 2 did not wrap), and the row is itself a flex item of `__content` so it no longer fills the available width. The options row needed `width: 100%`, `flex-wrap: nowrap`, and `flex: 1` on its `el-col` to restore the "checkbox left, buttons right" layout. Verified numerically: action buttons land at x=814/815 versus the baseline's 815, and the options buttons at x=1691 versus 1667 (the 24px delta is Element Plus's narrower buttons, 72px versus 80px).

**Dead markup removed.** The `<el-button slot="append">配置示例</el-button>` nested in the 远程配置 `el-select` never rendered in either library, so it and its now-unused `gotoRemoteConfig` method were deleted rather than ported.

**Measured bundle sizes** (gzip): JS 121.5 kB → 156.8 kB, CSS 33.8 kB → 18.8 kB, and the 84 kB Element UI icon font is gone entirely. Total `dist/` 1.1M → 1.0M, so the net transfer is lower despite the heavier runtime. No blocker.

**Mobile layout is cramped at 390px, but this predates the migration** — in the Vue 2 baseline the `+` button overflows the card edge and the bottom buttons are clipped, both of which are marginally better after the migration. Left alone to avoid scope creep; worth a separate responsive pass.
