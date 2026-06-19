## Rainbow 快乐学堂 — 项目规则

### 技术栈
- 前端：React 18 + TypeScript + TailwindCSS + Framer Motion + Zustand
- 后端：Supabase（PostgreSQL + REST API + Edge Function）
- 构建工具：Vite
- 部署：Vercel

### 编码规范
- 所有组件使用 TypeScript，禁止 any 类型
- 使用函数式组件 + Hooks，不使用 class 组件
- 状态管理统一用 Zustand，不用 Redux
- 样式统一用 TailwindCSS，不写内联 style
- 动画用 Framer Motion
- 数据库操作统一通过 `src/lib/supabase.ts` 中的 supabase 客户端

### 目标用户
- 5岁半女孩，幼儿园中班
- iPad为主 + 手机双端适配
- 触摸优先交互，所有可点击区域≥44px
- 鼓励式学习：所有反馈必须积极鼓励，绝不批评惩罚

### 文件结构约定
- src/components/ — UI组件
- src/pages/ — 页面组件
- src/lib/ — 工具库（supabase客户端等）
- src/store/ — Zustand状态管理
- src/data/ — 课程框架JSON配置
- src/types/ — TypeScript类型定义
