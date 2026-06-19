# Rainbow 快乐学堂

## 项目说明
为5岁半女孩设计的互动式游戏型学习网站，三模块（英语/汉字/数学），鼓励式学习+宝石兑换机制。

## 技术栈
- React 18 + TypeScript + Vite + TailwindCSS + Framer Motion + Zustand
- Supabase（PostgreSQL + REST API + Edge Function）
- 部署到 Vercel

## 编码规范
- 函数式组件 + Hooks
- TailwindCSS 统一样式
- Zustand 统一状态管理
- 所有反馈必须积极鼓励式（禁止"错了""不对"等否定用语）

## 注意事项
- 目标用户是5岁孩子，所有交互必须触摸友好（≥44px）
- iPad+手机双端适配，手机端纵向优先
- Supabase连接信息在.env.local中，不要硬编码到代码里
