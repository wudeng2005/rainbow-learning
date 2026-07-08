---
kind: logging_system
name: 基于 console 的原生日志输出（无专用日志框架）
category: logging_system
scope:
    - '**'
source_files:
    - src/hooks/useAppInit.ts
    - src/lib/db/syncManager.ts
---

本仓库未引入任何第三方日志框架或结构化日志库，所有运行期日志均通过浏览器原生 `console` API 直接输出。具体表现如下：

- **使用方式**：仅使用 `console.log`、`console.warn`、`console.error` 三种级别，未见 `console.info` / `console.debug`。
- **日志格式**：采用 `[模块名] 消息: error` 的字符串拼接风格，例如 `[AppInit] Supabase sync failed, using local data:`、`[Migration] Completed successfully`、`[SyncManager] Sync failed:`，便于在浏览器控制台快速按前缀过滤。
- **覆盖范围**：目前仅在应用初始化与数据同步路径中打印关键事件——`src/hooks/useAppInit.ts`（迁移/拉取阶段）和 `src/lib/db/syncManager.ts`（会话批量同步失败时），业务组件与页面层未见日志调用。
- **错误处理**：捕获异常后统一以 `console.error` 输出，且明确标注“失败不阻塞，下次重试”，体现容错策略而非崩溃式上报。
- **依赖情况**：`package-lock.json` 中出现 `debug` 包，但源码中无任何 `import debug` 的使用，属于间接依赖，未被项目主动启用。
- **构建产物**：`.gitignore` 忽略 npm/yarn/pnpm/lerna 的 `*-debug.log`，说明团队期望避免将调试日志纳入版本控制。

由于没有统一的 logger 抽象、日志级别配置、结构化字段规范或远程上报通道，当前模式适合小型前端应用的本地调试，但不具备生产可观测性能力。若后续需要集中采集、分级过滤或持久化存储，建议引入如 `pino-http`、`winston` 或基于 `@sentry/browser` 的错误上报方案，并建立统一的 `lib/logger.ts` 入口。