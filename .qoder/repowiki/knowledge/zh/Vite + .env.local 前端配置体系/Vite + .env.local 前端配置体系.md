---
kind: configuration_system
name: Vite + .env.local 前端配置体系
category: configuration_system
scope:
    - '**'
source_files:
    - .env.local
    - src/lib/supabase.ts
    - vite.config.ts
    - vercel.json
---

本仓库采用 Vite 作为构建与运行时配置加载方案，通过 `.env.local` 文件注入环境变量，并在源码中以 `import.meta.env.VITE_*` 前缀读取。具体约定如下：

- **环境变量来源**：仅使用根目录的 `.env.local`（已被 `.gitignore` 排除），其中定义 Supabase 连接所需的 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`。
- **变量命名规范**：所有暴露给浏览器端的前端变量必须以 `VITE_` 为前缀，这是 Vite 对 `import.meta.env` 的强制要求；后端/Node 侧变量不使用此模式。
- **集中导出点**：Supabase 客户端在 `src/lib/supabase.ts` 中统一从 `import.meta.env` 读取凭据并创建实例，其他模块直接复用该导出，避免散落式的环境访问。
- **构建期配置**：`vite.config.ts` 仅包含插件、别名等构建期设置，不承载业务运行配置；路径别名 `@` 指向 `./src`。
- **部署期配置**：`vercel.json` 声明了 Vercel 平台的构建命令、输出目录、SPA 路由重写以及静态资源缓存策略，属于平台级部署配置，与运行时环境变量解耦。

开发者应遵循的规则：
1. 新增前端可公开的配置项一律写入 `.env.local`，并以 `VITE_` 前缀命名。
2. 禁止在代码中硬编码密钥或 URL，必须通过 `import.meta.env.VITE_*` 注入。
3. 若需按环境区分（dev/prod），可在 Vite 中引入多 `.env.*` 文件并按 `NODE_ENV` 选择，但当前仓库仅维护 `.env.local` 一份。
4. 敏感信息不得提交至版本库，`.env.local` 已在 `.gitignore` 中忽略。