---
kind: build_system
name: Vite + Vercel 前端构建与资源生成流水线
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.ts
    - vercel.json
    - tsconfig.json
    - eslint.config.js
    - scripts/AUDIO.md
    - scripts/generate-audio.py
    - scripts/generate-char-audio.py
    - scripts/generate-english-audio.py
    - scripts/generate-story-audio.py
---

## 构建系统概览

本项目采用 Vite 8 作为核心构建工具，配合 TypeScript、React 19 和 Tailwind CSS v4，通过 npm scripts 驱动开发、类型检查、打包与预览流程，最终静态产物部署至 Vercel。音频等富媒体资源由 Python 脚本预生成并随代码提交。

## 关键文件与职责

- package.json：定义项目元信息、npm scripts（dev/build/lint/preview）、运行时与开发依赖；build 命令串联 tsc -b 类型检查与 vite build 打包。
- vite.config.ts：注册 @vitejs/plugin-react 与 @tailwindcss/vite 插件，配置 @ 路径别名指向 src/。
- vercel.json：声明 Vercel 框架为 vite、构建命令 npm run build、输出目录 dist，并通过 rewrites 实现 SPA 路由回退，同时为 /assets/* 与 /audio/* 设置长期缓存头。
- tsconfig.json：采用 Project References 模式，聚合 tsconfig.app.json（应用）与 tsconfig.node.json（Node/Vite 侧）。
- eslint.config.js：基于 flat config 的 ESLint 规则，启用 @eslint/js、typescript-eslint、react-hooks、react-refresh，忽略 dist。
- scripts/*.py：基于 Edge TTS 的音频/题目/角色信息预生成脚本，产出静态资源写入 public/audio/ 与 src/data/。

## 架构与约定

### 构建管线
npm run dev → vite dev server (HMR)
npm run build → tsc -b (类型检查) → vite build (生产打包) → dist/
npm run preview → vite preview (本地预览产物)

- 类型检查与构建解耦：tsc -b 利用 project references 增量编译，仅当 .ts 源变更时触发。
- 产物结构：Vite 默认将 JS/CSS 输出到 dist/assets/，HTML 根目录；public/ 下内容原样拷贝（含 audio/、avatar.png 等）。

### 资源管理策略
- 静态资源：图片、字体、图标放入 public/，构建期直接复制，无需 import。
- 音频资源：全部 mp3 预先生成到 public/audio/，按学科子目录组织（chars/、en/words|letters|sentences/、stories/、correct/、wrong/），通过相对路径在组件中引用。
- 数据资源：JSON 与 TS 数据文件放在 src/data/，由 Python 脚本根据业务逻辑生成，需随代码提交。

### 部署约定
- 目标平台：Vercel（framework: vite），自动识别 Vite 项目。
- SPA 路由：rewrites 将所有非静态资源请求重定向到 index.html，由前端路由接管。
- 缓存策略：/assets/* 使用 immutable 一年缓存，/audio/* 使用一周缓存，其余资源走默认策略。

## 开发者应遵循的规则

1. 新增或修改音频：编辑对应数据源（如 src/data/characters.ts、src/data/english-questions.json），运行相应 generate-*-audio.py 脚本，然后 git add public/audio && git commit。必须提交生成的 mp3，否则线上缺失。
2. 新增静态资源：放入 public/ 对应子目录，避免放入 src/ 以免被 Vite 处理。
3. 新增数据文件：放入 src/data/，并在需要时编写对应的 generate-*.py 脚本，保持数据即代码的可再生原则。
4. 类型变更：修改 .ts/.tsx 后 npm run build 会先执行 tsc -b，确保类型正确后再打包。
5. ESLint 规则：新增文件遵循 flat config 中的 **/*.{ts,tsx} 匹配范围，不要绕过 ESLint 直接提交。
6. 路径别名：统一使用 @/ 代替相对路径导入 src/ 下的模块，提升可读性与可移植性。
7. Vercel 环境变量：如需接入 Supabase 等外部服务，请在 Vercel 项目设置中添加环境变量，而非硬编码到源码。