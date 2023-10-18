# sub-web

基于 vue-cli 与 [tindy2013/subconverter](https://github.com/tindy2013/subconverter) 后端实现的配置自动生成。

## Table of Contents

- [ChangeLog](#ChangeLog)
- [Docker](#Docker)
- [Requirements](#Requirements)
- [Install](#install)
- [Usage](#usage)
- [Related](#Related)
- [Contributing](#contributing)
- [License](#license)

## ChangeLog

- 20200730

  - 独立各类后端配置到 .env 文件中，现在修改后端只需要修改 .env 即可。


## Docker

> 挂载自定义的 后端选项 和 规则选项 的 remoteConfig.json & backendOptions.json

```shell


docker run -d \
 -p 58080:80 \
 --restart always \
 --name subweb \
 -v /path/config:/usr/share/nginx/html/config
 alphal/subweb:latest


```

#### backendOptions.json

> 自定义后端服务地址

```json

[
  {
    "value": "http://127.0.0.1:25500/sub?"
  }
]


```

#### remoteConfig.json

> 自定义规则配置

```json

[
  {
    "label": "ACL4SSR",
    "options": [
      {
        "label": "ACL4SSR_Online 默认版 分组比较全 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini"
      },
      {
        "label": "ACL4SSR_Online_AdblockPlus 更多去广告 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_AdblockPlus.ini"
      },
      {
        "label": "ACL4SSR_Online_NoAuto 无自动测速 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoAuto.ini"
      },
      {
        "label": "ACL4SSR_Online_NoReject 无广告拦截规则 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoReject.ini"
      },
      {
        "label": "ACL4SSR_Online_Mini 精简版 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini.ini"
      },
      {
        "label": "ACL4SSR_Online_Mini_AdblockPlus.ini 精简版 更多去广告 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_AdblockPlus.ini"
      },
      {
        "label": "ACL4SSR_Online_Mini_NoAuto.ini 精简版 不带自动测速 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_NoAuto.ini"
      },
      {
        "label": "ACL4SSR_Online_Mini_Fallback.ini 精简版 带故障转移 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_Fallback.ini"
      },
      {
        "label": "ACL4SSR_Online_Mini_MultiMode.ini 精简版 自动测速、故障转移、负载均衡 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiMode.ini"
      },
      {
        "label": "ACL4SSR_Online_Full 全分组 重度用户使用 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini"
      },
      {
        "label": "ACL4SSR_Online_Full_NoAuto.ini 全分组 无自动测速 重度用户使用 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_NoAuto.ini"
      },
      {
        "label": "ACL4SSR_Online_Full_AdblockPlus 全分组 重度用户使用 更多去广告 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_AdblockPlus.ini"
      },
      {
        "label": "ACL4SSR_Online_Full_Netflix 全分组 重度用户使用 奈飞全量 (与Github同步)",
        "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Netflix.ini"
      },
      {
        "label": "ACL4SSR 本地 默认版 分组比较全",
        "value": "config/ACL4SSR.ini"
      },
      {
        "label": "ACL4SSR_Mini 本地 精简版",
        "value": "config/ACL4SSR_Mini.ini"
      },
      {
        "label": "ACL4SSR_Mini_NoAuto.ini 本地 精简版+无自动测速",
        "value": "config/ACL4SSR_Mini_NoAuto.ini"
      },
      {
        "label": "ACL4SSR_Mini_Fallback.ini 本地 精简版+fallback",
        "value": "config/ACL4SSR_Mini_Fallback.ini"
      },
      {
        "label": "ACL4SSR_BackCN 本地 回国",
        "value": "config/ACL4SSR_BackCN.ini"
      },
      {
        "label": "ACL4SSR_NoApple 本地 无苹果分流",
        "value": "config/ACL4SSR_NoApple.ini"
      },
      {
        "label": "ACL4SSR_NoAuto 本地 无自动测速 ",
        "value": "config/ACL4SSR_NoAuto.ini"
      },
      {
        "label": "ACL4SSR_NoAuto_NoApple 本地 无自动测速&无苹果分流",
        "value": "config/ACL4SSR_NoAuto_NoApple.ini"
      },
      {
        "label": "ACL4SSR_NoMicrosoft 本地 无微软分流",
        "value": "config/ACL4SSR_NoMicrosoft.ini"
      },
      {
        "label": "ACL4SSR_WithGFW 本地 GFW列表",
        "value": "config/ACL4SSR_WithGFW.ini"
      }
    ]
  }
]

```

若需要对代码进行修改，你需要在本地构建镜像并运行。
注：每次修改代码，你都需要重新执行 docker build 来执行打包操作。

```shell
docker -v
Docker version 23.0.4, build f480fb1

docker build -t subweb-local:latest .
docker run -d -p 58080:80 --restart always --name subweb subweb-local:latest
```

## Requirements

你需要安装 [Node](https://nodejs.org/zh-cn/) 与 [Yarn](https://legacy.yarnpkg.com/en/docs/install) 来安装依赖与打包发布。你可以通过以下命令查看是否安装成功。
注：以下步骤为 Ubuntu 下相应命令，其他系统请自行修改。为了方便后来人解决问题，有问题请发 issue。

```shell
node -v
v16.20.0

yarn -v
1.22.19
```

## Install

```shell
yarn install
```

## Usage

```shell
yarn serve
```

浏览器访问 <http://localhost:8080/>

## Deploy

发布到线上环境，你需要安装依赖，执行以下打包命令，生成的 dist 目录即为发布目录。如需修改默认后端，请修改 src/views/Subconverter.vue 中 **defaultBackend** 配置项。

```shell
yarn build
```

你需要安装 nginx (或其他 web 服务器)并正确配置。以下为示例配置，你需要修改 example.com 为自己域名并配置正确的项目根路径（https 自行配置）。

```shell
server {
    listen 80;
    server_name example.com;

    root /var/www/http/sub-web/dist;
    index index.html index.htm;

    error_page 404 /index.html;

    gzip on; #开启gzip压缩
    gzip_min_length 1k; #设置对数据启用压缩的最少字节数
    gzip_buffers 4 16k;
    gzip_http_version 1.0;
    gzip_comp_level 6; #设置数据的压缩等级,等级为1-9，压缩比从小到大
    gzip_types text/plain text/css text/javascript application/json application/javascript application/x-javascript application/xml; #设置需要压缩的数据格式
    gzip_vary on;

    location ~* \.(css|js|png|jpg|jpeg|gif|gz|svg|mp4|ogg|ogv|webm|htc|xml|woff)$ {
        access_log off;
        add_header Cache-Control "public,max-age=30*24*3600";
    }
}
```

## Related

- [tindy2013/subconverter](https://github.com/tindy2013/subconverter)
- [CareyWang/MyUrls](https://github.com/CareyWang/MyUrls)

## Contributing

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2020 CareyWang
