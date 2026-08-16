---
kind: build_system
name: 构建与发布系统（Vite + Vercel + 脚本化资源生成）
slug: build_system
category: build_system
scope:
    - '**'
---

## 1. 构建系统与工具链
- 打包器：Vite 8，通过 @vitejs/plugin-react 提供 React JSX/TSX 支持。
- 样式：Tailwind CSS v4，使用 @tailwindcss/vite 插件在构建期处理。
- 类型检查：TypeScript 6，采用 Project References 模式（根 tsconfig.json 引用 tsconfig.app.json 与 tsconfig.node.json），build 命令先执行 tsc -b 再做 Vite 构建。
- 代码质量：ESLint Flat Config（eslint.config.js），启用 @eslint/js、typescript-eslint、react-hooks、react-refresh 规则集。
- 模块系统：package.json 声明 type: module，全部依赖以 ESM 形式导入。

## 2. 构建脚本与开发工作流
package.json scripts 定义了完整生命周期：
- npm run dev：启动 Vite 开发服务器（HMR）
- npm run build：tsc -b && vite build，输出到 dist/
- npm run lint：ESLint 全量扫描
- npm run preview：本地预览生产构建产物

路径别名：vite.config.ts 中配置 @ -> ./src，统一组件引用方式。

## 3. 静态资源与音频管线
本项目将大量 MP3 作为静态资源随代码部署，形成脚本驱动的资源生成流水线：
- 所有发音由 Python 脚本调用 Edge TTS 预生成，落盘至 public/audio/，提交到 Git。
- 核心脚本位于 scripts/：
  - generate-char-audio.py：根据 src/data/characters.ts 生成汉字发音
  - generate-english-audio.py：根据 src/data/english-questions.json 生成英语单词/字母/句子音频
  - generate-story-audio.py / generate-char-audio.py：故事与角色配音
  - generate-chinese-questions.py / generate-math-questions.py / generate-english-questions.py：题目数据生成
  - generate-character-info.py：角色元信息生成
- 文档 scripts/AUDIO.md 规定了只补新增、改旧需删重跑、生成后必须 git add public/audio 两条铁律。

## 4. 部署与发布
- 平台：Vercel（vercel.json 显式声明 framework: vite）。
- 构建命令：npm run build，输出目录 dist。
- SPA 路由：通过 rewrite 将所有非 assets/audio/favicon 请求回退到 /index.html。
- 缓存策略：
  - /assets/*：Cache-Control: public, max-age=31536000, immutable（编译期哈希文件名，永久缓存）
  - /audio/*：max-age=604800（周级缓存，内容更新需手动删除旧文件）
- 无 Dockerfile、无 Makefile、无 CI 配置文件；版本号为 0.0.0，未实现语义化版本或自动版本号注入。

## 5. 开发者应遵循的规则
1. 新增/修改学习素材：优先编辑 src/data/ 下的 JSON/TS 源文件，再运行对应 scripts/generate-*.py 脚本，最后 git add public/audio 提交。
2. 不要直接手写 MP3 文件名：所有音频路径应由生成脚本产出，保证命名一致性与增量构建正确性。
3. 构建前确保类型通过：npm run build 会先跑 tsc -b，类型错误会阻断打包。
4. 本地调试：用 npm run dev 启动 HMR；验证构建产物用 npm run preview。
5. Vercel 部署无需额外配置：推送 main 分支即触发 npm run build，rewrite 与 headers 已内置于 vercel.json。