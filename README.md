# sub-web

基于 vue-cli 与 [tindy2013/subconverter](https://github.com/tindy2013/subconverter) 后端实现的配置自动生成。

## Table of Contents

- [Requirements](#Requirements)
- [Install](#install)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Requirements
你需要安装 [Node](https://nodejs.org/zh-cn/) 与 [Yarn](https://legacy.yarnpkg.com/en/docs/install) 来安装依赖与打包发布。你可以通过以下命令查看是否安装成功。

```
node -v
yarn -v
```

## Install

```
yarn install
```

## Usage

```
yarn serve
```

浏览器访问 http://localhost:8081/

## Deploy

发布到线上环境，你需要安装依赖，执行以下打包命令，生成的 dist 目录即为发布目录。

```
yarn build
```

你需要安装 nginx (或其他 web 服务器)并正确配置。以下为示例配置，你需要修改 example.com 为自己域名（并自行配置 https）并配置正确的项目根路径。

```
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

## Contributing

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2020 CareyWang
