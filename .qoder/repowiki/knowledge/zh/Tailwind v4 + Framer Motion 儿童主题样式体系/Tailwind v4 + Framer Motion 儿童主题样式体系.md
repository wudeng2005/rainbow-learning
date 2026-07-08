---
kind: frontend_style
name: Tailwind v4 + Framer Motion 儿童主题样式体系
category: frontend_style
scope:
    - '**'
source_files:
    - src/index.css
    - vite.config.ts
    - package.json
---

本仓库采用 Tailwind CSS v4（通过 @tailwindcss/vite 插件）作为唯一样式方案，配合 Framer Motion 提供交互动画，形成面向儿童的彩虹主题视觉风格。

## 样式系统架构
- 构建集成：vite.config.ts 中通过 @tailwindcss/vite 插件启用 Tailwind v4，无需传统 tailwind.config.js，所有设计令牌在 CSS 内声明。
- 全局入口：src/index.css 是唯一的全局样式文件，通过 @import "tailwindcss" 引入框架，并在 @theme 块中集中定义设计令牌。
- 无 CSS-in-JS：组件全部使用 className + Tailwind 原子类，未发现 styled-components、Emotion、styled-jsx 等库的使用。

## 设计令牌与主题色
@theme 块定义了完整的儿童学习应用调色板：
- 彩虹主色系：--color-rainbow-red/orange/yellow/green/blue/purple，用于按钮渐变、进度条、装饰元素
- 业务语义色：--color-correct（答对）、--color-wrong-soft（错误反馈）、--color-gem-gold（宝石奖励）
- 中性色：--color-text-primary/secondary、卡片背景 --color-bg-card、暖白底 --color-bg-warm

字体栈优先使用系统字体链，并显式包含中文苹方、微软雅黑、Noto Sans SC，确保多语言可读性。

## 响应式策略
- 移动端优先：基础样式针对手机优化，通过 min-width: 768px 媒体查询提升桌面端字号（16px → 18px）
- 安全区域适配：.safe-top / .safe-bottom 工具类封装 env(safe-area-inset-*)，底部导航栏直接嵌入 safe area padding
- 视口单位：广泛使用 dvh（动态视口高度）替代固定 vh，避免 iOS Safari 地址栏遮挡问题

## 动画与动效
- CSS Keyframes：index.css 内置漂浮（float-slow/medium/fast）、漂移（drift-slow/medium）、星星脉冲（star-pulse）、糖果飘落等关键帧，并通过 .animate-* 类复用
- Framer Motion：依赖 framer-motion 提供复杂页面过渡与手势交互（如选项卡切换、答题反馈），与 CSS 动画互补
- 触摸优化：全局禁用 -webkit-tap-highlight-color，body 设置 touch-action: manipulation 消除点击延迟

## 组件样式约定
- 圆角与阴影：统一使用 rounded-2xl / rounded-full 与 shadow-sm / shadow-lg 营造柔和卡片感
- 渐变按钮：主操作按钮采用 bg-gradient-to-r from-rainbow-blue to-rainbow-purple 彩虹渐变
- 间距系统：基于 Tailwind 的 spacing scale，常用 gap-3/4/5、py-3.5 px-5 等组合
- 层级管理：底部导航固定定位 fixed bottom-0 z-50，浮动装饰使用绝对定位 absolute inset-0 pointer-events-none

## 开发者规范
1. 新增颜色必须写入 @theme 而非硬编码十六进制值
2. 动画优先复用已有 .animate-* 类，新动画需同步添加 keyframe 与 utility 类
3. 移动端布局以 flex + dvh 为主，桌面端通过 md: 前缀渐进增强
4. 禁止在组件内写 <style> 或行内 style，统一走 Tailwind 原子类
5. 需要复杂动效时选择 Framer Motion，简单循环动画用 CSS keyframes