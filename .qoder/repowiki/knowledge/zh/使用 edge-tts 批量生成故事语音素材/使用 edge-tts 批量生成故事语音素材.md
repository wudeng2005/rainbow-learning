---
kind: design
name: 使用 edge-tts 批量生成故事语音素材
source: session
category: adr
---

# 使用 edge-tts 批量生成故事语音素材

_来源：ce8e4d3 → a113f89 提交周期内记录的编码计划——内容为规划时意图，实现可能滞后或有出入。_

**状态：** accepted

## 背景
故事朗读需要每句独立音频以支持逐句播放和新字同步高亮，手动录制成本过高且难以迭代。

## 决策驱动
- 批量自动化生成
- 音色适合儿童故事（活泼年轻女声）
- 增量生成避免重复工作

## 备选方案
- **edge-tts + zh-CN-XiaoyiNeural 批量生成** — 优点：免费、中文自然度高、音色亲切；支持速率/音调调节；Python 脚本易于集成到构建流程
- **浏览器 Web Speech API 实时合成** _（已否决）_ — 优点：无需预先生成音频文件；缺点：各浏览器兼容性差异大；无法保证音色一致性；离线不可用；性能不稳定

## 决策
新建 generate-story-audio.py 脚本，读取 stories.json 使用 edge-tts 的 zh-CN-XiaoyiNeural 语音，按 -20% 语速、+3Hz 音调生成 public/audio/stories/{story_id}_s{index}.mp3，支持跳过已存在文件的增量生成。

## 影响
构建流程需安装 Python 依赖并执行脚本；音频文件随项目发布；后续修改故事文本后需重新生成对应音频。