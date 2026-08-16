---
kind: dependency_management
name: NPM + Vite 依赖管理（React 前端工程）
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - vite.config.ts
---

本仓库采用 NPM 作为包管理器，基于 package.json 声明运行时与开发期依赖，并通过 package-lock.json（lockfileVersion 3）锁定精确版本，确保团队与 CI 环境构建一致性。项目为纯前端单页应用（React + Vite），无后端语言或 Go/Python 等依赖清单文件。

1. 使用的系统与工具
- 包管理器：npm（由 package-lock.json 的存在与 lockfileVersion 3 确认）。
- 构建与插件：Vite 8 + @vitejs/plugin-react + Tailwind CSS v4（通过 @tailwindcss/vite 集成）。
- 运行时核心：React 19、react-router-dom 7、zustand 5、Supabase JS SDK 2、framer-motion 12。
- 类型与 Lint：TypeScript ~6、eslint 10 + typescript-eslint、globals 17。

2. 关键文件
- package.json：声明所有依赖与脚本（dev/build/lint/preview）。
- package-lock.json：锁定全部子依赖的精确版本与来源镜像地址。
- vite.config.ts：配置 Vite 插件与路径别名 @ → ./src。
- .gitignore / .vercelignore：未将 node_modules 纳入版本控制，依赖通过锁文件还原。

3. 架构与约定
- 依赖分层清晰：dependencies 仅包含运行时代码所需的库；devDependencies 包含构建、类型、Lint 等工具链。
- 版本策略：生产依赖使用 ^ 前缀（允许次版本更新），TypeScript 使用 ~（仅补丁更新），在可升级性与稳定性之间取平衡。
- 私有源：从 lock 文件中可见 registry.anpm.alibaba-inc.com，说明团队已配置阿里内 npm 镜像用于加速与合规拉取。
- 无 vendoring：不提交 node_modules，也不使用 pnpm/yarn workspace 或多包结构，为单一根级 package 的简单 SPA 形态。

4. 开发者应遵循的规则
- 新增依赖时统一写入 package.json 对应字段，并重新生成 package-lock.json，禁止手动编辑锁文件。
- 优先将仅在开发阶段使用的包放入 devDependencies，避免污染产物体积。
- 升级依赖时使用 npm update 或 npm install <pkg>@latest，并在本地验证构建与运行后再提交。
- 若需切换镜像源或添加私有包，应在 npm 全局或项目级 .npmrc 中配置，而非硬编码到代码里。
- 保持 vite.config.ts 中的插件与 package.json 中 devDependencies 的一致性，避免遗漏安装导致构建失败。