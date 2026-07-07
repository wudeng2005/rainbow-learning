---
kind: configuration_system
name: Vite + .env.local 环境变量配置体系
category: configuration_system
scope:
    - '**'
source_files:
    - .env.local
    - src/lib/supabase.ts
    - vite.config.ts
    - vercel.json
---

本仓库采用 Vite 作为构建工具，通过 `.env.local` 文件配合 `import.meta.env.VITE_*` 前缀注入前端运行时配置。当前仅包含 Supabase 连接信息（URL 与匿名密钥），由 `src/lib/supabase.ts` 在模块初始化时读取并创建客户端实例。所有可被浏览器访问的配置必须以 `VITE_` 为前缀，这是 Vite 的强制约定；非公开配置不应放入 `.env.local`，而应通过后端代理或 Supabase 服务端逻辑处理。部署层使用 `vercel.json` 声明构建命令、输出目录、SPA 路由重写以及静态资源缓存策略，属于平台级运行环境配置，而非应用内配置项。项目未引入集中式配置中心、配置文件（如 JSON/YAML）或运行时配置加载器，整体配置体系保持极简：开发期靠 `.env.local`，生产期依赖 Vercel 环境变量注入。