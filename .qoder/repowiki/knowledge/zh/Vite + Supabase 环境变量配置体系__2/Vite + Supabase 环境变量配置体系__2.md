---
kind: configuration_system
name: Vite + Supabase 环境变量配置体系
category: configuration_system
scope:
    - '**'
source_files:
    - src/lib/supabase.ts
    - vite.config.ts
    - vercel.json
    - AGENTS.md
---

本仓库采用极简的前端配置策略，基于 Vite 的 import.meta.env 机制加载运行时配置，核心依赖通过 .env.local 注入。

1. 使用的系统与工具
- Vite 内置环境变量：所有前端可访问的配置均通过 import.meta.env.VITE_* 前缀暴露，由 Vite 在构建期注入。
- Supabase JS SDK：数据库与认证连接信息通过环境变量传入。
- Vercel 部署配置：vercel.json 定义构建命令、SPA 路由重写与静态资源缓存策略。
- .env.local：本地开发时存放 Supabase URL 与匿名密钥（见 AGENTS.md 第20行）。

2. 关键文件
- src/lib/supabase.ts：唯一读取环境变量的入口，导出已初始化的 supabase 客户端实例。
- vite.config.ts：仅包含插件与路径别名，无额外配置层。
- vercel.json：部署时的构建/重写/缓存规则。
- AGENTS.md：约定 Supabase 凭据放在 .env.local，禁止硬编码。

3. 架构与约定
- 单一配置源：应用不维护 JSON/YAML/TOML 等配置文件，所有外部依赖连接信息均以 VITE_SUPABASE_URL、VITE_SUPABASE_ANON_KEY 形式通过环境变量提供。
- 集中初始化：supabase.ts 在模块顶层读取环境变量并立即创建客户端，其他模块直接 import { supabase } 使用，避免重复读取。
- 空值回退：当环境变量缺失时回退为空字符串，SDK 会在后续请求中报错，便于快速发现配置遗漏。
- 部署无关：未使用 Vite 多环境模式（如 .env.production），生产配置完全交由部署平台（Vercel）的环境变量管理。

4. 开发者应遵循的规则
- 新增前端可配置项时，统一以 VITE_ 前缀命名并通过 import.meta.env 读取。
- 任何服务连接信息（URL、Key、Token）必须放入 .env.local，严禁写死在源码中。
- 如需新增环境变量，需在 AGENTS.md 或对应注释中说明用途，保持团队一致性。
- 不要引入额外的配置库（如 dotenv、config-node 等），保持零依赖。