# ---- Base Node ----
FROM node:10.18.1 AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies
COPY package.json yarn.lock ./
RUN yarn install 

# ---- Copy Files/Build ----
FROM dependencies AS build
WORKDIR /app
COPY . /app
RUN yarn build

# --- Release ----
FROM node:10.18.1 AS release
WORKDIR /app
COPY --from=dependencies /app/package.json ./
# 安装 app 依赖
RUN yarn install
COPY --from=build /app ./

