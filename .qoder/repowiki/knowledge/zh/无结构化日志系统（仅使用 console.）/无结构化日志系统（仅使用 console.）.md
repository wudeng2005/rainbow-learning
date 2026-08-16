---
kind: logging_system
name: 无结构化日志系统（仅使用 console.*）
slug: logging_system
category: logging_system
scope:
    - '**'
---

本仓库未引入任何第三方日志框架或自定义 logger 模块，也未建立统一的日志级别、结构化字段或输出通道。全项目仅在以下两处使用原生 `console.*` API：
- `src/hooks/useAppInit.ts`：在 Supabase 同步失败、迁移完成/失败、数据重置等关键流程处打印 `console.warn` / `console.log` / `console.error`，并附带 `[AppInit]`、`[Migration]`、`[Reset]` 前缀以便区分来源。
- `src/lib/db/syncManager.ts`：在同步与用户数据同步异常时通过 `console.error('[SyncManager] ...')` 输出错误信息。

这些调用均为开发调试用途，没有集中配置、没有分级策略、没有持久化 sink，也不存在跨模块共享的 logger 实例。因此本项目不具备可复用的 logging_system。