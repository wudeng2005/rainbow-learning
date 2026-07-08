---
kind: dependency_management
name: NPM 依赖管理（React + Vite 单仓）
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - vite.config.ts
    - .gitignore
---

## 依赖管理系统概述

该项目采用标准的 NPM 包管理器进行依赖管理，基于 React + Vite 技术栈的前端学习应用。项目使用锁定文件确保依赖版本一致性，并通过私有镜像源加速国内访问。

## 核心配置文件

### package.json - 依赖声明中心
- **运行时依赖**：React 19、Zustand 状态管理、Supabase 客户端、TailwindCSS v4、Framer Motion 动画库、React Router v7
- **开发依赖**：Vite 8、TypeScript 6、ESLint 10、@vitejs/plugin-react 插件
- **模块系统**：采用 ES Module (`"type": "module"`) 规范
- **构建脚本**：`dev`、`build`、`lint`、`preview` 标准命令

### package-lock.json - 依赖锁定文件
- **锁定格式**：lockfileVersion 3 (npm v7+ 格式)
- **镜像源配置**：所有依赖通过 `registry.anpm.alibaba-inc.com` 阿里私有镜像源下载
- **完整性校验**：包含每个包的 sha512 integrity hash，确保安装可重现性

### vite.config.ts - 构建期依赖
- **插件体系**：`@vitejs/plugin-react` + `@tailwindcss/vite`
- **路径别名**：`@/` 指向 `./src` 目录
- **模块解析**：基于 Node.js 模块解析策略

## 依赖分类与架构

### 生产环境依赖
- **UI 框架**：React 19.2.6 + react-dom 19.2.6
- **状态管理**：Zustand 5.0.14 (轻量级状态管理)
- **路由系统**：react-router-dom 7.18.0
- **样式方案**：TailwindCSS 4.3.1 + @tailwindcss/vite 4.3.1
- **动画库**：framer-motion 12.40.0
- **数据库客户端**：@supabase/supabase-js 2.108.2

### 开发环境依赖
- **类型系统**：TypeScript ~6.0.2 + @types/react + @types/react-dom
- **代码质量**：ESLint 10.3.0 + typescript-eslint 8.59.2
- **构建工具**：Vite 8.0.12 + @vitejs/plugin-react 6.0.1
- **Node 类型**：@types/node 24.12.3

## 版本管理策略

### 语义化版本控制
- **主版本升级**：使用 `^` 前缀允许小版本和补丁版本更新
- **精确版本**：TypeScript 使用 `~` 仅允许补丁版本更新
- **兼容性保证**：React 19 生态保持向后兼容

### 依赖树优化
- **扁平化结构**：node_modules 采用扁平化依赖树，减少重复安装
- **共享依赖**：多个包共享 common 依赖，优化存储空间
- **Tree Shaking**：利用 Vite 的 ESM 特性实现按需打包

## 部署与环境配置

### 环境变量管理
- `.env.local` 文件用于本地环境变量配置
- Supabase 客户端配置通过环境变量注入

### 构建产物
- **输出目录**：`dist/` 目录存放构建产物
- **静态资源**：`public/` 目录中的音频文件和图片直接复制到构建产物
- **忽略规则**：`.gitignore` 排除 `node_modules`、`dist`、`.vercel` 等目录

## 开发者规范

### 依赖安装规范
- 统一使用 `npm install` 命令，避免混用不同包管理器
- 提交 `package-lock.json` 确保团队依赖一致性
- 新增依赖时明确区分 `dependencies` 和 `devDependencies`

### 版本升级策略
- 定期执行 `npm update` 检查安全更新
- 重大版本升级前在开发环境充分测试
- 遵循 React 生态的版本兼容性矩阵

### 私有镜像配置
- 项目已配置阿里私有镜像源，提升国内下载速度
- 确保 CI/CD 环境也使用相同的镜像源配置
- 网络故障时可回退到官方 npm registry