"""
Generate character pronunciation audio files using Microsoft Edge TTS.
Voice: zh-CN-XiaoxiaoNeural (warm, natural young female voice)
Output: public/audio/chars/{character}.mp3
"""
import asyncio
import edge_tts
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio', 'chars')
VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "-15%"  # slower for children to hear clearly
PITCH = "+0Hz"

# All 300 characters from characters.ts (Phase 1 + 2 + 3)
CHARACTERS = [
    # Phase 1 (~100)
    '一','二','三','四','五','六','七','八','九','十','百',
    '上','下','左','右','前','后','里','外','中',
    '大','小','多','少','长','高','好','白','红','绿','黄','冷','热',
    '天','地','日','月','星','云','风','雨','雪','花','草','树','木','山','水','火','土','石',
    '人','口','手','目','耳','头','心',
    '牛','马','羊','鸟','鱼','虫',
    '爸','妈','我','你','他',
    '去','来','走','跑','飞','看','见','说','叫','笑','哭','坐','站','打','画','写','读','玩',
    '的','了','不','在','有','没','和','是','年','今',
    # Phase 2 (~92)
    '春','夏','秋','冬','河','海','湖','田','路','桥','门','窗','竹','林',
    '狗','猫','鸡','鸭','兔','蛇',
    '眼','脸','牙','足','身',
    '米','面','果','瓜','奶','茶','饭','菜',
    '书','笔','纸','字','课','学','校','师','包',
    '衣','帽','鞋',
    '吃','喝','穿','洗','听','做','问','答','想','拿','放','开','关','找','给','让','回','过','种','送',
    '很','都','也','真','最','美','亮','黑','快','乐',
    '早','午','晚',
    '东','西','南','北',
    '家','公','车','船','电','话','光','色','点','样','方','可',
    # Phase 3 (~83)
    '拉','推','抱','拍','跳','爬','停','带','掉','借','还','讲','告','忘','记','数','变','换','选','搬',
    '远','近','新','旧','轻','重','胖','瘦','干','净','安','全','先','第','常',
    '朋','友','孩','姐','哥','弟','妹','爷','村','城','楼','房','院','床','桌','椅','灯','钟','球','歌','舞','事','物',
    '叶','根','朵','连',
    '对','错','正','反','像','比','更','把','被','所','以','为','每','些','两','几','又','就','那','这',
]


async def generate_char_audio(char: str):
    """Generate audio for a single character"""
    output_path = os.path.join(OUTPUT_DIR, f"{char}.mp3")
    if os.path.exists(output_path):
        return  # skip if already exists
    communicate = edge_tts.Communicate(char, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(output_path)


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    total = len(set(CHARACTERS))
    print(f"🎤 Generating audio for {total} unique characters...")

    # Generate in batches to avoid rate limiting
    unique_chars = list(set(CHARACTERS))
    batch_size = 20
    for i in range(0, len(unique_chars), batch_size):
        batch = unique_chars[i:i + batch_size]
        tasks = [generate_char_audio(c) for c in batch]
        await asyncio.gather(*tasks)
        done = min(i + batch_size, len(unique_chars))
        print(f"  ✅ {done}/{total} characters done")

    print(f"\n🎉 All {total} character audio files generated in {OUTPUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
