/** Web Audio API 音效 + 预录语音鼓励 */

let audioCtx: AudioContext | null = null

// ─── 全局音频管理器：跟踪所有活动音频实例，支持一键停止 ───
const activeAudios = new Set<HTMLAudioElement>()
const pendingTimers = new Set<ReturnType<typeof setTimeout>>()

// ─── 音频元素缓存：同一路径复用 Audio 实例，避免重复下载与实例创建 ───
const audioCache = new Map<string, HTMLAudioElement>()

/** 获取（或创建）指定路径的缓存 Audio 元素 */
function getCachedAudio(src: string): HTMLAudioElement {
  let audio = audioCache.get(src)
  if (!audio) {
    audio = new Audio(src)
    audio.preload = 'auto'
    audioCache.set(src, audio)
  }
  return audio
}

/** 静默预加载音频文件（后台下载进缓存，不打断当前播放） */
export function preloadAudio(src: string) {
  try {
    const audio = getCachedAudio(src)
    audio.load()
  } catch {
    // 静默处理
  }
}

/** 预加载答题反馈语音（进入答题页时调用，弱网下提前缓冲） */
export function preloadEncouragementSounds() {
  CORRECT_AUDIO_FILES.forEach(preloadAudio)
  WRONG_AUDIO_FILES.forEach(preloadAudio)
}

function trackAudio(audio: HTMLAudioElement) {
  activeAudios.add(audio)
  const cleanup = () => activeAudios.delete(audio)
  audio.addEventListener('ended', cleanup, { once: true })
  audio.addEventListener('error', cleanup, { once: true })
}

function trackTimer(id: ReturnType<typeof setTimeout>) {
  pendingTimers.add(id)
}

/** 停止所有正在播放的音频和待执行的语音定时器 */
export function stopAllAudio() {
  // 停止所有 HTML Audio
  activeAudios.forEach(audio => {
    audio.pause()
    audio.currentTime = 0
  })
  activeAudios.clear()
  // 取消待执行的 setTimeout（如延迟播放的鼓励语音）
  pendingTimers.forEach(id => clearTimeout(id))
  pendingTimers.clear()
  // 停止浏览器语音合成
  try { window.speechSynthesis?.cancel() } catch { /* 静默 */ }
}

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
    const audio = getCachedAudio(file)
    audio.currentTime = 0
    audio.volume = 0.85
    trackAudio(audio)
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

/** 浏览器语音合成兜底（预录音频缺失时朗读英文文本） */
function speakEnglishFallback(text: string) {
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    utter.rate = 0.8 // 放慢，方便孩子听清
    synth.speak(utter)
  } catch {
    // 静默处理
  }
}

/**
 * 播放英文发音：优先使用预录音频，失败时用浏览器语音合成兜底。
 * @param text 英文单词/字母/句子（用于兜底朗读）
 * @param src  预录音频路径（可选）
 */
export function speakEnglish(text: string, src?: string) {
  if (!src) {
    speakEnglishFallback(text)
    return
  }
  try {
    const audio = getCachedAudio(src)
    audio.currentTime = 0
    audio.volume = 1
    trackAudio(audio)
    audio.play().catch(() => speakEnglishFallback(text))
  } catch {
    speakEnglishFallback(text)
  }
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
  const t = setTimeout(() => { pendingTimers.delete(t); speakCorrectEncouragement() }, 350)
  trackTimer(t)
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
  const t = setTimeout(() => { pendingTimers.delete(t); speakWrongEncouragement() }, 400)
  trackTimer(t)
}

/** 播放汉字读音音频（返回 Promise，音频播完时 resolve） */
export function playCharAudio(audioPath: string | null | undefined): Promise<void> {
  return new Promise((resolve) => {
    if (!audioPath) { resolve(); return }
    try {
      const audio = getCachedAudio(audioPath)
      audio.currentTime = 0
      audio.volume = 0.85
      trackAudio(audio)
      audio.onended = () => resolve()
      audio.onerror = () => resolve()
      audio.play().catch(() => resolve())
    } catch {
      resolve()
    }
  })
}

/** 播放故事句子语音（返回 Promise，音频播完时 resolve） */
export function playStoryAudio(storyId: string, sentenceIndex: number): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audio = getCachedAudio(`/audio/stories/${storyId}_s${sentenceIndex}.mp3`)
      audio.currentTime = 0
      audio.volume = 1
      trackAudio(audio)
      audio.onended = () => resolve()
      audio.onerror = () => resolve()
      audio.play().catch(() => resolve())
      // 预加载下一句，让故事播放更连贯
      preloadAudio(`/audio/stories/${storyId}_s${sentenceIndex + 1}.mp3`)
    } catch {
      resolve()
    }
  })
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

/** 点击音效：轻柔的“pop”声，提供即时反馈 */
export function playTapSound() {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.06)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  } catch {
    // 静默处理
  }
}
