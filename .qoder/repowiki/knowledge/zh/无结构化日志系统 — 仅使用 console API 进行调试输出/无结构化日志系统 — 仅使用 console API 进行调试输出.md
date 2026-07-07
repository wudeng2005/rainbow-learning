---
kind: logging_system
name: 无结构化日志系统 — 仅使用 console API 进行调试输出
category: logging_system
scope:
    - '**'
source_files:
    - src/hooks/useAppInit.ts
---

经全仓库检索，该仓库未实现任何专门的日志系统。代码中仅存在极少量对浏览器原生 `console.log` / `console.warn` / `console.error` 的直接调用，且分布零散、无统一封装或级别管理：

- `src/hooks/useAppInit.ts` 在应用初始化与数据迁移流程中使用 `console.warn` 记录 Supabase 不可达、`console.log` 记录迁移完成、`console.error` 记录迁移失败。
- 其余业务模块（store、pages、components、lib）均未引入任何日志框架（如 pino、winston、loglevel 等），也未定义统一的 logger 工具函数。

因此本项目不存在“日志框架选型、结构化字段规范、分级策略、输出目标路由”等设计决策，也不存在开发者应遵循的日志约定。当前所有调试信息均以控制台原始输出形式散落各处，不具备可观测性工程能力。