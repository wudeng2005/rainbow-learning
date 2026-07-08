---
kind: frontend_style
name: 彩虹主题 + Tailwind v4 原子化样式体系
category: frontend_style
scope:
    - '**'
source_files:
    - src/index.css
    - vite.config.ts
    - package.json
    - src/components/DailyComplete.tsx
    - src/components/BottomNav.tsx
    - src/components/FloatingDecorations.tsx
    - src/components/UserAvatar.tsx
---

## 1. 系统与方法论
- 样式框架：Tailwind CSS v4（通过 @tailwindcss/vite 插件在 Vite 中启用），采用原子类名直接组合的原子化写法，无自定义 SCSS/Less 文件。
- 动画库：Framer Motion 负责组件级入场/交互动画；全局关键帧动画集中在 src/index.css，以 .animate-* 工具类暴露给 JSX。
- 状态驱动样式：通过 Zustand store 与条件 className 拼接实现主题态切换（如激活态使用 text-rainbow-purple、背景半透明等）。
- 构建与别名：Vite 配置了 @ 指向 ./src，CSS 入口统一为 src/index.css，由 main.tsx 引入。

## 2. 核心文件与包
- 样式入口与主题定义：src/index.css
- Tailwind 集成：vite.config.ts（@tailwindcss/vite）、package.json（tailwindcss、@tailwindcss/vite）
- 典型 UI 组件（大量使用 Tailwind 原子类 + Framer Motion）：src/components/DailyComplete.tsx、src/components/BottomNav.tsx、src/components/FloatingDecorations.tsx、src/components/UserAvatar.tsx、src/App.tsx

## 3. 架构与约定
- 设计令牌（Design Tokens）集中声明于 src/index.css 的 @theme 块：
  - 彩虹色系：--color-rainbow-red/orange/yellow/green/blue/purple
  - 业务色：--color-gem-gold、--color-correct、--color-wrong-soft
  - 基础色板：--color-bg-warm、--color-bg-card、--color-text-primary、--color-text-secondary
- 响应式策略：基于 Tailwind 默认断点 + html 根字体缩放（768px 起从 16px 升到 18px），配合 min-h-[48px] 等最小触控尺寸保证儿童端易用性。
- 全局动画规范：所有可复用动画在 index.css 中以 @keyframes + .animate-* 类名形式提供（float/drift/star-pulse/candy-fall 等），组件内仅引用类名或 Framer Motion 属性，避免重复定义。
- 组件视觉风格：卡片圆角统一 rounded-2xl，按钮圆角 rounded-full，主按钮使用彩虹渐变 bg-gradient-to-r from-rainbow-blue to-rainbow-purple，次按钮用描边 border-2 border-rainbow-purple/30；阴影轻量 shadow-sm，背景常用 bg-white 或 bg-white/95 backdrop-blur-sm 营造毛玻璃效果。
- 图标与装饰：大量使用 Emoji 作为轻量图标（🌈⭐✨☁️🦜🐚🎵🌴），配合绝对定位 + 浮动动画营造“彩虹乐园”氛围，属于项目约定的低成本视觉语言。

## 4. 开发者应遵循的规则
- 颜色一律使用 Tailwind 变量前缀 text-rainbow-* / bg-rainbow-* / border-rainbow-* / text-text-* / text-correct / text-gem-gold，禁止硬编码十六进制色值。
- 圆角与间距：卡片优先 rounded-2xl，按钮 rounded-full；内边距按 Tailwind 预设（px-4 py-3、px-8 py-3）组合，不手写 CSS 覆盖。
- 动画选择：需要复杂时序/物理感时使用 Framer Motion（initial/animate/transition）；纯循环装饰动画使用 index.css 提供的 .animate-* 类名，不在组件内写 @keyframes。
- 移动端友好：触控目标至少 min-h-[48px]，底部导航使用 pb-[env(safe-area-inset-bottom)] 适配刘海屏。
- 组件结构：UI 层只放 className 与 motion 属性，主题/文案/数据从 store 或 data 目录读取，保持样式与业务解耦。