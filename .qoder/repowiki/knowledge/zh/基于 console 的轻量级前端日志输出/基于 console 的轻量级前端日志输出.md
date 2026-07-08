---
kind: logging_system
name: 基于 console 的轻量级前端日志输出
category: logging_system
scope:
    - '**'
source_files:
    - src/hooks/useAppInit.ts
    - src/lib/db/syncManager.ts
---

本仓库未引入任何专用日志框架（如 winston、pino、bunyan 等），也未在 src 下维护独立的 logger 初始化或配置模块。应用中的日志输出完全依赖浏览器原生 `console` API，属于最轻量的调试方式。

**使用现状**
- 仅 6 处调用，集中在两个文件：
  - `src/hooks/useAppInit.ts`：记录 Supabase 同步失败、迁移完成/失败等关键流程节点，统一以 `[模块名]` 前缀区分来源。
  - `src/lib/db/syncManager.ts`：记录数据库同步与用户同步异常。
- 所有调用均为 `console.log / warn / error`，无结构化字段封装，无日志级别开关，无远程收集或持久化逻辑。

**约定与约束**
- 通过方括号模块名前缀（如 `[AppInit]`、`[SyncManager]`）实现最低限度的来源标识。
- 错误路径统一使用 `console.error`，并附带错误对象以便开发者面板查看堆栈。
- 开发期直接输出到浏览器控制台；生产环境未见过滤或降级策略。

**结论**：该仓库不存在成体系的 logging_system，当前仅为临时调试用途的 console 直出，不具备结构化、分级、可配置等工程化能力。