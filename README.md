# my-first-project

本仓库整理了两个购物/商城相关项目：

- `零食铺子`：微信小程序端 + Node.js/Express/MySQL 后端，面向宿舍零食商城场景。
- `shopping`：Vue 3 + Vite 商城后台管理前端 + ThinkJS/MySQL 后端。

项目中的 `.env`、本地上传文件、依赖目录和构建产物已通过 `.gitignore` 忽略，不会提交到 GitHub。

## 项目功能

### 零食铺子

- 微信小程序页面：商品分类、购物车、订单、我的、商品详情、提交订单、支付、支付成功、收藏、优惠券、后台入口。
- 后端接口：用户认证、分类、商品、订单、优惠券、用户优惠券、模拟订单、模拟支付。
- 数据库脚本：商品、分类、订单、地址、销量、商品图片、模拟支付等初始化/扩展 SQL。

### shopping

- Vue 管理端页面：登录、后台首页、侧边栏/顶部布局、商品管理、分类管理、个人资料、图表看板。
- ThinkJS 后端模块：管理员登录、管理员管理、商品、分类、上传、用户登录/注册等控制器。
- 前端使用 Axios 调用接口，使用 Element Plus 构建后台 UI，使用 ECharts 展示图表。

## 技术栈

- 微信小程序：原生小程序页面、WXML、WXSS、JavaScript。
- 零食铺子后端：Node.js、Express、MySQL、mysql2、JWT、CORS、Helmet、dotenv。
- shopping 前端：Vue 3、Vite、Vue Router、Element Plus、Axios、ECharts。
- shopping 后端：ThinkJS 3、MySQL、think-model、think-session、JWT Session。

## 项目运行

### 运行零食铺子后端

```bash
cd 零食铺子/server
npm install
copy .env.example .env
npm run dev
```

运行前请在 `.env` 中填写本地 MySQL 连接信息和 JWT 配置。`.env` 文件不会被提交到 GitHub。

### 打开零食铺子微信小程序

使用微信开发者工具导入 `零食铺子` 目录。项目配置中的小程序根目录为 `miniprogram/`。

### 运行 shopping 前端

```bash
cd shopping/shopping
npm install
npm run dev
```

### 运行 shopping 后端

```bash
cd shopping/shop-backend
npm install
npm start
```

后端需要先准备对应的 MySQL 数据库配置。

## 项目结构

```text
.
├── 零食铺子/
│   ├── miniprogram/      # 微信小程序源码
│   ├── server/           # Express 后端服务
│   └── project.config.json
├── shopping/
│   ├── shopping/         # Vue 3 + Vite 管理端
│   └── shop-backend/     # ThinkJS 后端服务
├── .gitignore
└── README.md
```

## GitHub 更新方式

以后修改代码后，在仓库根目录执行：

```bash
git status
git add .
git commit -m "feat: 描述这次修改内容"
git push
```
