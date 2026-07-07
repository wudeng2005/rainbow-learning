---
kind: frontend_style
name: 彩虹主题 Tailwind v4 + Framer Motion 前端样式体系
category: frontend_style
scope:
    - '**'
source_files:
    - src/index.css
    - vite.config.ts
    - package.json
    - src/components/BottomNav.tsx
    - src/components/DailyComplete.tsx
---

## 1. 系统与方法论
- CSS 框架：Tailwind CSS v4（通过 @tailwindcss/vite 插件集成），采用 v4 的 @theme 声明式设计令牌方式，不再依赖 tailwind.config.js。
- 动画库：Framer Motion（motion.*）负责组件级入场、弹性缩放、旋转等微交互；全局 CSS 中定义了一组 @keyframes 配合 .animate-* 工具类用于漂浮、漂移、星星闪烁、糖果飘落等背景装饰动画。
- 构建与路径别名：Vite + React，vite.config.ts 注册 @tailwindcss/vite 并配置 @/ → ./src 别名，统一导入入口为 src/index.css。
- 状态驱动 UI：样式完全由 Tailwind 原子类组合实现，无独立 CSS Modules / SCSS 文件，组件内以 className 字符串拼接。

## 2. 核心文件与包
- src/index.css — 唯一样式入口：@import "tailwindcss" + @theme 设计令牌 + 全局字体/排版 + 自定义 keyframes 动画。
- vite.config.ts — 启用 Tailwind v4 插件与 @/ 路径别名。
- package.json — 关键依赖：tailwindcss ^4.3.1、@tailwindcss/vite ^4.3.1、framer-motion ^12.40.0、react-router-dom ^7.18.0。
- 组件层广泛使用 Tailwind 类与 Framer Motion，如 src/components/BottomNav.tsx、src/components/DailyComplete.tsx、src/components/FeedbackOverlay.tsx、src/pages/HomePage.tsx 等。

## 3. 架构与约定
### 设计令牌（Design Tokens）
在 @theme 中集中定义，形成“彩虹”品牌色板与业务语义色：
- 彩虹主色：--color-rainbow-red/orange/yellow/green/blue/purple
- 业务语义：--color-gem-gold（宝石）、--color-correct（正确）、--color-wrong-soft（错误柔和态）
- 中性色：--color-bg-warm（暖白背景）、--color-bg-card、--color-text-primary/secondary
- 所有颜色通过 text-rainbow-purple、bg-rainbow-blue、border-rainbow-purple/30 等 Tailwind 变量访问。

### 响应式策略
- 基于 Tailwind 默认断点（sm/md/lg 等）+ 媒体查询混合：index.css 中针对 min-width: 768px 调整 html 基础字号（16→18px），组件侧用 md:p-5 等类适配大屏。
- 移动端优先：底部导航固定定位、安全区域 env(safe-area-inset-bottom)、最小触摸目标 min-h-[48px]。

### 动画分层
- 全局装饰动画：float-slow/medium/fast、drift-slow/medium、star-pulse、candy-fall(-slow) 等 keyframes + .animate-* 类，供背景装饰组件复用。
- 组件交互动画：Framer Motion 的 initial/animate/transition 控制按钮点击缩放、完成弹窗 spring 入场、图标摇摆等，强调“儿童友好”的弹性和趣味性。

### 组件样式组织
- 无独立 CSS 文件，全部以 Tailwind 原子类内联于 className。
- 常用布局模式抽象为可复用的 className 片段（如渐变按钮 bg-gradient-to-r from-rainbow-blue to-rainbow-purple text-white font-bold rounded-full min-h-[48px]）。
- 状态样式通过三元表达式或函数式 className（见 NavLink 的 isActive 回调）切换，保持单一数据源驱动视觉。

## 4. 开发者应遵循的规则
1. 新增颜色必须走 @theme：在 src/index.css 的 @theme 块中声明新 token，禁止在组件中硬编码十六进制色值。
2. 优先使用 Tailwind 原子类：不新建 .xxx {} 规则，除非是全局 keyframes 动画；复杂样式拆分为多个原子类组合。
3. 动画选择原则：背景装饰用 CSS @keyframes + .animate-* 类；用户交互反馈用 Framer Motion，避免过度动画影响低龄用户注意力。
4. 响应式写法：移动端优先，使用 Tailwind 断点前缀（md:、lg:）而非手写媒体查询；基础字号调整集中在 index.css 的 html 层级。
5. 无障碍与触控：按钮最小高度 min-h-[48px]，圆角 rounded-full 营造亲和感；禁用 -webkit-tap-highlight-color 已在根样式关闭。
6. 路径别名：统一使用 @/ 导入 src 下模块，避免相对路径嵌套过深。