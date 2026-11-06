# sub-web

![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)
![Node](https://img.shields.io/badge/Node-24.x-green.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

基于 Vue 3 + Element Plus 与 [tindy2013/subconverter](https://github.com/tindy2013/subconverter) 后端实现的订阅配置自动生成 Web 界面。

## ✨ 特性

- 基于 Vue 3 + Element Plus 的现代化界面
- Vite 8 构建，热重载开发体验
- 模块化架构：composables / services / utils / config 分层
- SVG 图标精灵（vite-plugin-svg-icons）
- 本地存储缓存，TTL 可配置
- 短链接与配置文件上传集成
- 一键导入 Clash
- Docker 一键部署，支持运行时环境变量

## 🚀 快速开始

### 使用 Docker（推荐）

```bash
docker run -d \
  -p 58080:80 \
  --restart always \
  --name subweb \
  -e VITE_SUBCONVERTER_DEFAULT_BACKEND=https://your-subconverter.example.com \
  careywong/subweb:latest
```

访问 <http://localhost:58080/>

> 该镜像只包含 sub-web 前端静态文件，不包含 subconverter 后端。生成订阅链接前需要另行部署 subconverter，并在页面“后端地址”中填写，或通过 `VITE_SUBCONVERTER_DEFAULT_BACKEND` 指定默认地址。

### 本地开发

```bash
git clone https://github.com/CareyWang/sub-web.git
cd sub-web
yarn install
yarn dev
```

访问 <http://localhost:5173/>

## 📦 环境要求

- **Node.js**: 24.x
- **Yarn**: 1.22+
- **Docker**: 20.10+（可选）

## 🛠️ 常用命令

| 命令 | 说明 |
|------|------|
| `yarn dev` | 启动开发服务器 |
| `yarn build` | 构建生产版本 |
| `yarn preview` | 本地预览构建产物 |
| `yarn lint` | ESLint 代码检查 |
| `node --test tests/subscription-workflows.test.mjs` | 运行订阅工作流回归测试 |

## ⚙️ 环境配置

创建 `.env` 文件（参考如下）：

```env
# Subconverter 后端地址（可写裸域名、/sub 或 /sub?）
VITE_SUBCONVERTER_DEFAULT_BACKEND=https://api.wcc.best

# 项目与社区链接
VITE_PROJECT=https://github.com/CareyWang/sub-web
VITE_BOT_LINK=https://t.me/subconverter_discuss

# 后端版本页
VITE_BACKEND_RELEASE=https://github.com/tindy2013/subconverter/actions

# 远程配置示例与进阶文档
VITE_SUBCONVERTER_REMOTE_CONFIG=https://raw.githubusercontent.com/tindy2013/subconverter/master/base/config/example_external_config.ini
VITE_SUBCONVERTER_DOC_ADVANCED=https://github.com/tindy2013/subconverter/blob/master/README-cn.md

# 短链接后端
VITE_MYURLS_API=https://suosuo.de/short

# 配置文件托管后端
VITE_CONFIG_UPLOAD_API=https://oss.wcc.best/upload

# 本地存储与缓存 TTL（秒）
VITE_USE_STORAGE=true
VITE_CACHE_TTL=86400
```

### 构建时配置

`.env` 中的 `VITE_*` 会在 `yarn build` 时写入静态文件。修改 `.env` 后需要重新构建；运行中的容器不会读取 `.env`。

### Docker 运行时配置

Docker 镜像会在容器启动时根据环境变量生成 `/usr/share/nginx/html/config.js`，因此可以直接用 `-e` 覆盖配置，无需重新构建镜像：

```bash
docker run -d \
  -p 58080:80 \
  --restart always \
  --name subweb \
  -e VITE_SUBCONVERTER_DEFAULT_BACKEND=https://sub.example.com \
  -e VITE_MYURLS_API=https://short.example.com/short \
  -e VITE_CONFIG_UPLOAD_API=https://config.example.com/upload \
  careywong/subweb:latest
```

支持运行时覆盖的变量：

| 变量 | 说明 |
|------|------|
| `VITE_SUBCONVERTER_DEFAULT_BACKEND` | 默认 subconverter 地址，可写裸域名、`/sub` 或 `/sub?` |
| `VITE_MYURLS_API` | 短链接接口 |
| `VITE_CONFIG_UPLOAD_API` | 配置上传接口 |
| `VITE_PROJECT` | 项目链接 |
| `VITE_BOT_LINK` | 社区链接 |
| `VITE_BACKEND_RELEASE` | 后端版本页 |
| `VITE_SUBCONVERTER_REMOTE_CONFIG` | 远程配置示例 |
| `VITE_SUBCONVERTER_DOC_ADVANCED` | 进阶文档 |
| `VITE_USE_STORAGE` | 是否启用本地缓存（`true` / `false`） |
| `VITE_CACHE_TTL` | 缓存 TTL（秒） |

未设置或为空的变量会回退到构建时 `.env` 的值。

### 子路径部署

如果部署在子路径（如 `/sub-web/`），在构建时指定 base：

```bash
yarn build --base=/sub-web/
```

或在 `vite.config.js` 中设置 `base: '/sub-web/'`。

`BASE_URL` 是 Vite 的内置变量，不是可以在 `.env` 中覆盖的配置项；子路径必须通过 `base` 设置。

Docker 构建同样支持：

```bash
docker build --build-arg BASE_PATH=/sub-web/ -t subweb-local:latest .
```

使用子路径时，反向代理需要把 `/sub-web/` 前缀转发到容器根路径，或为静态目录配置对应的 `alias`。

### 自定义远程配置

编辑 `src/config/remote-configs.js`，在对应分组中添加 `{ label, value }`，然后重新构建；也可以在页面“远程配置”下拉框中直接输入配置 URL。默认模板来自该文件中的 `REMOTE_CONFIGS`，不是 `.env` 中的示例配置。

### 配置上传服务

`VITE_CONFIG_UPLOAD_API` 指向外部配置托管服务。仓库的 `services/` 只包含短链接服务（myurls + redis），不包含配置上传服务。自建时把该变量替换为你的上传接口，接口需返回：

```json
{ "code": 0, "data": { "url": "https://config.example.com/result" }, "msg": "" }
```

## 📁 目录结构

```
src/
├── main.js              # 应用入口，插件注册
├── App.vue
├── router/              # Vue Router（history 模式）
├── views/
│   └── Subconverter.vue # 主页面
├── components/          # 可复用组件（弹窗等）
├── composables/         # 共享逻辑（表单、订阅、URL 解析）
├── services/            # API 封装（后端版本、短链接、配置上传）
├── config/              # 常量、客户端类型、远程配置列表
├── utils/               # 工具函数（storage、validators、formatters）
├── plugins/             # Vue 插件注册（Element Plus、Axios 等）
└── icons/svg/           # SVG 精灵图源文件
docker/                  # 容器启动脚本（运行时配置生成）
public/                  # 静态资源与 config.js 占位文件
tests/                   # 订阅工作流回归测试
```

## 🐳 Docker 部署

### 本地构建

```bash
docker build -t subweb-local:latest .

docker run -d \
  -p 58080:80 \
  --restart always \
  --name subweb \
  -e VITE_SUBCONVERTER_DEFAULT_BACKEND=https://your-subconverter.example.com \
  subweb-local:latest
```

### Docker Compose（含短链接服务）

```bash
cd services

# 编辑 .env，配置端口、域名和运行时变量
# 默认：SUBWEB_PORT=58080, MYURLS_PORT=8002, MYURLS_DOMAIN=example.com
vim .env

docker-compose up -d
```

在 `services/.env` 中添加 `VITE_*` 变量后，这些变量会传入 subweb 容器，覆盖镜像内的默认配置。

## 🌐 Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/sub-web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /config.js {
        add_header Cache-Control "no-store";
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    gzip_min_length 1k;

    location ~* \.(css|js|png|jpg|svg|woff2|ttf|eot)$ {
        add_header Cache-Control "public,max-age=86400";
    }
}
```

## ☁️ Netlify 部署

在 Netlify 中导入仓库后使用以下设置：

- **Build command**: `yarn build`
- **Publish directory**: `dist`
- **Node version**: `24`

如果需要子路径部署，在 `netlify.toml` 中设置 `build.command = "yarn build --base=/子路径/"`，并确保发布目录与 base 匹配。

## ❓ 常见问题

### Docker 生成的订阅链接返回 404

页面中的“后端地址”应填写 subconverter 服务地址，例如 `http://<host>:25500/sub?`。不要填写 sub-web 自己的地址（如 `http://127.0.0.1:58080/sub?`）——该容器只托管前端静态文件，没有 `/sub` 转换接口。

### `docker run -e` 设置的环境变量不生效

确认镜像包含运行时配置脚本（当前镜像会在启动时生成 `config.js`），并使用 `VITE_` 前缀的变量名。旧镜像只在构建时读取 `.env`，需要重新构建。浏览器缓存了旧的 `config.js` 时，强制刷新页面。

### 部署到子路径后白屏或资源 404

使用 `yarn build --base=/子路径/` 构建，并让 Web 服务器把该前缀映射到 `dist` 目录；Nginx 还需要 `try_files $uri $uri/ /index.html` 支持 history 路由。

### Node 版本不兼容

项目要求 Node.js 24.x。使用 `node -v` 确认版本，或在 CI/本地通过 `.nvmrc`、`nvm use 24` 切换。

## 🔗 相关项目

- **[tindy2013/subconverter](https://github.com/tindy2013/subconverter)** - 订阅转换后端
- **[CareyWang/MyUrls](https://github.com/CareyWang/MyUrls)** - 短链接服务

## 🤝 贡献

1. Fork 本仓库
2. 创建特性分支 `git checkout -b feature/AmazingFeature`
3. 提交更改 `git commit -m 'Add some AmazingFeature'`
4. 推送到分支 `git push origin feature/AmazingFeature`
5. 创建 Pull Request

代码风格：2 空格缩进、单引号、无分号，遵循 ESLint 配置。

## 📄 许可证

MIT License — Copyright © 2020-2025 CareyWang

## 📈 项目统计

<a href="https://star-history.dera.page/#CareyWang/sub-web&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://star-history.dera.page/svg?repos=CareyWang/sub-web&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://star-history.dera.page/svg?repos=CareyWang/sub-web&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://star-history.dera.page/svg?repos=CareyWang/sub-web&type=date&legend=top-left" />
 </picture>
</a>
