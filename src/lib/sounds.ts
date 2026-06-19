/** Web Audio API 音效 + 预录语音鼓励 */

let audioCtx: AudioContext | null = null

/** 答对语音文件列表 */
const CORRECT_AUDIO_FILES = [
  '/audio/correct/correct1.mp3',
  '/audio/correct/correct2.mp3',
  '/audio/correct/correct3.mp3',
  '/audio/correct/correct4.mp3',
  '/audio/correct/correct5.mp3',
  '/audio/correct/correct6.mp3',
]

/** 答错语音文件列表 */
const WRONG_AUDIO_FILES = [
  '/audio/wrong/wrong1.mp3',
  '/audio/wrong/wrong2.mp3',
  '/audio/wrong/wrong3.mp3',
]

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

/** 播放预录语音（随机选一条） */
function playVoice(files: string[]) {
  try {
    const file = files[Math.floor(Math.random() * files.length)]
    const audio = new Audio(file)
    audio.volume = 0.85
    audio.play().catch(() => {
      // 静默处理（用户未交互时无法自动播放）
    })
  } catch {
    // 静默处理
  }
}

/** 答对时播放语音鼓励 */
export function speakCorrectEncouragement() {
  playVoice(CORRECT_AUDIO_FILES)
}

/** 答错时播放温柔语音 */
export function speakWrongEncouragement() {
  playVoice(WRONG_AUDIO_FILES)
}

/** 答对音效：上升音阶 C4-E4-G4 */
export function playCorrectSound() {
  try {
    const ctx = getAudioContext()
    const notes = [261.63, 329.63, 392.0] // C4, E4, G4

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.value = 0.15

      const startTime = ctx.currentTime + i * 0.12
      osc.start(startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)
      osc.stop(startTime + 0.3)
    })
  } catch {
    // 静默处理
  }

  // 音效结束后播放语音鼓励
  setTimeout(() => speakCorrectEncouragement(), 350)
}

/** 答错音效：柔和低音 */
export function playWrongSound() {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.value = 196.0 // G3 低沉柔和
    gain.gain.value = 0.08

    osc.start(ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.stop(ctx.currentTime + 0.4)
  } catch {
    // 静默处理
  }

  // 音效结束后播放温柔语音
  setTimeout(() => speakWrongEncouragement(), 400)
}

/** 获得宝石音效：清脆叮铃 */
export function playGemSound() {
  try {
    const ctx = getAudioContext()
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.value = 0.12

      const startTime = ctx.currentTime + i * 0.08
      osc.start(startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25)
      osc.stop(startTime + 0.25)
    })
  } catch {
    // 静默处理
  }
}
