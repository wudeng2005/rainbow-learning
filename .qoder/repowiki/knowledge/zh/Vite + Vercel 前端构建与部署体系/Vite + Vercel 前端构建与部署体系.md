---
kind: build_system
name: Vite + Vercel 前端构建与部署体系
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.ts
    - tsconfig.app.json
    - vercel.json
    - scripts/generate-audio.py
    - scripts/generate-char-audio.py
    - scripts/generate-chinese-questions.py
---

本项目采用轻量级现代前端构建方案，以 Vite 为核心构建工具、TypeScript 为语言基础、Vercel 为托管平台，配合少量 Python 脚本完成资源生成。整体结构简洁，无 Docker/Makefile 等重型 CI 配置，适合小型教育类单页应用。

## 1. 构建系统与工具链
- 构建器：Vite 8（vite.config.ts），启用 @vitejs/plugin-react 和 @tailwindcss/vite 插件
- 类型系统：TypeScript 6，使用 Project References（tsconfig.app.json + tsconfig.node.json + 根 tsconfig.json）
- 包管理：npm（package-lock.json），模块类型为 ESM（"type": "module"）
- 代码检查：ESLint 10 + typescript-eslint，通过 eslint.config.js 统一配置
- 路径别名：@/* → ./src/*，在 vite.config.ts 和 tsconfig.app.json 中同步声明

## 2. 核心构建脚本
package.json 中的 scripts 定义了完整开发流：
- npm run dev：启动 Vite 开发服务器（热重载）
- npm run build：先执行 tsc -b 进行增量类型检查，再 vite build 打包到 dist/
- npm run lint：ESLint 全量扫描
- npm run preview：本地预览生产构建产物
注意：build 命令将类型检查作为构建前置步骤，确保类型错误不会产出静态资源。

## 3. 资源生成脚本（Python）
scripts/ 目录包含三个独立的数据/资源生成脚本，均非构建流程必需，属于离线预处理：
- generate-audio.py：调用 Microsoft Edge TTS API，批量生成鼓励语音（correct/wrong 分类 MP3）
- generate-char-audio.py：为汉字数据生成对应读音音频
- generate-chinese-questions.py：从模板生成中文题库 JSON
这些脚本直接写入 public/audio/ 和 src/data/，由 Git 跟踪提交，不属于运行时构建的一部分。

## 4. 部署配置（Vercel）
vercel.json 明确指定：
- 构建命令：npm run build
- 输出目录：dist
- 框架识别：vite
- SPA 路由重写：除 assets、audio、favicon 外的所有路径重写到 index.html
- 缓存策略：/assets/* 强缓存 1 年（immutable），/audio/* 缓存 7 天
同时 public/_headers 和 public/_redirects 可作为 Vercel Headers/Rewrites 的补充配置。

## 5. TypeScript 编译约定
tsconfig.app.json 的关键约束：
- noEmit: true — 仅做类型检查，不产出 JS（由 Vite 负责打包）
- verbatimModuleSyntax + moduleDetection: force — 严格 ESM 语义
- skipLibCheck: true — 跳过第三方库类型检查，加速构建
- noUnusedLocals / noUnusedParameters — 禁止未使用变量
- erasableSyntaxOnly — 仅允许可擦除语法（面向 TS 编译器优化）

## 6. 开发者应遵循的规则
1. 新增依赖后：始终运行 npm run build 验证类型检查通过，不要跳过 tsc -b
2. 路径别名：新增文件时优先使用 @/ 前缀引用，避免相对路径嵌套过深
3. 静态资源：图片/字体放入 src/assets/（被 Vite 处理），音频/无需处理的文件放入 public/
4. 资源生成脚本：修改 scripts/*.py 后需手动执行并确认产物已提交，它们不参与 npm run build
5. Vercel 部署：推送即触发构建，如需自定义 Header/Redirect，优先编辑 vercel.json 而非 public/_* 文件
6. ESLint 规则：新增代码需通过 npm run lint，未使用的局部变量/参数会被拒绝