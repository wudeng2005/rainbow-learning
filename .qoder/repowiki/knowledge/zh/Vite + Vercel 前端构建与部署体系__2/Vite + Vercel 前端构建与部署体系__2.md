---
kind: build_system
name: Vite + Vercel 前端构建与部署体系
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.ts
    - vercel.json
    - tsconfig.json
    - tsconfig.app.json
    - tsconfig.node.json
---

本项目采用轻量级现代前端构建方案，以 Vite 为核心构建工具，配合 TypeScript、React 和 Tailwind CSS，通过 Vercel 平台进行静态站点部署。

## 构建系统架构

核心工具链：
- 构建器：Vite 8（开发服务器与生产打包）
- 运行时框架：React 19 + React Router DOM 7
- 样式方案：Tailwind CSS 4（通过 @tailwindcss/vite 插件集成）
- 类型系统：TypeScript 6，采用 Project References 多项目配置
- 状态管理：Zustand 5
- 后端交互：Supabase JS SDK

构建脚本（package.json scripts）：
- dev：启动 Vite 开发服务器
- build：先执行 tsc -b 进行增量类型检查，再调用 vite build 打包
- lint：使用 ESLint 10 进行代码检查
- preview：本地预览生产构建产物

## TypeScript 多项目配置

采用分层的 tsconfig 结构：
- tsconfig.json：根引用文件，聚合 app 和 node 两个子项目
- tsconfig.app.json：应用源码编译配置，目标 ES2023，启用 verbatimModuleSyntax、moduleDetection: force 等严格模式
- tsconfig.node.json：Node.js 环境配置，仅包含 vite.config.ts

关键编译器选项：
- noEmit: true：由 Vite 负责输出，TypeScript 仅做类型检查
- paths 别名：@/* → ./src/*，与 Vite resolve.alias 保持一致
- skipLibCheck: true：跳过第三方库类型检查以提升构建速度

## Vite 构建配置

vite.config.ts 配置简洁，主要包含：
- React JSX 转换插件
- Tailwind CSS 处理插件
- 路径别名映射 @ → ./src

## 部署与缓存策略

Vercel 部署配置（vercel.json）：
- 构建命令：npm run build
- 输出目录：dist
- 框架识别：vite
- SPA 路由重写：所有非静态资源请求重定向到 index.html
- 缓存策略：
  - /assets/*：强缓存 1 年（immutable）
  - /audio/*：缓存 7 天

## 数据生成脚本

项目包含独立的 Python 脚本目录 scripts/，用于生成学习内容和音频资源：
- 汉字相关：字符信息、拼音音频、题目生成
- 英语相关：单词/句子音频、题目生成
- 数学相关：算术题、应用题生成
- 故事音频：按章节生成的 MP3 文件

这些脚本独立于主构建流程，通过直接运行 Python 脚本生成静态资源，不纳入 npm 构建管线。

## 构建约定

1. 开发工作流：npm run dev 启动热重载开发服务器
2. 构建流程：类型检查优先，成功后再进行打包
3. 资源组织：音频文件置于 public/audio/，图片资源在 public/ 和 src/assets/
4. 无容器化：项目未使用 Docker，直接部署静态文件到 Vercel
5. 无 CI/CD 流水线：依赖 Vercel 内置的 Git 集成自动部署