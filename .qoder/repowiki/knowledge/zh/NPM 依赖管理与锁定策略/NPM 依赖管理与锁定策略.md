---
kind: dependency_management
name: NPM 依赖管理与锁定策略
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - tsconfig.json
    - tsconfig.app.json
    - tsconfig.node.json
    - vite.config.ts
---

本仓库采用标准的 npm monorepo 根工程模式，通过 package.json + package-lock.json 管理全部 JavaScript/TypeScript 依赖，未使用 pnpm/yarn、Vite workspace 或子包拆分。

## 1. 使用的系统与工具
- 包管理器：npm（lockfileVersion=3）
- 运行时框架：React 19 + Vite 8 + TypeScript 6
- 构建与类型检查：tsc -b（project references）+ vite build
- 代码质量：ESLint 10 + typescript-eslint + eslint-plugin-react-hooks
- 样式方案：Tailwind CSS v4 + @tailwindcss/vite 插件
- 状态管理：Zustand 5
- 后端集成：@supabase/supabase-js 2
- 路由：react-router-dom 7
- 动画：framer-motion 12

## 2. 关键文件
- package.json — 单一依赖声明入口，区分 dependencies / devDependencies
- package-lock.json — 完整锁文件，记录所有传递依赖的精确版本与 integrity hash
- tsconfig.json + tsconfig.app.json + tsconfig.node.json — project references 双配置，分别约束应用与构建脚本的类型边界
- vite.config.ts — 定义别名 @/* → ./src，注册 react/tailwindcss 插件

## 3. 架构与约定
- 单包结构：无 packages/ 子目录，所有源码位于 src/，脚本位于 scripts/，依赖集中在根 package.json。
- 模块解析：TypeScript 与 Vite 均启用 moduleResolution: bundler + verbatimModuleSyntax，配合 paths["@/*"] 统一相对路径导入。
- 私有源：从 lock 文件中可见所有包均通过 https://registry.anpm.alibaba-inc.com 拉取，表明团队在本地/企业环境使用了阿里云 NPM 镜像或私有 registry；但仓库中未发现 .npmrc 文件，说明该配置可能由全局环境变量或 CI 注入。
- 版本策略：生产依赖使用 ^ 前缀（允许小版本升级），开发依赖同样使用 ^，但 TypeScript 使用 ~ 以锁定补丁版本，体现对编译器稳定性的重视。
- 构建产物：不输出 JS 到磁盘（noEmit: true），仅生成 .tsbuildinfo 增量编译缓存于 node_modules/.tmp/。

## 4. 开发者应遵循的规则
1. 新增依赖必须同时出现在 package.json 对应分类下，并运行 npm install 更新 package-lock.json，禁止手动编辑 lock 文件。
2. 不要提交 node_modules/（已在 .gitignore 中忽略），CI 应从 lock 文件恢复一致依赖树。
3. 保持 TypeScript 与 Vite 版本对齐：两者都基于 ES2023 target 与 bundler 解析策略，升级时需同步验证。
4. 私有 registry 变更需通过全局 .npmrc 或 CI 变量管理，不要在项目内硬编码 registry URL。
5. 脚本类依赖（如 Python 生成器）不在 npm 管理中，它们位于 scripts/ 且独立于前端依赖树，如需引入新脚本语言应在仓库 README 中补充安装说明。