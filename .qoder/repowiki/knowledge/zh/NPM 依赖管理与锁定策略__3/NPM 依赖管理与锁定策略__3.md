---
kind: dependency_management
name: NPM 依赖管理与锁定策略
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
---

本项目采用标准的 npm 包管理方案，通过 package.json 声明依赖、package-lock.json 锁定版本，并配合企业私有镜像源进行安装。

## 使用的系统与工具
- 包管理器：npm（由 package-lock.json 的 lockfileVersion 3 确认）
- 构建与脚本：Vite 8 + TypeScript 6，通过 package.json 中 scripts 暴露 dev/build/lint/preview 四个命令
- 私有镜像源：从 package-lock.json 中所有 resolved 字段可见，项目实际拉取自阿里云 NPM 镜像 registry.anpm.alibaba-inc.com，而非默认官方源。该配置应来自全局 .npmrc 或 CI 环境，仓库内未包含本地 .npmrc 文件。
- 无 vendoring：项目中不存在 node_modules 提交记录，也未使用 pnpm/yarn workspace 或子模块方式管理依赖。

## 关键文件
- package.json：唯一依赖声明入口，区分 dependencies 与 devDependencies
- package-lock.json：完整依赖树与精确版本锁定，已纳入版本控制
- .gitignore：忽略 yarn-debug.log*、yarn-error.log*、pnpm-debug.log* 等日志，间接表明团队可能同时接触过 yarn/pnpm，但当前仅用 npm

## 架构与约定
1. 版本范围策略：生产依赖统一使用 ^ 前缀（如 react: ^19.2.6），允许小版本/补丁升级；开发依赖中的 TypeScript 使用 ~（typescript: ~6.0.2），更严格地限制大版本变更。
2. 依赖分层清晰：运行时依赖（React、Zustand、Supabase、Tailwind、Framer Motion、Router）与构建/类型/校验工具（ESLint、TypeScript、Vite、@types/*）严格分离。
3. 锁文件即真相：package-lock.json 被提交到仓库，确保团队成员与 CI 获得完全一致的依赖解析结果。
4. 无私有包注册表配置在仓库内：未发现 .npmrc、.yarnrc、pnpm-workspace.yaml 等配置文件，说明私有镜像源通过全局 npm 配置或 CI 环境变量注入。

## 开发者应遵循的规则
- 新增依赖时只修改 package.json，不要手动编辑 package-lock.json；运行 npm install 后提交更新后的锁文件。
- 保持 ^ 与 ~ 的版本策略一致：运行时库用 ^，编译期工具用 ~。
- 如需切换镜像源或添加私有包认证，应在团队级 .npmrc 或 CI 环境中配置，而非写入仓库。
- 避免将 node_modules 提交进 Git；若需共享二进制原生模块，优先考虑预构建产物或 Docker 镜像缓存。