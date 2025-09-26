# 管理系统后端服务

基于 Node.js + Express + TypeScript + MongoDB + Redis 构建的管理系统后端API服务。

## 技术栈

- **运行环境**: Node.js 18+
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MongoDB (Mongoose)
- **缓存**: Redis
- **认证**: JWT
- **验证**: Joi + Express Validator
- **安全**: Helmet + CORS + Rate Limiting

## 项目结构

```
src/
├── config/          # 配置文件
├── controllers/     # 控制器
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由
├── services/        # 业务逻辑
├── utils/           # 工具函数
├── types/           # 类型定义
└── app.ts           # 应用入口
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制 `env.example` 为 `.env` 并修改配置：

```bash
cp env.example .env
```

### 3. 启动服务

开发环境：
```bash
npm run dev
```

生产环境：
```bash
npm run build
npm start
```

## API 文档

### 认证相关

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新令牌
- `GET /api/auth/profile` - 获取用户信息

### 用户管理

- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

## 开发规范

- 使用 TypeScript 严格模式
- 遵循 RESTful API 设计规范
- 统一的错误处理和响应格式
- 完整的请求参数验证
- 详细的日志记录

## 部署

1. 确保 MongoDB 和 Redis 服务正常运行
2. 配置生产环境变量
3. 构建项目：`npm run build`
4. 启动服务：`npm start`
