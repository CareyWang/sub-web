FROM nginx:1.16

RUN mkdir -p /var/www/http \
    && chown -R www-data:www-data /var/www/http/ /var/log/nginx/ 

# 设置时区 && 同步时间
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
