# 音频生成说明

所有发音用 Edge TTS 预生成为 mp3，存于 `public/audio/`，随代码部署。

前置（一次性）：`pip install edge-tts`（需联网）

## 我要更新什么 → 跑什么

| 想更新的内容 | 改这个文件 | 然后运行 |
|---|---|---|
| 汉字发音 | `src/data/characters.ts`（加/改字） | `python3 scripts/generate-char-audio.py` |
| 英语单词/字母/句子 | `src/data/english-questions.json` | `python3 scripts/generate-english-audio.py` |
| 对错鼓励语 | `scripts/generate-audio.py` 里的 `CORRECT_PHRASES` | `python3 scripts/generate-audio.py` |

> 数学模块不使用音频，无需生成。

## 两条规则

1. **只补新增**：脚本会跳过已存在的 mp3，只生成缺失的。新增内容直接重跑即可。
2. **要改已有音频**（换声音/语速/重录）：先删旧文件再重跑，否则不生效。
   ```bash
   rm -rf public/audio/en        # 例：重录全部英语音频
   python3 scripts/generate-english-audio.py
   ```

## 生成后必须提交

音频是静态资源，Vercel 本地构建上传，不提交则线上没有：
```bash
git add public/audio && git commit -m "chore: 更新音频"
```
