"""
Generate English pronunciation audio for the English module using Microsoft Edge TTS.

Reads src/data/english-questions.json and produces every audio asset the app
references, so audio always stays in sync with the question bank:
  - words     -> public/audio/en/words/{word}.mp3
  - letters   -> public/audio/en/letters/{LETTER}.mp3
  - sentences -> public/audio/en/sentences/{slug}.mp3

Voice: en-US-AnaNeural (child voice), slowed down for young learners.
"""
import asyncio
import json
import os
import re

import edge_tts

BASE = os.path.dirname(__file__)
QUESTIONS_PATH = os.path.join(BASE, '..', 'src', 'data', 'english-questions.json')
AUDIO_ROOT = os.path.join(BASE, '..', 'public', 'audio', 'en')

VOICE = "en-US-AnaNeural"   # young child voice
RATE = "-10%"               # slower for children to hear clearly
PITCH = "+0Hz"

WORD_RE = re.compile(r'^[a-z]+$')
LETTER_RE = re.compile(r'^[A-Z]$')


def slugify(sentence):
    s = sentence.lower().strip()
    s = re.sub(r'[^a-z0-9]+', '_', s)
    return s.strip('_')


def collect_assets():
    """Return (words, letters, sentences) sets referenced by the question bank."""
    with open(QUESTIONS_PATH, encoding='utf-8') as f:
        questions = json.load(f)

    words, letters, sentences = set(), set(), set()
    for q in questions:
        content = q.get('content', '')
        # sentences contain spaces; single words do not
        if ' ' in content:
            sentences.add(content)
        elif WORD_RE.match(content):
            words.add(content)

        for opt in q.get('options', []):
            if WORD_RE.match(opt):
                words.add(opt)
            elif LETTER_RE.match(opt):
                letters.add(opt)
    return words, letters, sentences


async def synth(text, output_path):
    if os.path.exists(output_path):
        return  # skip if already exists
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(output_path)


async def synth_batch(items, out_dir, filename_fn, text_fn, label):
    os.makedirs(out_dir, exist_ok=True)
    items = list(items)
    total = len(items)
    print(f"🎤 Generating {total} {label} audio files...")
    batch_size = 15
    for i in range(0, total, batch_size):
        batch = items[i:i + batch_size]
        tasks = [
            synth(text_fn(it), os.path.join(out_dir, filename_fn(it)))
            for it in batch
        ]
        await asyncio.gather(*tasks)
        done = min(i + batch_size, total)
        print(f"  ✅ {done}/{total} {label} done")


async def main():
    words, letters, sentences = collect_assets()

    # Letters are read out by name (e.g. "A"), which Edge TTS pronounces correctly.
    await synth_batch(
        words,
        os.path.join(AUDIO_ROOT, 'words'),
        filename_fn=lambda w: f"{w}.mp3",
        text_fn=lambda w: w,
        label='word',
    )
    await synth_batch(
        letters,
        os.path.join(AUDIO_ROOT, 'letters'),
        filename_fn=lambda l: f"{l}.mp3",
        text_fn=lambda l: l,
        label='letter',
    )
    await synth_batch(
        sentences,
        os.path.join(AUDIO_ROOT, 'sentences'),
        filename_fn=lambda s: f"{slugify(s)}.mp3",
        text_fn=lambda s: s,
        label='sentence',
    )

    print("\n🎉 All English audio generated under public/audio/en/")


if __name__ == "__main__":
    asyncio.run(main())
