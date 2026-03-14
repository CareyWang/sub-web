# Vite 8 Upgrade Design

**Scope**
- Upgrade Vite from 5 to 8.
- Upgrade Vite-adjacent dependencies that are required for compatibility.
- Keep the existing Vue 2 + Element UI app structure intact.

**Approach**
- Use the direct upgrade path recommended by the Vite 8 docs for typical projects.
- Align the Vue 2 toolchain with `@vitejs/plugin-vue2` expectations by moving Vue and `vue-template-compiler` to 2.7.x.
- Remove unused Vite-only plugins that add upgrade surface without providing value.
- Update `vite.config.js` to use Node ESM-safe path helpers instead of relying on CommonJS globals.

**Validation**
- Install dependencies and regenerate `yarn.lock`.
- Run `yarn build`.
- Run `yarn lint`.
