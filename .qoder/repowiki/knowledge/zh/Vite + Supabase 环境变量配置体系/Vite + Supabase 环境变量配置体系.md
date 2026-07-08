---
kind: configuration_system
name: Vite + Supabase 环境变量配置体系
category: configuration_system
scope:
    - '**'
source_files:
    - .env.local
    - src/lib/supabase.ts
    - vite.config.ts
    - vercel.json
---

本仓库采用 Vite 原生 .env 环境变量机制，配合 Supabase JS SDK 完成运行时配置加载，未引入第三方配置库（如 dotenv、config-node 等），整体结构极简。

## 1. 使用的系统与工具
- Vite 内置 .env 支持：通过 import.meta.env.VITE_* 在构建期注入前端可访问的环境变量。
- Supabase JS SDK：客户端凭据直接由环境变量提供，无服务端代理层。
- Vercel 部署配置：通过 vercel.json 声明构建命令、输出目录与 SPA 路由重写规则。

## 2. 关键文件与位置
- .env.local：本地开发环境下的 Supabase URL 与匿名密钥。
- src/lib/supabase.ts：唯一读取 import.meta.env 的位置，导出单例 supabase 客户端。
- vite.config.ts：Vite 构建配置，仅包含插件与路径别名，无额外配置模块。
- vercel.json：生产部署时的构建/缓存/SPA 重写策略。

## 3. 架构与约定
- 命名规范：所有暴露给前端的变量必须以 VITE_ 前缀开头，遵循 Vite 的 import.meta.env 白名单机制。
- 集中初始化：Supabase 客户端在 src/lib/supabase.ts 中统一创建并导出，业务模块直接 import 使用，避免散落重复读取 env。
- 无分层配置：不存在 dev/staging/prod 多套配置文件；不同环境的差异完全依赖部署平台（本地 .env.local、Vercel 环境变量）注入同名变量。
- 无运行时重载：配置在构建期固化到产物中，不支持热更新或运行时切换。

## 4. 开发者应遵循的规则
- 新增前端可见的配置项时，一律以 VITE_ 前缀命名，并在 .env.local 中添加示例值。
- 若需新增后端服务凭据，仍通过 import.meta.env 读取，但应避免将敏感 key 提交到版本库（.gitignore 已忽略 .env*）。
- 如需区分环境，优先利用 Vercel 的 Environment Variables 面板为不同分支/预览部署设置不同值，而非复制多份 .env 文件。
- 不要在业务组件中直接 import.meta.env.*，应集中在 src/lib/ 下对应的初始化文件中统一读取并导出。