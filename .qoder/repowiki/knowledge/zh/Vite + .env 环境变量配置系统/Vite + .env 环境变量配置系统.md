---
kind: configuration_system
name: Vite + .env 环境变量配置系统
category: configuration_system
scope:
    - '**'
source_files:
    - src/lib/supabase.ts
    - vite.config.ts
    - vercel.json
    - AGENTS.md
---

本仓库采用 Vite 内置的环境变量机制作为唯一的运行时配置来源，未引入第三方配置库（如 dotenv、config-node 等），也没有集中式配置文件目录。

**加载方式与环境变量约定**
- 通过 `import.meta.env.VITE_*` 读取构建期注入的变量，目前仅 Supabase 连接信息使用此方式：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`，定义在 `src/lib/supabase.ts`。
- 所有 `.env*` 文件均被 `.gitignore` 忽略，开发时通过 `.env.local` 提供本地值，禁止将密钥硬编码进代码（见 `AGENTS.md` 约定）。
- 由于 Vite 会在构建时将 `VITE_` 前缀的变量内联到产物中，这些配置属于客户端可见的前端配置。

**构建与部署配置**
- `vite.config.ts` 定义了 React/Tailwind 插件、`@` 路径别名，不包含外部配置加载逻辑。
- `vercel.json` 声明了 Vite 框架、SPA rewrites 以及静态资源缓存策略，是部署层的环境/路由配置入口。
- 项目根未发现 `wrangler.toml`，`.wrangler/tmp/` 仅为临时目录，说明当前未启用 Cloudflare Workers 环境配置。

**设计决策与约束**
- 配置即代码：无独立 config 模块或 JSON/YAML 配置文件，所有可配置项以 `VITE_` 前缀的环境变量形式存在。
- 最小化原则：仅数据库连接等少量敏感参数走环境变量，其余业务常量直接写在源码或数据文件中。
- 开发者约定：Supabase 凭据必须放入 `.env.local`，不得提交到版本库。