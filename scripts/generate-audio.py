"""
Generate encouraging voice audio files using Microsoft Edge TTS.
Voice: zh-CN-XiaoxiaoNeural (warm, natural young female voice)
"""
import asyncio
import edge_tts
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "-10%"  # slightly slower for children
PITCH = "+5Hz"  # slightly higher pitch, warmer

# Correct answer encouragements
correct_messages = [
    ("correct1", "太棒了！你答对了！"),
    ("correct2", "你真厉害！"),
    ("correct3", "好聪明呀，答对了！"),
    ("correct4", "哇，你做到了！"),
    ("correct5", "真棒！又学会一个！"),
    ("correct6", "你越来越厉害了！"),
]

# Wrong answer gentle encouragements  
wrong_messages = [
    ("wrong1", "没关系，我们一起看看"),
    ("wrong2", "加油，你可以的"),
    ("wrong3", "慢慢来，不着急"),
]

async def generate_audio(filename: str, text: str, subdir: str):
    output_path = os.path.join(OUTPUT_DIR, subdir, f"{filename}.mp3")
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(output_path)
    print(f"  ✅ Generated: {output_path}")

async def main():
    print("🎤 Generating correct answer audio...")
    for filename, text in correct_messages:
        await generate_audio(filename, text, "correct")
    
    print("🎤 Generating wrong answer audio...")
    for filename, text in wrong_messages:
        await generate_audio(filename, text, "wrong")
    
    print("\n🎉 All audio files generated!")

if __name__ == "__main__":
    asyncio.run(main())
