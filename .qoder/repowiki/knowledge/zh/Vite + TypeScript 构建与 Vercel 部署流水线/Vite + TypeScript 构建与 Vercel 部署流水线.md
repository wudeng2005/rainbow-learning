---
kind: build_system
name: Vite + TypeScript 构建与 Vercel 部署流水线
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
    - index.html
---

本项目采用基于 Vite 8 的现代化前端构建系统，配合 TypeScript 6 与 ESLint 完成编译、打包与代码质量检查，产物通过 Vercel 静态站点托管。整体流程简洁、无 Docker/Makefile 等重型编排工具，属于轻量级 SPA 构建方案。

**构建工具链与脚本**
- 构建入口：`package.json` 中定义 `dev` / `build` / `lint` / `preview` 四个 npm script；`build` 先执行 `tsc -b` 进行增量类型检查，再调用 `vite build` 产出静态资源。
- 开发服务器：`vite dev` 提供 HMR 热重载。
- 预览：`vite preview` 用于本地验证生产构建产物。

**TypeScript 配置（Project References）**
- 根 `tsconfig.json` 仅声明两个 project reference：`tsconfig.app.json`（应用源码）与 `tsconfig.node.json`（Vite 插件/脚本），由 `tsc -b` 统一驱动增量编译。
- 两者均启用 `verbatimModuleSyntax`、`moduleDetection: force`、`noEmit: true`，将类型检查与模块解析交给 bundler 处理。
- 路径别名 `@/* → ./src/*` 在 TS 与 Vite 两端保持一致。

**Vite 构建配置**
- 插件：`@vitejs/plugin-react` 与 `@tailwindcss/vite` 组合，实现 React JSX 转换与 Tailwind CSS v4 零配置样式处理。
- 输出目录：默认 `dist/`，由 Vercel 直接消费。
- HTML 入口：`index.html` 以 `<script type="module" src="/src/main.tsx">` 挂载应用。

**部署与 CDN 缓存策略**
- 平台：Vercel，通过 `vercel.json` 声明 `framework: vite`、`buildCommand: npm run build`、`outputDirectory: dist`。
- SPA 路由回退：所有非静态资源的请求重写至 `/index.html`，支持前端路由。
- 缓存头：`/assets/*` 设置 `immutable` 一年缓存，`/audio/*` 设置 7 天缓存，其余资源走浏览器默认策略。

**资源生成脚本（非构建期）**
- `scripts/` 下 Python 脚本负责批量生成数学/英语题目 JSON 与 Edge TTS 音频文件，属于数据准备阶段，不参与 Vite 构建管线。

**开发者约定**
- 新增依赖后需同步更新 `package.json` 并重新安装；类型变更通过 `npm run build` 触发 `tsc -b` 校验。
- 使用 `@/` 绝对路径导入时，确保同时存在于 `tsconfig.app.json` 与 `vite.config.ts` 的 alias 配置中。
- 新增静态资源应放入 `public/` 目录，以便被 Vercel 原样发布并受对应缓存规则覆盖。