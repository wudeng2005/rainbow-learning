"""
Generate 900 structured English questions (90 days x 10 per day).

Phased curriculum (mirrors the Chinese module's PHASE design):
  - Phase 1 (Day  1-30): 词汇 + 听力  -> listen_pic + pic_word
  - Phase 2 (Day 31-60): 加入自然拼读 -> + phonics
  - Phase 3 (Day 61-90): 加入句子情境 -> + listen_sentence

Question types:
  - listen_pic       听音选图: play word audio, pick the matching emoji
  - pic_word         看图选词: show emoji, pick the matching English word
  - phonics          自然拼读: play word audio, pick its beginning letter
  - listen_sentence  听句选图: play a short sentence, pick the matching emoji

Audio paths are deterministic and consumed by generate-english-audio.py:
  - words     -> /audio/en/words/{word}.mp3
  - letters   -> /audio/en/letters/{LETTER}.mp3
  - sentences -> /audio/en/sentences/{slug}.mp3

Output: src/data/english-questions.json
"""
import json
import os
import random
import re
from collections import Counter

random.seed(42)  # reproducible

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'english-questions.json')

MAX_DAY = 90
PER_DAY = 10

# ============ Themed vocabulary (word -> emoji) ============
# Every word is a common preschool word with a clear single-emoji picture.
THEMES = {
    'animals': [
        ('cat', '🐱'), ('dog', '🐶'), ('rabbit', '🐰'), ('bird', '🐦'),
        ('fish', '🐟'), ('bear', '🐻'), ('pig', '🐷'), ('cow', '🐮'),
        ('duck', '🦆'), ('frog', '🐸'), ('lion', '🦁'), ('tiger', '🐯'),
        ('monkey', '🐵'), ('horse', '🐴'), ('sheep', '🐑'), ('panda', '🐼'),
        ('fox', '🦊'), ('owl', '🦉'), ('elephant', '🐘'), ('penguin', '🐧'),
    ],
    'fruits': [
        ('apple', '🍎'), ('banana', '🍌'), ('grape', '🍇'), ('strawberry', '🍓'),
        ('watermelon', '🍉'), ('peach', '🍑'), ('lemon', '🍋'), ('cherry', '🍒'),
        ('pear', '🍐'), ('pineapple', '🍍'),
    ],
    'food': [
        ('bread', '🍞'), ('cake', '🍰'), ('egg', '🥚'), ('milk', '🥛'),
        ('rice', '🍚'), ('cookie', '🍪'), ('candy', '🍬'), ('pizza', '🍕'),
        ('hamburger', '🍔'), ('icecream', '🍦'),
    ],
    'colors': [
        ('red', '🔴'), ('blue', '🔵'), ('green', '🟢'), ('yellow', '🟡'),
        ('purple', '🟣'), ('black', '⚫'), ('white', '⚪'), ('brown', '🟤'),
        ('pink', '🩷'),
    ],
    'numbers': [
        ('one', '1️⃣'), ('two', '2️⃣'), ('three', '3️⃣'), ('four', '4️⃣'),
        ('five', '5️⃣'), ('six', '6️⃣'), ('seven', '7️⃣'), ('eight', '8️⃣'),
        ('nine', '9️⃣'), ('ten', '🔟'),
    ],
    'body': [
        ('eye', '👁️'), ('ear', '👂'), ('nose', '👃'), ('mouth', '👄'),
        ('hand', '✋'), ('foot', '🦶'), ('tooth', '🦷'),
    ],
    'family': [
        ('mom', '👩'), ('dad', '👨'), ('baby', '👶'), ('grandma', '👵'),
        ('grandpa', '👴'), ('sister', '👧'), ('brother', '👦'),
    ],
    'transport': [
        ('car', '🚗'), ('bus', '🚌'), ('train', '🚂'), ('bike', '🚲'),
        ('plane', '✈️'), ('boat', '⛵'), ('ship', '🚢'), ('truck', '🚚'),
    ],
    'nature': [
        ('sun', '☀️'), ('moon', '🌙'), ('star', '⭐'), ('cloud', '☁️'),
        ('rain', '🌧️'), ('tree', '🌳'), ('flower', '🌸'), ('rainbow', '🌈'),
        ('snow', '❄️'),
    ],
    'things': [
        ('ball', '⚽'), ('balloon', '🎈'), ('gift', '🎁'), ('book', '📖'),
        ('key', '🔑'), ('umbrella', '☂️'), ('hat', '🎩'), ('shoe', '👟'),
        ('clock', '🕐'), ('cup', '🥤'),
    ],
}

# Theme rotation for the "main theme of the day"
THEME_ORDER = list(THEMES.keys())

# Themes whose words work well as concrete nouns inside sentences.
SENTENCE_THEMES = ['animals', 'fruits', 'food', 'things', 'transport', 'nature']

# Simple sentence templates -> the {word} carries an emoji.
SENTENCE_TEMPLATES = [
    'I like the {word}',
    'I see a {word}',
    'It is a {word}',
    'I have a {word}',
    'Look at the {word}',
]


def slugify(sentence):
    s = sentence.lower().strip()
    s = re.sub(r'[^a-z0-9]+', '_', s)
    return s.strip('_')


def phase_of(day):
    if day <= 30:
        return 1
    if day <= 60:
        return 2
    return 3


def daily_type_layout(day):
    """Return a list of 10 question types for the given day, per phase."""
    phase = phase_of(day)
    if phase == 1:
        types = ['listen_pic'] * 5 + ['pic_word'] * 5
    elif phase == 2:
        types = ['listen_pic'] * 4 + ['pic_word'] * 3 + ['phonics'] * 3
    else:
        types = ['listen_pic'] * 3 + ['pic_word'] * 2 + ['phonics'] * 2 + ['listen_sentence'] * 3
    random.shuffle(types)
    return types


def pick_word_with_distractors(theme, count=3):
    """Pick one correct (word, emoji) plus distractors from the same theme."""
    pool = list(THEMES[theme])
    random.shuffle(pool)
    chosen = pool[:count]
    # if theme is too small, borrow from other themes
    if len(chosen) < count:
        extra = [wd for t in THEMES for wd in THEMES[t] if wd not in chosen]
        random.shuffle(extra)
        chosen += extra[: count - len(chosen)]
    correct = chosen[0]
    return correct, chosen


# ============ Per-type builders ============

def build_listen_pic(day, qid, theme):
    """Play word audio; choose the matching emoji among 3."""
    (word, emoji), group = pick_word_with_distractors(theme, 3)
    options = [g[1] for g in group]  # emojis
    random.shuffle(options)
    answer = options.index(emoji)
    return {
        'id': qid, 'subject': 'english', 'level': phase_of(day), 'type': 'listen_pic',
        'difficulty': phase_of(day), 'day': day,
        'prompt': '听一听，选出正确的图片',
        'content': word,
        'audio': f'/audio/en/words/{word}.mp3',
        'options': options,
        'answer': answer,
    }


def build_pic_word(day, qid, theme):
    """Show emoji; choose the matching English word among 3."""
    (word, emoji), group = pick_word_with_distractors(theme, 3)
    options = [g[0] for g in group]  # words
    random.shuffle(options)
    answer = options.index(word)
    return {
        'id': qid, 'subject': 'english', 'level': phase_of(day), 'type': 'pic_word',
        'difficulty': phase_of(day), 'day': day,
        'prompt': '这个用英语怎么说？',
        'content': word,
        'pic': emoji,
        'audio': f'/audio/en/words/{word}.mp3',
        'options': options,
        'answer': answer,
    }


def build_phonics(day, qid, theme):
    """Play word audio; choose its beginning letter among 3."""
    (word, _emoji), _group = pick_word_with_distractors(theme, 1)
    first = word[0].upper()
    # distractor letters
    letters = [chr(c) for c in range(ord('A'), ord('Z') + 1) if chr(c) != first]
    random.shuffle(letters)
    options = [first, letters[0], letters[1]]
    random.shuffle(options)
    answer = options.index(first)
    return {
        'id': qid, 'subject': 'english', 'level': phase_of(day), 'type': 'phonics',
        'difficulty': phase_of(day), 'day': day,
        'prompt': '听一听，它是哪个字母开头的？',
        'content': word,
        'audio': f'/audio/en/words/{word}.mp3',
        'options': options,
        'answer': answer,
    }


def build_listen_sentence(day, qid):
    """Play a short sentence; choose the matching emoji among 3."""
    theme = random.choice(SENTENCE_THEMES)
    (word, emoji), group = pick_word_with_distractors(theme, 3)
    template = random.choice(SENTENCE_TEMPLATES)
    sentence = template.format(word=word)
    options = [g[1] for g in group]  # emojis
    random.shuffle(options)
    answer = options.index(emoji)
    return {
        'id': qid, 'subject': 'english', 'level': phase_of(day), 'type': 'listen_sentence',
        'difficulty': phase_of(day), 'day': day,
        'prompt': '听一听，选出句子说的是什么',
        'content': sentence,
        'audio': f'/audio/en/sentences/{slugify(sentence)}.mp3',
        'options': options,
        'answer': answer,
    }


def generate_questions():
    questions = []
    for day in range(1, MAX_DAY + 1):
        theme = THEME_ORDER[(day - 1) % len(THEME_ORDER)]
        types_today = daily_type_layout(day)
        for n, qtype in enumerate(types_today, start=1):
            qid = f"e_d{day:02d}_q{n:02d}"
            if qtype == 'listen_pic':
                q = build_listen_pic(day, qid, theme)
            elif qtype == 'pic_word':
                q = build_pic_word(day, qid, theme)
            elif qtype == 'phonics':
                q = build_phonics(day, qid, theme)
            else:
                q = build_listen_sentence(day, qid)
            questions.append(q)
    return questions


def main():
    print("🦜 Generating 900 English questions...")
    questions = generate_questions()

    total_days = set(q['day'] for q in questions)
    print(f"  Total questions: {len(questions)}")
    print(f"  Days covered: {len(total_days)} (Day {min(total_days)} - Day {max(total_days)})")

    day_counts = Counter(q['day'] for q in questions)
    print(f"  Per-day min/max: {min(day_counts.values())}/{max(day_counts.values())}")

    ids = [q['id'] for q in questions]
    dupes = [i for i, c in Counter(ids).items() if c > 1]
    print("  ✅ No duplicate IDs" if not dupes else f"  ⚠️  Duplicate IDs: {dupes}")

    type_counts = Counter(q['type'] for q in questions)
    print(f"  Type distribution: {dict(type_counts)}")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"\n🎉 Written to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
