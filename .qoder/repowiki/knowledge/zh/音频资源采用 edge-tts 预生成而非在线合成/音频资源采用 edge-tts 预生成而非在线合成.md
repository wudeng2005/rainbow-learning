---
kind: design
name: 音频资源采用 edge-tts 预生成而非在线合成
source: session
category: adr
---

# 音频资源采用 edge-tts 预生成而非在线合成

_来源：f55d7d3 → 7dbed80 提交周期内记录的编码计划——内容为规划时意图，实现可能滞后或有出入。_

**状态：** accepted

## 背景
英语题需要大量单词、字母、短句的发音素材，若每次播放都调用 TTS API 会产生网络延迟、配额消耗和不稳定因素。

## 决策驱动
- 播放即时性（无网络请求）
- 离线可用
- 生成一次反复使用

## 备选方案
- **edge-tts 预生成 mp3 到 public/audio/en/*** — 优点：渲染时 `new Audio(path).play()` 即播，零延迟；可缓存；童声 `en-US-AnaNeural` + RATE -10% 适合幼儿；缺点：题库变更需重新跑脚本；占用少量静态存储
- **运行时调用浏览器 SpeechSynthesis 或云端 TTS** _（已否决）_ — 优点：无需预生成文件；缺点：首次播放有延迟；不同设备音色不一致；云端方案增加依赖和配额限制

## 决策
新建 `scripts/generate-english-audio.py` 复刻 `generate-char-audio.py`，用 `en-US-AnaNeural` 童声 + 放慢语速批量生成 mp3 至 `public/audio/en/words/`、`/letters/`、`/sentences/`，Renderer 内直接 `new Audio(question.audio).play()` 并提供 🔊 重播按钮。

## 影响
题库更新后需重新执行生成脚本；但运行时播放路径与现有鼓励音一致，无需额外运行时依赖。