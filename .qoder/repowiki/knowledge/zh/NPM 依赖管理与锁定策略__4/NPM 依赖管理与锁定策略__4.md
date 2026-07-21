---
kind: dependency_management
name: NPM 依赖管理与锁定策略
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - vite.config.ts
---

本项目采用标准的 npm 生态进行依赖管理，核心机制如下：

**包管理器与锁文件**
- 使用 npm 作为包管理器，通过 `package.json` 声明运行时与开发时依赖。
- 提交 `package-lock.json`（lockfileVersion: 3）以锁定所有子依赖的精确版本，确保团队与 CI 环境安装结果一致。
- 未使用 pnpm、yarn、bun 等替代工具；`.gitignore` 中仅保留对它们的日志忽略规则，表明项目不强制要求特定包管理器。

**私有镜像源**
- 从 `package-lock.json` 中的 `resolved` 字段可见，所有包均通过阿里云 NPM 镜像 `registry.anpm.alibaba-inc.com` 下载，说明开发者本地或全局配置了 `.npmrc` 指向该镜像。仓库内未包含 `.npmrc` 文件，属于本地/环境变量层面的配置。

**依赖分类与版本策略**
- 运行时依赖（dependencies）：React 19、react-router-dom 7、zustand 5、framer-motion 12、@supabase/supabase-js 2、Tailwind CSS v4 及其 Vite 插件。
- 开发依赖（devDependencies）：Vite 8、TypeScript ~6.0.2、ESLint 10 + typescript-eslint、@vitejs/plugin-react、globals 等。
- 版本范围统一使用 `^`（主版本兼容），除 TypeScript 使用 `~`（次版本兼容）。未引入 `workspace:` 协议，不存在 monorepo 结构。

**构建与打包**
- 通过 Vite 构建，无 vendoring 或源码级依赖复制；`node_modules/` 未被提交，依赖在构建阶段动态解析。
- 部署目标为 Vercel（见 `vercel.json`），CI 将基于 `package-lock.json` 还原依赖树。

**开发者应遵循的规则**
1. 新增依赖后必须运行 `npm install` 并检查 `package-lock.json` 变更，禁止手动编辑 lock 文件。
2. 升级依赖时使用 `npm update <pkg>` 或 `npm install <pkg>@latest --save-exact`，避免随意放宽版本范围导致破坏性更新。
3. 若需切换镜像源，应在团队共享的 `.npmrc` 或 CI 环境变量中集中配置，而非写入仓库。
4. 保持 `type: "module"` 与 ESM 风格导入一致，避免混用 CommonJS 依赖引发解析问题。