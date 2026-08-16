---
kind: configuration_system
name: Vite + .env 环境变量配置体系
category: configuration_system
scope:
    - '**'
source_files:
    - src/lib/supabase.ts
    - vite.config.ts
    - vercel.json
    - AGENTS.md
---

本仓库采用 Vite 构建工具的原生 .env 环境变量机制，配合 import.meta.env 在运行时注入配置，未引入第三方配置库（如 dotenv、config、dotenv-expand 等），整体配置体系简洁轻量。

1. 配置文件与环境变量来源
- 应用级运行配置通过 import.meta.env.VITE_SUPABASE_URL、import.meta.env.VITE_SUPABASE_ANON_KEY 读取 Supabase 连接信息，定义于 src/lib/supabase.ts。
- 开发环境凭据约定放在 .env.local，并在 AGENTS.md 中明确禁止硬编码到代码中。
- 构建与部署配置集中在 vite.config.ts（别名 @ → ./src、插件注册）和 vercel.json（SPA rewrites、静态资源缓存策略）。

2. 架构与约定
- 所有供浏览器端读取的环境变量必须以 VITE_ 前缀命名，由 Vite 在构建期注入为常量。
- 敏感信息（Supabase URL / Anon Key）仅存在于本地或平台环境变量中，不进入源码；生产部署时通过 Vercel 的 Environment Variables 面板注入。
- 项目根目录未发现 .env、.env.development、.env.production 等文件，说明当前依赖外部注入而非仓库内维护多环境文件。

3. 开发者应遵循的规则
- 新增前端可访问的配置一律以 VITE_ 前缀声明，并通过 import.meta.env 读取。
- 不要将任何密钥、URL、Key 直接写入源码；如需本地调试，使用 .env.local 并加入 .gitignore。
- 构建/部署相关配置优先放在 vite.config.ts 与 vercel.json，避免散落在各模块中。