"""
Generate 900 structured math questions (90 days x 10 per day).
All 8 question types are mixed across every day (no phase gating),
with number ranges gently ramping up over the 90 days.
Outputs to src/data/math-questions.json
"""
import json
import os
import random
from collections import Counter

random.seed(42)  # reproducible

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'math-questions.json')

MAX_DAY = 90
PER_DAY = 10

# ============ Emoji Pools ============
# Cute, child-friendly emojis grouped for variety.
OBJECT_EMOJIS = [
    '🍎', '🍌', '🍓', '🍊', '🍇', '🍉', '🍬', '🍭', '🍩', '🍪', '🧁',
    '🐱', '🐶', '🐰', '🐥', '🐟', '🐝', '🦋', '🐸', '🐢', '🐧',
    '⭐', '🌸', '🌺', '🌻', '🎈', '🎁', '🌈', '❤️', '☁️', '⚽',
]

# Pattern (emoji repeating) emoji trios for distractors
PATTERN_TRIOS = [
    (['🍎', '🍌', '🍇']),
    (['🔴', '🔵', '🟢']),
    (['⭐', '🌙', '☀️']),
    (['🐱', '🐶', '🐰']),
    (['🌸', '🌺', '🌻']),
    (['🎈', '🎁', '🎉']),
    (['🐢', '🐟', '🐙']),
    (['🍪', '🍩', '🍰']),
    (['🚗', '🚌', '🚂']),
    (['🐧', '🐥', '🦆']),
    (['🔺', '🔵', '🟡']),
    (['🍓', '🍊', '🍇']),
]

SHAPE_GROUPS = [
    (['🔴', '🔵']), (['🟡', '🟢']), (['⬛', '⬜']), (['🔺', '🔻']),
    (['🍎', '🍊']), (['🌸', '🌺']), (['⭐', '🌙']), (['🐱', '🐶']),
    (['🐸', '🦎']), (['🍬', '🍭']), (['🐥', '🐧']), (['🍩', '🍪']),
    (['🌞', '🌝']), (['🚗', '🚌']), (['🎀', '🎗️']),
]


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def day_scale(day):
    """Return a difficulty tier 1-3 based on the day (gentle global ramp)."""
    # Even though types are mixed all the way, numbers grow a bit over 90 days.
    if day <= 30:
        return 1
    if day <= 60:
        return 2
    return 3


def num_ceiling(day):
    """Max number magnitude used for counting/arithmetic, ramps with day."""
    # day 1 -> ~6, day 90 -> ~20
    return int(6 + (day / MAX_DAY) * 14)


def make_number_options(correct, spread, count=3):
    """Build numeric options (as strings) around the correct answer."""
    opts = {correct}
    attempts = 0
    while len(opts) < count and attempts < 50:
        delta = random.randint(-spread, spread)
        cand = correct + delta
        if cand >= 0:
            opts.add(cand)
        attempts += 1
    # fallback fill
    n = correct + 1
    while len(opts) < count:
        if n >= 0:
            opts.add(n)
        n += 1
    options = list(opts)
    random.shuffle(options)
    str_options = [str(o) for o in options]
    answer = str_options.index(str(correct))
    return str_options, answer


# ============ Per-type builders ============

def build_pattern(day, qid):
    tier = day_scale(day)
    trio = random.choice(PATTERN_TRIOS)
    a, b, c = trio[0], trio[1], trio[2]
    if tier == 1:
        # ABAB
        seq = [a, b, a, b, a, '❓']
        correct = b
    elif tier == 2:
        # AABB or ABAB with 3rd distractor
        if random.random() < 0.5:
            seq = [a, a, b, a, a, '❓']
            correct = b
        else:
            seq = [a, b, c, a, b, '❓']
            correct = c
    else:
        # ABC ABC
        seq = [a, b, c, a, b, '❓']
        correct = c
    options = [a, b, c]
    random.shuffle(options)
    answer = options.index(correct)
    return {
        'id': qid, 'subject': 'math', 'level': tier, 'type': 'pattern',
        'difficulty': tier, 'day': day, 'prompt': '接下来是什么？',
        'data': {'type': 'pattern', 'sequence': seq},
        'answer': answer, 'options': options,
    }


def build_counting(day, qid):
    tier = day_scale(day)
    ceil = num_ceiling(day)
    emoji = random.choice(OBJECT_EMOJIS)
    count = random.randint(2, clamp(ceil, 3, 20))
    layout = random.choice(['grid', 'scattered'])
    options, answer = make_number_options(count, spread=2, count=3)
    return {
        'id': qid, 'subject': 'math', 'level': tier, 'type': 'counting',
        'difficulty': tier, 'day': day, 'prompt': '数一数，一共有几个？',
        'data': {'type': 'counting', 'emoji': emoji, 'count': count, 'layout': layout},
        'answer': answer, 'options': options,
    }


def build_comparison(day, qid):
    tier = day_scale(day)
    ceil = num_ceiling(day)
    emoji = random.choice(OBJECT_EMOJIS)
    hi = clamp(ceil, 4, 20)
    left = random.randint(1, hi)
    right = random.randint(1, hi)
    mode = random.random()
    if mode < 0.15:
        # equal
        right = left
        options = ['一样多', '不一样多']
        answer = 0
        prompt = '两边一样多吗？'
    elif mode < 0.6:
        while right == left:
            right = random.randint(1, hi)
        options = ['左边多', '右边多']
        answer = 0 if left > right else 1
        prompt = '哪边多？'
    else:
        while right == left:
            right = random.randint(1, hi)
        options = ['左边少', '右边少']
        answer = 0 if left < right else 1
        prompt = '哪边少？'
    return {
        'id': qid, 'subject': 'math', 'level': tier, 'type': 'comparison',
        'difficulty': tier, 'day': day, 'prompt': prompt,
        'data': {'type': 'comparison',
                 'left': {'emoji': emoji, 'count': left},
                 'right': {'emoji': emoji, 'count': right}},
        'answer': answer, 'options': options,
    }


def build_shape(day, qid):
    tier = day_scale(day)
    base, odd = random.choice(SHAPE_GROUPS)
    odd_index = random.randint(0, 3)
    items = [base if i != odd_index else odd for i in range(4)]
    options = list(items)
    return {
        'id': qid, 'subject': 'math', 'level': tier, 'type': 'shape_recognition',
        'difficulty': tier, 'day': day, 'prompt': '哪个不一样？',
        'data': {'type': 'shape_recognition', 'items': items, 'oddIndex': odd_index},
        'answer': odd_index, 'options': options,
    }


def build_addition(day, qid):
    tier = day_scale(day)
    ceil = num_ceiling(day)
    emoji = random.choice(OBJECT_EMOJIS)
    total_max = clamp(ceil, 5, 20)
    left = random.randint(1, max(1, total_max - 1))
    right = random.randint(1, max(1, total_max - left))
    result = left + right
    options, answer = make_number_options(result, spread=2, count=3)
    return {
        'id': qid, 'subject': 'math', 'level': tier, 'type': 'addition',
        'difficulty': tier, 'day': day, 'prompt': f'{left} + {right} = ?',
        'data': {'type': 'addition', 'left': left, 'right': right, 'emoji': emoji},
        'answer': answer, 'options': options,
    }


def build_subtraction(day, qid):
    tier = day_scale(day)
    ceil = num_ceiling(day)
    emoji = random.choice(OBJECT_EMOJIS)
    total_max = clamp(ceil, 5, 20)
    left = random.randint(2, total_max)
    right = random.randint(1, left)
    result = left - right
    options, answer = make_number_options(result, spread=2, count=3)
    return {
        'id': qid, 'subject': 'math', 'level': tier, 'type': 'subtraction',
        'difficulty': tier, 'day': day, 'prompt': f'{left} - {right} = ?',
        'data': {'type': 'subtraction', 'left': left, 'right': right, 'emoji': emoji},
        'answer': answer, 'options': options,
    }


ADD_TEMPLATES = [
    '树上有{start}只{name}，又飞来{change}只，一共有几只？',
    '小明有{start}个{name}，妈妈又给了{change}个，一共有几个？',
    '篮子里有{start}个{name}，又放进{change}个，一共有几个？',
    '草地上有{start}朵{name}，又开了{change}朵，一共有几朵？',
]
SUB_TEMPLATES = [
    '盘子里有{start}个{name}，吃掉了{change}个，还剩几个？',
    '树上有{start}只{name}，飞走了{change}只，还剩几只？',
    '小红有{start}个{name}，送给朋友{change}个，还剩几个？',
    '花园里有{start}朵{name}，摘走了{change}朵，还剩几朵？',
]
WORD_NAMES = [
    ('🐦', '小鸟'), ('🍎', '苹果'), ('🍬', '糖果'), ('🌸', '花'),
    ('🐱', '小猫'), ('🎈', '气球'), ('🐟', '小鱼'), ('🍓', '草莓'),
    ('🐰', '兔子'), ('⭐', '星星'),
]


def build_word_problem(day, qid):
    tier = day_scale(day)
    ceil = num_ceiling(day)
    total_max = clamp(ceil, 5, 20)
    emoji, name = random.choice(WORD_NAMES)
    if random.random() < 0.5:
        op = 'add'
        start = random.randint(1, max(1, total_max - 1))
        change = random.randint(1, max(1, total_max - start))
        result = start + change
        prompt = random.choice(ADD_TEMPLATES).format(start=start, change=change, name=name)
    else:
        op = 'subtract'
        start = random.randint(2, total_max)
        change = random.randint(1, start)
        result = start - change
        prompt = random.choice(SUB_TEMPLATES).format(start=start, change=change, name=name)
    options, answer = make_number_options(result, spread=2, count=3)
    return {
        'id': qid, 'subject': 'math', 'level': tier, 'type': 'word_problem',
        'difficulty': tier, 'day': day, 'prompt': prompt,
        'data': {'type': 'word_problem', 'emoji': emoji,
                 'start': start, 'change': change, 'op': op},
        'answer': answer, 'options': options,
    }


def build_number_sequence(day, qid):
    tier = day_scale(day)
    ceil = num_ceiling(day)
    # step grows with tier
    if tier == 1:
        step = random.choice([1, 2])
    elif tier == 2:
        step = random.choice([2, 3, 5])
    else:
        step = random.choice([2, 3, 5, 10])
    start = random.randint(0, clamp(ceil, 3, 10))
    length = 5
    full = [start + step * i for i in range(length)]
    blank_pos = random.choice([length - 1, length - 2])
    correct = full[blank_pos]
    sequence = [v if i != blank_pos else None for i, v in enumerate(full)]
    options, answer = make_number_options(correct, spread=max(2, step), count=3)
    return {
        'id': qid, 'subject': 'math', 'level': tier, 'type': 'number_sequence',
        'difficulty': tier, 'day': day, 'prompt': '横线上应该填什么数字？',
        'data': {'type': 'number_sequence', 'sequence': sequence},
        'answer': answer, 'options': options,
    }


BUILDERS = {
    'pattern': build_pattern,
    'counting': build_counting,
    'comparison': build_comparison,
    'shape_recognition': build_shape,
    'addition': build_addition,
    'subtraction': build_subtraction,
    'word_problem': build_word_problem,
    'number_sequence': build_number_sequence,
}

# Daily type layout: 10 questions covering all 8 types,
# arithmetic types weighted slightly higher.
DAILY_TYPES = (
    ['addition'] * 2 +
    ['subtraction'] * 2 +
    ['pattern'] * 1 +
    ['counting'] * 1 +
    ['comparison'] * 1 +
    ['shape_recognition'] * 1 +
    ['word_problem'] * 1 +
    ['number_sequence'] * 1
)


def generate_questions():
    questions = []
    for day in range(1, MAX_DAY + 1):
        types_today = list(DAILY_TYPES)
        random.shuffle(types_today)
        for n, qtype in enumerate(types_today, start=1):
            qid = f"m_d{day:02d}_q{n:02d}"
            q = BUILDERS[qtype](day, qid)
            questions.append(q)
    return questions


def main():
    print("🔢 Generating 900 math questions...")
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
