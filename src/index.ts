import Reg from './reg'
import Bot from 'node-telegram-bot-api'
import Task from './interfaces'
import dotenv from 'dotenv'

dotenv.config()

const token: string | undefined = process.env.TOKEN

const keyboard = [
  {
    inline_keyboard: [
      [
        { text: 'Regexp', callback_data: 'regexp' }
      ]
    ]
  },
  {
    inline_keyboard: [
      [
        { text: 'Short', callback_data: 'short' }
      ]
    ]
  }
]

const tasks: Task[] = []

if (token !== undefined) {
  const bot = new Bot(token, { polling: true })

  setInterval(() => {
    checkAndWorkWithTask().catch(e => console.log(e))
  }, 500)

  bot.on('message', msg => {
    (async (): Promise<void> => {
      const task = tasks.find(el => el.id === msg.chat.id)
      if (msg.text === '/start') {
        await sendMessage(msg.chat.id, 'Hello', keyboard[0]).catch(e => console.log(e))
      } else if (task !== undefined && msg.text !== undefined) {
        task.str = msg.text
      } else {
        await sendMessage(msg.chat.id, 'Check command list').catch(e => console.log(e))
      }
    })().catch(e => console.log(e))
  })

  bot.on('callback_query', callback => {
    (async (): Promise<void> => {
      const task = tasks.find(el => el.id === callback.message?.chat.id)
      if (callback.data === 'regexp' && callback.message !== undefined) {
        if (task === undefined) {
          tasks.push({ id: callback.message.chat.id, isActive: true, str: '', isGenerate: false, isShort: false, time: new Date() })
        } else {
          task.isGenerate = false
          task.str = ''
          task.time = new Date()
        }
        await bot.sendMessage(callback.message.chat.id, 'Введите текст')
      } else if (callback.data === 'short') {
        if (task !== undefined) {
          task.isShort = true
        }
      }
    })().catch(e => console.log(e))
  })

  async function checkAndWorkWithTask (): Promise<void> {
    for (const task of tasks) {
      const now: Date = new Date()
      const req = new Reg(task)
      if (!task.isGenerate && task.str.length > 0) {
        task.str = await req.getRegexp()
        await sendMessage(task.id, task.str, keyboard[1])
          .then(() => { task.isGenerate = true })
      }
      if (task.isShort) {
        await sendMessage(task.id, await req.getShort(task.str))
          .then(() => { task.isActive = false })
      }
      if ((now.getSeconds() - task.time.getSeconds() >= 84600) || !task.isActive) {
        tasks.splice(tasks.indexOf(task), 1)
        console.log('Task deleted')
      }
    }
  }

  async function sendMessage (chatId: number, message: string, buttons: Bot.InlineKeyboardMarkup = { inline_keyboard: [] }): Promise<void> {
    await bot.sendMessage(chatId, message, { reply_markup: buttons })
  }
} else {
  throw new Error('Missing token')
}
