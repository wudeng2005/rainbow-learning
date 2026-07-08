---
kind: design
name: 中文题库通过 Python 脚本预生成 JSON 而非运行时动态构建
source: session
category: adr
---

# 中文题库通过 Python 脚本预生成 JSON 而非运行时动态构建

_来源：7dbed80 → ad3a8f5 提交周期内记录的编码计划——内容为规划时意图，实现可能滞后或有出入。_

**状态：** accepted

## 背景
需要从 300 个汉字的元数据（characters.ts）程序化生成 900 道题的题库，包含干扰项生成、去重校验等复杂逻辑。

## 决策驱动
- 生成逻辑复杂（同音/形近字干扰、阶段配比控制）
- 避免运行时代码膨胀
- 便于人工审查和修正生成的题目

## 备选方案
- **Python 脚本预生成 questions.json** — 优点：生成逻辑与业务代码解耦、可独立验证输出、questions.json 体积可控（100-150KB）、构建时打包
- **运行时 TypeScript 动态生成** _（已否决）_ — 优点：单仓管理、无需额外构建步骤；缺点：增加 bundle 体积、生成逻辑污染业务代码、难以单独测试生成规则

## 决策
创建 scripts/generate-chinese-questions.py 读取 src/data/characters.ts，按阶段和题型配比生成 src/data/questions.json，内置 ID 唯一性和同日去重检查。

## 影响
生成脚本成为中文题库的单一事实来源，新增题型只需修改脚本；但需要维护 Python 依赖和构建流程，且 questions.json 需纳入版本管理。