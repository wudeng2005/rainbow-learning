/** 答对时的随机鼓励语 */
export const correctMessages = [
  '太棒了！🌟',
  '你真厉害！✨',
  '好聪明呀！🎉',
  '又学会一个！🌈',
  '闪闪发光！⭐',
  '哇，你做到了！🎊',
  '彩虹为你闪耀！🌈',
]

/** 答错时的安慰语 */
export const wrongMessages = [
  '没关系，我们一起看看~',
  '加油，你可以的！💪',
  '慢慢来，不着急~',
  '差一点点就对了！',
  '这个有点难，你已经很勇敢了！',
]

/** 完成今日任务的鼓励语 */
export const completeMessages = [
  '今天的彩虹画完了！你是最闪亮的那颗星！🌟',
  '又一天的学习冒险结束了，你真勇敢！🎉',
  '你是最棒的小学者！🌈',
]

/** 复习完成的鼓励语 */
export const reviewCompleteMessages = [
  '你把之前学过的都记住了！越来越厉害了！🌟',
  '复习完成！你的记忆力真好！✨',
  '太棒了，这些字你都会了！🎉',
]

/** 从数组中随机取一条 */
export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)]
}
