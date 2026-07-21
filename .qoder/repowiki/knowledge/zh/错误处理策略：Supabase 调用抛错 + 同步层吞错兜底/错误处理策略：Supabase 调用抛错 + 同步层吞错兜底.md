---
kind: error_handling
name: 错误处理策略：Supabase 调用抛错 + 同步层吞错兜底
category: error_handling
scope:
    - '**'
source_files:
    - src/lib/db/syncManager.ts
    - src/lib/db/progressApi.ts
    - src/lib/db/gemApi.ts
    - src/lib/db/userApi.ts
    - src/lib/db/errorBankApi.ts
---

本仓库的错误处理采用「薄封装 + 上层兜底」的两层模式，没有统一的错误类型或中间件体系。

1. 数据访问层（src/lib/db/*.ts）
- 所有 Supabase 调用遵循同一约定：解构 `{ data, error }`，若 `error` 非空则直接 `throw error`，将原始 Supabase 错误对象向上传播。典型文件包括 progressApi.ts、gemApi.ts、userApi.ts、errorBankApi.ts。
- 不存在自定义 Error 子类、错误码枚举或统一包装函数，调用方拿到的是 Supabase 客户端抛出的原生错误。

2. 同步协调层（src/lib/db/syncManager.ts）
- 作为唯一显式 try/catch 的集中点，负责在 session 结束时批量 upsert 进度、宝石记录与错题。
- 对 `upsertDailyProgress`、`insertGemRecords`、`updateGemsTotal`、`upsertErrorRecords`、`updateUser` 等调用均包裹 try/catch，捕获后仅 `console.error` 并忽略异常，保证本地 localStorage 数据不丢失，下次页面可见时重试。
- 提供幂等的 `syncAfterSession`，内部用 `this.syncing` 与 `this.pendingSync` 标志避免并发重复同步；失败后自动递归重试一次。
- 通过 `registerVisibilitySync()` 监听 `visibilitychange`，在页面隐藏时触发同步，降低网络不可用时的失败概率。

3. 应用层（组件/Store）
- 学习流程中的答题结果先写入本地 store（localStorage），仅在完成时由 SyncManager 统一落库，因此业务代码中几乎看不到 try/catch 或 `.catch` 分支。
- 未使用 panic/recover、全局 unhandledrejection 监听或 Sentry 等上报工具。

开发者应遵循的规则
- 新增数据库操作：在 src/lib/db 下新建 API 文件，沿用 `{ data, error }` 解构 + `if (error) throw error` 模式，不要自行包装错误类型。
- 需要容错的异步任务：在 SyncManager 中以 `addPendingXxx` 入队，由 `syncAfterSession` 统一批处理并吞掉异常，确保本地状态始终可用。
- 不要在 UI 组件中直接 catch Supabase 错误——把错误交给 SyncManager 或让上层 Store 决定如何降级展示。
- 如需用户可见的错误提示，应在调用处根据错误对象特征（如 message 包含特定关键词）做简单判断，而非依赖结构化错误码。