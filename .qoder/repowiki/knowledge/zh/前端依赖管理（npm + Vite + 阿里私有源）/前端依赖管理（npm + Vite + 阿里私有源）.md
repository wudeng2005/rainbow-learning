---
kind: dependency_management
name: 前端依赖管理（npm + Vite + 阿里私有源）
slug: dependency_management
category: dependency_management
scope:
    - '**'
---

本仓库采用 npm 作为包管理器，通过 package.json 声明运行时与开发时依赖，并配合 package-lock.json 锁定精确版本，确保构建可重复。

1. 使用的系统与工具
- 包管理器：npm（lockfileVersion=3，使用 package-lock.json）
- 构建系统：Vite 8，插件生态包括 @vitejs/plugin-react、@tailwindcss/vite
- 语言/类型：TypeScript ~6.0.2，ESLint 10 + typescript-eslint
- 部署目标：Vercel（vercel.json），无本地 vendoring

2. 关键文件
- package.json：声明所有依赖及脚本（dev/build/lint/preview）
- package-lock.json：完整依赖树与校验和，已提交至版本库
- vite.config.ts：配置别名 @ → ./src，注册 React/Tailwind 插件
- .gitignore / .vercelignore：忽略 node_modules，不上传依赖

3. 架构与约定
- 依赖分层清晰：dependencies 仅包含运行时代码（React、Supabase、Zustand、Framer Motion、Tailwind、路由），devDependencies 包含构建/类型/检查工具链，二者严格分离。
- 版本策略以 ^ 为主，允许小版本/补丁升级；TypeScript 使用 ~ 锁定大版本内最小变更，避免破坏性更新。
- 模块解析通过 Vite alias 统一使用 @/ 前缀引用源码，避免相对路径嵌套过深。
- 包源指向企业私有镜像：package-lock.json 中大量 resolved: https://registry.anpm.alibaba-inc.com/...，说明团队在 CI/本地均通过私有 npm 源拉取，提升下载速度与合规性。

4. 开发者应遵循的规则
- 新增依赖必须写入 package.json 对应字段，禁止手动编辑 package-lock.json；使用 npm install <pkg> 同步锁文件。
- 区分 dependencies 与 devDependencies：仅在浏览器运行的代码放入前者，构建期工具放入后者。
- 升级依赖时使用 npm update 或 npm install <pkg>@latest --save-dev，并提交更新后的 package-lock.json。
- 保持 TypeScript 主版本一致（当前 ~6.0.2），避免跨大版本升级导致类型断裂。
- 不要将 node_modules 提交到仓库；CI 环境需配置相同的私有 npm 源（如 .npmrc 或环境变量 NPM_CONFIG_REGISTRY）。