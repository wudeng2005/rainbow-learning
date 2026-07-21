---
kind: logging_system
name: 基于浏览器原生 console 的轻量日志输出
category: logging_system
scope:
    - '**'
source_files:
    - src/hooks/useAppInit.ts
    - src/lib/db/syncManager.ts
---

本仓库未引入任何第三方日志框架（如 winston、pino、loglevel 等），也未建立统一的 logger 模块或日志级别体系。全项目仅使用浏览器原生的 `console.log` / `console.warn` / `console.error` 进行调试与错误记录，属于最基础的“无系统”状态。

**现有用法特征**
- 调用位置集中在初始化与数据同步路径：`src/hooks/useAppInit.ts`（应用启动、Supabase 迁移）、`src/lib/db/syncManager.ts`（会话级批量同步）。
- 日志格式为带前缀标签的字符串拼接，例如 `[AppInit] Supabase sync failed, using local data:`、`[Migration] Completed successfully`、`[SyncManager] Sync failed:`，便于在浏览器控制台按来源快速筛选。
- 仅使用三个级别：`warn` 用于可恢复异常（Supabase 不可达、同步失败回退本地），`error` 用于明确失败场景，`log` 仅用于一次性成功标记；没有 debug/info 级别的区分。
- 所有日志均为前端运行时输出，不存在后端/服务端日志收集、结构化字段、统一时间戳或日志轮转机制。

**开发者约定（当前事实）**
- 如需新增日志，直接在出错分支追加 `console.warn` / `console.error`，并沿用 `[模块名]` 前缀风格以便过滤。
- 由于没有集中式 logger，暂无法通过配置开关控制日志输出或调整级别。

该方案适合小型儿童学习 Web 应用的开发调试阶段，若后续需要生产环境可观测性，建议引入结构化日志库并在 `src/lib/logger.ts` 中统一封装。