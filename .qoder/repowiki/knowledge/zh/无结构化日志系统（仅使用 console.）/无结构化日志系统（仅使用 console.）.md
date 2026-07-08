---
kind: logging_system
name: 无结构化日志系统（仅使用 console.*）
category: logging_system
scope:
    - '**'
source_files:
    - src/hooks/useAppInit.ts
    - src/lib/db/syncManager.ts
---

本仓库未引入任何第三方日志框架或封装层，全项目采用浏览器原生 `console.log / console.warn / console.error` 进行调试输出。已发现的调用集中在两个文件：
- `src/hooks/useAppInit.ts`：应用初始化与数据迁移阶段的提示性日志
- `src/lib/db/syncManager.ts`：Supabase 同步失败时的错误记录

所有日志均为简单字符串拼接，未定义统一的前缀规范、日志级别策略或结构化字段；也未在入口文件或配置中注册全局 logger。依赖树中的 `debug` 包为 Vite/React 生态的间接依赖，未被业务代码直接使用。

因此，本项目不存在可复用的日志系统，开发者如需增强可观测性，应自行引入结构化日志方案并制定统一约定。