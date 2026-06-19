/** 数学模块 - 糖果主题鼓励语 */

export const mathCorrectMessages = [
  '太厉害了！🍬',
  '答对啦！你真聪明！🌈',
  '哇，你是数学小天才！⭐',
  '完美！奖你一颗糖！🍭',
  '真棒！继续加油！🧁',
  '你的小脑袋转得真快！✨',
  '太厉害了，一下就找到了！🎉',
  '聪明的小朋友！🍫',
]

export const mathWrongMessages = [
  '没关系，再想想看！💪',
  '加油，你可以的！🌟',
  '差一点点，下次一定行！🍬',
  '慢慢来，不着急哦！🌈',
  '勇敢尝试就很棒！⭐',
  '没关系，我们一起学！🍭',
]

export function getRandomMathMessage(messages: string[]) {
  return messages[Math.floor(Math.random() * messages.length)]
}
