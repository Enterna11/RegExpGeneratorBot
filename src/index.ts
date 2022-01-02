import Bot from 'node-telegram-bot-api'
import dotenv from 'dotenv'
import getData from './task'

dotenv.config()

const token: string | undefined = process.env.TOKEN

if (token === undefined) {
  throw new Error('Missing token')
}

export const bot = new Bot(token, { polling: true })

bot.on('message', msg => {
  (async (): Promise<void> => {
    await getData(msg, null)
  })().catch(e => console.error(e))
})

bot.on('callback_query', callback => {
  (async (): Promise<void> => {
    await getData(null, callback)
  })().catch(e => console.error(e))
})

export async function sendMessage (chatId: number, message: string, buttons: Bot.InlineKeyboardMarkup = { inline_keyboard: [] }): Promise<void> {
  await bot.sendMessage(chatId, message, { reply_markup: buttons })
}
