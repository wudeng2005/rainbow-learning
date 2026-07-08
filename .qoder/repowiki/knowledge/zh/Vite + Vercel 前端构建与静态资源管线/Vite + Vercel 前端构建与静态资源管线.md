---
kind: build_system
name: Vite + Vercel 前端构建与静态资源管线
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.ts
    - vercel.json
    - tsconfig.app.json
    - tsconfig.node.json
    - scripts/AUDIO.md
---

## 构建系统概览
本项目采用 Vite 作为开发服务器与打包器，通过 npm scripts 驱动 TypeScript 类型检查与产物生成，最终部署到 Vercel。整个构建链路不包含后端编译、Docker 或 CI 流水线，属于轻量级 SPA 构建方案。

## 核心工具链
- **构建器**：Vite 8（`vite.config.ts`），启用 `@vitejs/plugin-react` 与 `@tailwindcss/vite` 插件
- **语言**：TypeScript 6，双 tsconfig（`tsconfig.app.json` 用于 src，`tsconfig.node.json` 用于 vite 配置），均开启 `verbatimModuleSyntax`、`moduleDetection: force`、`noEmit: true`（仅做类型检查）
- **路径别名**：`@/*` → `./src/*`（在 vite 与 tsconfig 中双向配置）
- **包管理**：npm（`package-lock.json`），无 monorepo 结构

## 构建脚本（package.json scripts）
| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 先执行 `tsc -b` 进行增量类型检查，再调用 `vite build` 产出 `dist/` |
| `npm run lint` | ESLint 扫描 |
| `npm run preview` | 本地预览构建产物 |

## 部署配置（Vercel）
`vercel.json` 声明了：
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- `framework`: `vite`（自动识别）
- SPA 路由重写：除 `assets`、`audio`、`favicon` 外的所有路径回退到 `/index.html`
- 缓存策略：`/assets/*` 设置 `immutable` 一年缓存；`/audio/*` 设置 7 天缓存

## 静态资源与音频生成管线
项目将大量 mp3 音频文件直接提交到 `public/audio/`，由 Vite 原样复制到 `dist/`。音频并非运行时生成，而是通过 Python 脚本基于 Edge TTS 预先生成：
- `scripts/generate-char-audio.py` — 从 `src/data/characters.ts` 生成汉字发音
- `scripts/generate-english-audio.py` — 从 `src/data/english-questions.json` 生成英语单词/字母/句子音频
- `scripts/generate-audio.py` — 生成对错鼓励语等通用音效
- `scripts/generate-math-questions.py` / `generate-chinese-questions.py` / `generate-english-questions.py` — 批量生成题目 JSON

生成规则（见 `scripts/AUDIO.md`）：
1. 脚本幂等：跳过已存在的 mp3，只补新增内容
2. 修改已有音频需先删除旧文件再重跑
3. 生成的音频必须随代码一起 git 提交，否则线上不可用
4. 数学模块不使用音频，无需运行相关脚本

## 开发者约定
- 新增依赖后更新 `package.json`，使用 `npm install` 锁定版本
- 修改 `src/` 下的 TS/TSX 代码时，`npm run build` 会先做严格类型检查，失败则阻断构建
- 新增静态资源放入 `public/` 目录即可被 Vite 原样输出
- 新增页面路由需在 `src/pages/` 下创建组件，并通过 React Router 注册
- 音频变更遵循「改数据源 → 跑对应脚本 → git add public/audio」的流程