---
kind: build_system
name: Vite + React 构建与部署体系
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
    - eslint.config.js
---

本项目采用 Vite 8 + React 19 的单仓前端构建方案，通过 npm scripts 驱动开发、类型检查、打包与预览流程，并借助 Vercel 配置实现静态站点一键部署。

构建工具链
- 构建器：Vite 8（vite.config.ts），启用 @vitejs/plugin-react 与 @tailwindcss/vite 插件；路径别名 @/ → ./src。
- 语言：TypeScript 6，采用 Project References 双工程结构（tsconfig.app.json 对应应用源码，tsconfig.node.json 对应 Vite 构建脚本），统一开启 verbatimModuleSyntax、moduleDetection: force、noEmit 等严格模式。
- Lint：ESLint Flat Config（eslint.config.js），集成 @eslint/js、typescript-eslint、react-hooks、react-refresh，忽略 dist 目录。

NPM Scripts 工作流
- npm run dev — 启动 Vite 开发服务器（HMR）。
- npm run build — 先执行 tsc -b 进行增量类型检查，再调用 vite build 产出 dist/ 静态资源。
- npm run lint / npm run preview — 代码检查与本地产物预览。

部署与缓存策略
- 目标平台：Vercel（vercel.json），框架识别为 vite，构建命令复用 npm run build，输出目录 dist。
- SPA 路由重写：除 /assets、/audio、favicon 外的所有路径重定向到 /index.html。
- 缓存头：/assets/* 设置 immutable 一年缓存；/audio/* 设置 7 天缓存；其余由 _headers 文件补充。

生成脚本（非构建期）
- scripts/ 下提供 Python 脚本（generate-audio.py、generate-chinese-questions.py 等）用于批量生成题库 JSON 与 TTS 音频，属于内容生产流水线，不参与常规构建。

约定与约束
- 新增依赖需同步更新 package.json，并通过 npm install 锁定版本至 package-lock.json。
- 源文件必须使用 @/ 绝对路径别名导入，避免相对路径穿越。
- TypeScript 项目禁止 emit 中间产物，仅做类型检查；编译错误会阻断 build 流程。
- 静态资源按语义分目录存放于 public/（如 public/audio/、public/assets/），由 Vite 原样复制到 dist/。