---
kind: dependency_management
name: NPM 依赖管理与锁定策略
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - vercel.json
---

本项目采用标准的 npm + package-lock.json 方案进行依赖管理，未使用 pnpm/yarn/lockfile v2+ 等替代方案。

包声明与版本策略：所有运行时依赖（dependencies）使用 ^ 语义化版本范围，允许小版本自动升级；构建工具链（devDependencies）中 TypeScript 使用 ~ 精确到次版本，其余开发依赖同样以 ^ 声明。核心依赖包括 React 19、Vite 8、Zustand 5、Supabase JS SDK 2、Tailwind CSS 4、Framer Motion 12、React Router 7。

锁文件与私有源：提交 package-lock.json（lockfileVersion 3），记录每个包的精确版本、sha512 integrity 及来源镜像地址。从 lock 文件中可见所有包均通过企业内网镜像 https://registry.anpm.alibaba-inc.com 拉取，说明团队在 .npmrc 或全局配置中设置了该私有源（仓库内未包含 .npmrc）。

无 vendoring 或子模块：项目未使用 vendor/，node_modules 未提交，也未见任何子模块或本地路径依赖，纯远程 registry 模式。

CI/CD 集成：Vercel 部署配置 vercel.json 指定 buildCommand: npm run build，表明 CI 环境默认使用 npm 解析依赖并执行构建。

开发者约定：新增依赖应写入 package.json 对应分类，并通过 npm install 更新 package-lock.json。由于存在企业私有源，新成员需在本地配置相同的 .npmrc 镜像源，否则无法解析依赖。