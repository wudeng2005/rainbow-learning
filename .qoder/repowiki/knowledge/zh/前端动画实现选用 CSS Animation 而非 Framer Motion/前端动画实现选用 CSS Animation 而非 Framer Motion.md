---
kind: design
name: 前端动画实现选用 CSS Animation 而非 Framer Motion
source: session
category: adr
---

# 前端动画实现选用 CSS Animation 而非 Framer Motion

_来源：dd02dbe → ab20740 提交周期内记录的编码计划——内容为规划时意图，实现可能滞后或有出入。_

**状态：** accepted

## 背景
在重设计答题页面时，需要为 FloatingDecorations（漂浮装饰）、OptionCard（选项卡片）和 FeedbackOverlay（反馈层）添加丰富的动画效果（如漂浮、弹跳、闪烁）。

## 决策驱动
- 运行时性能（避免 JS 线程阻塞）
- 依赖包体积控制
- 满足童趣视觉效果的必要性

## 备选方案
- **使用 CSS Animation** — 优点：浏览器原生支持，性能开销极低，不增加 bundle 体积，足以胜任装饰性动画；缺点：复杂交互状态下的动画编排不如 JS 库灵活
- **使用 Framer Motion** _（已否决）_ — 优点：API 强大，易于处理复杂交互和手势动画；缺点：引入额外的 JS 依赖，增加包体积，且在低端设备上可能因 JS 执行带来性能瓶颈

## 决策
明确决定使用 CSS animation 实现所有装饰性和反馈动画（如星星漂浮、卡片弹跳）， explicitly 拒绝引入 framer-motion 以避免潜在的性能问题和依赖膨胀。

## 影响
保持了应用的轻量级和高性能，特别是在低配移动设备上表现更佳。但对于未来可能需要的极复杂交互序列动画，开发成本会略高于使用专用动画库。