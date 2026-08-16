---
kind: configuration_system
name: Vite + Supabase 环境变量配置体系
slug: configuration_system
category: configuration_system
scope:
    - '**'
---

本仓库采用 Vite 原生环境变量机制，配合 Supabase 客户端初始化完成运行时配置加载，未引入第三方配置库。

1. 使用的系统与工具
- Vite 内置 import.meta.env 注入：所有以 VITE_ 前缀的环境变量会在构建期被编译进产物，供前端直接读取。
- Supabase JS SDK：通过 createClient(url, key) 使用两个环境变量建立连接。
- Vercel 部署配置：vercel.json 中声明了 SPA rewrites 与静态资源缓存策略，属于部署层配置。

2. 关键文件与位置
- src/lib/supabase.ts：唯一集中读取环境变量的地方，导出已初始化的 supabase 客户端实例。
- vite.config.ts：定义路径别名 @ → ./src，无额外构建期配置。
- vercel.json：Vercel 平台构建命令、输出目录、SPA 路由重写与静态资源缓存头。
- .env.local（由 AGENTS.md 约定）：本地开发时存放 Supabase URL 与 Anon Key，不应提交到版本库。

3. 架构与约定
- 环境变量命名规范：全部使用 VITE_SUPABASE_URL、VITE_SUPABASE_ANON_KEY 形式，遵循 Vite 的 VITE_* 前缀约定。
- 单点初始化：Supabase 客户端在 src/lib/supabase.ts 中一次性创建并导出，业务模块直接 import 使用，避免重复初始化。
- 空值回退：读取环境变量时使用 || '' 提供默认空串，防止构建期缺失变量导致崩溃。
- 部署层配置：vercel.json 将 /assets/* 设为长期不可变缓存，/audio/* 设为 7 天缓存，其余路径重写到 index.html 支持 SPA 路由。

4. 开发者应遵守的规则
- 新增前端可配置项时，统一以 VITE_ 前缀命名并通过 import.meta.env.VITE_xxx 读取，并在 src/lib/supabase.ts 附近集中管理。
- 敏感信息（如 Supabase URL、Anon Key）必须放入 .env.local，禁止硬编码到源码或提交到 Git。
- 如需按环境区分行为，可在不同部署平台（Vercel、本地）设置对应环境变量，无需修改代码。
- 构建产物不包含 .env 内容，仅包含以 VITE_ 前缀暴露的变量，注意不要误用其他环境变量名。