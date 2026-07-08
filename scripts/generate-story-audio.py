"""
Generate story sentence audio files using Microsoft Edge TTS.
Voice: zh-CN-XiaoyiNeural (lively young female voice, great for storytelling)
Output: public/audio/stories/{story_id}_s{index}.mp3
"""
import asyncio
import edge_tts
import json
import os

SCRIPT_DIR = os.path.dirname(__file__)
PROJECT_DIR = os.path.join(SCRIPT_DIR, '..')
STORIES_PATH = os.path.join(PROJECT_DIR, 'src', 'data', 'stories.json')
OUTPUT_DIR = os.path.join(PROJECT_DIR, 'public', 'audio', 'stories')

VOICE = "zh-CN-XiaoyiNeural"
RATE = "-20%"    # slower for children story narration
PITCH = "+3Hz"   # slightly higher, more lively


async def generate_sentence_audio(story_id: str, sentence_index: int, text: str):
    """Generate audio for a single story sentence"""
    output_path = os.path.join(OUTPUT_DIR, f"{story_id}_s{sentence_index}.mp3")
    if os.path.exists(output_path):
        return  # skip if already exists
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(output_path)


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(STORIES_PATH, 'r', encoding='utf-8') as f:
        stories = json.load(f)

    # Count total sentences
    total = sum(len(s['sentences']) for s in stories)
    print(f"📖 Found {len(stories)} stories with {total} sentences total")
    print(f"🎤 Voice: {VOICE}, Rate: {RATE}, Pitch: {PITCH}")
    print(f"📁 Output: {OUTPUT_DIR}\n")

    done = 0
    for story in stories:
        story_id = story['id']
        print(f"  📖 {story_id}: {story['title']}")
        for i, sentence in enumerate(story['sentences']):
            output_path = os.path.join(OUTPUT_DIR, f"{story_id}_s{i}.mp3")
            if os.path.exists(output_path):
                done += 1
                continue
            await generate_sentence_audio(story_id, i, sentence['text'])
            done += 1
            print(f"    ✅ [{done}/{total}] {sentence['text']}")
        print()

    print(f"🎉 All {done} story audio files generated!")


if __name__ == "__main__":
    asyncio.run(main())
