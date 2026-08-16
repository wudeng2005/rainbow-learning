---
kind: frontend_style
name: 云上梦乐园：Tailwind v4 + Framer Motion 儿童风格系统
slug: frontend_style
category: frontend_style
scope:
    - '**'
---

## 样式体系概览
本项目采用「Tailwind CSS v4（@tailwindcss/vite）+ Framer Motion」构建面向儿童的「云上梦乐园」视觉风格，通过设计令牌集中管理彩虹调色板、天空渐变与玩具质感卡片，配合大量自定义 CSS 动画营造漂浮、闪烁、热气球等沉浸式氛围。

## 核心工具与依赖
- **Tailwind CSS v4**：通过 `@import "tailwindcss"` 引入，使用 `@theme` 块声明全部设计令牌，无需 tailwind.config.js。
- **Framer Motion**：所有交互组件统一使用 `motion` / `AnimatePresence` 实现路由切换、点击缩放、进度条填充等动效。
- **Vite alias**：`@/` 指向 `src/`，便于在 CSS 与 TSX 中统一引用。
- **字体**：`ZCOOL KuaiLe`（中文标题）、`Baloo 2`（数字），回退到 PingFang SC / Microsoft YaHei。

## 设计令牌（Design Tokens）
| 类别 | 变量名 | 取值 |
|---|---|---|
| 彩虹主色 | `--color-rainbow-red/orange/yellow/green/blue/purple` | #FF7B6B → #B07FE8 |
| 宝石金 | `--color-gem-gold` | #FFC93C |
| 天空渐变 | `--color-sky-top/mid/bottom` | #A8DDFF → #FFF3E0 |
| 背景/文字 | `--color-bg-warm/card`, `--color-ink/-soft`, `--color-text-primary/secondary` | #FFF6E9 / #FFFFFF / #4A3B5C / #8B7FA3 |
| 反馈色 | `--color-correct`, `--color-wrong-soft` | #34C77B / #C9A6F5 |

## 全局样式约定
- **移动端优先**：html 基础字号 16px，≥768px 提升至 18px；body 设置 `min-height: 100dvh` + iPad Safari dvh 兼容回退。
- **安全区适配**：`.safe-top` / `.safe-bottom` 使用 `env(safe-area-inset-*)` 适配刘海屏。
- **触摸优化**：全局 `-webkit-tap-highlight-color: transparent`、`touch-action: manipulation`、`overscroll-behavior-y: none`。
- **玩具卡片**：`.toy-card` 使用 3px 实线边框 + 硬阴影模拟积木/贴纸质感，配套 `.toy-shadow` / `.toy-shadow-sm` 变体。
- **字体工具类**：`.font-display`、`.font-num` 封装设计令牌中的字体族。

## 动画系统
全部以 `@keyframes` + 组合类形式定义，供 Tailwind 直接复用：
- 漂浮：`float-slow/medium/fast`（±12px 上下 + 旋转）
- 漂移：`drift-slow/medium`（水平平移）
- 闪烁：`star-pulse`、`twinkle`
- 糖果飘落：`candy-fall` / `candy-fall-slow`
- 场景氛围：`cloud-drift`（云朵横移）、`balloon-rise`（热气球上浮）、`sun-glow`（光晕呼吸）

## 组件级风格约定
- **页面布局**：`Layout.tsx` 统一提供 `flex flex-col min-h-dvh relative` 容器、`DreamBackground` 天空层、顶部悬浮 header（`bg-white/70 backdrop-blur-md`）、底部导航与带路由过渡动画的 `<Outlet>`。
- **按钮与卡片**：统一使用彩虹渐变色（`from-rainbow-blue to-rainbow-purple` 等）、圆角 `rounded-full`、`toy-shadow-sm` 硬阴影、`min-h-[52px] touch-manipulation` 保证触控体验。
- **进度条**：`ProgressBar.tsx` 使用彩虹渐变填充 + 溢出隐藏，保持学科一致性。
- **反馈覆盖层**：`FeedbackOverlay.tsx` / `MathFeedbackOverlay.tsx` / `EnglishFeedbackOverlay.tsx` 基于 Framer Motion 的 `AnimatePresence` 实现入场/退出动画。

## 开发者规范
1. **颜色**：一律使用 `text-*` / `bg-*` 调用 `--color-*` 令牌，禁止硬编码十六进制值。
2. **字体**：标题用 `font-display`，数字用 `font-num`，正文走默认 body 字体栈。
3. **卡片**：需要实体感时使用 `.toy-card` 或 `.toy-shadow(-sm)`，避免手写 box-shadow。
4. **动画**：优先复用已定义的 `animate-*` 类；新增动画需在 `index.css` 中集中声明，不要在组件内写 style。
5. **移动端**：高度使用 `min-h-dvh`，安全区使用 `.safe-top/.safe-bottom`，按钮最小高度 ≥52px。
6. **交互**：可点击元素统一包裹 `motion.div` 并添加 `whileTap={{ scale: 0.9 }}` 等微反馈。