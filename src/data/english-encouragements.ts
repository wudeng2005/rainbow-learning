/** 英语模块 - 彩虹鹦鹉主题鼓励语（全部积极鼓励式） */

export const englishCorrectMessages = [
  'Great job! 太棒了！🌈',
  'Wonderful! 你真厉害！🦜',
  'Perfect! 答对啦！⭐',
  'Yeah! 你是英语小明星！✨',
  'Awesome! 继续加油！🎉',
  'Cool! 你听得真准！🎧',
  'Bravo! 好聪明呀！🌟',
  'Nice! 你越来越棒啦！🎈',
]

export const englishWrongMessages = [
  '没关系，再听一次试试！💪',
  '加油，你可以的！🌟',
  '差一点点，下次一定行！🌈',
  '慢慢来，不着急哦！🦜',
  '勇敢尝试就很棒！⭐',
  '没关系，我们一起学！🎧',
]

export function getRandomEnglishMessage(messages: string[]) {
  return messages[Math.floor(Math.random() * messages.length)]
}
