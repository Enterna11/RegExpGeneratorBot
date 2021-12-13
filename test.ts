import getRegexp from './regexpgeneration'
import Bot from 'node-telegram-bot-api'
import {Tasks} from "./interfaces"

const keyboard = {
    inline_keyboard: [
        [
            { text: 'Regexp', callback_data: 'regexp'}
        ]
    ]
}

const tasks: Tasks[] = []

if (process.env.TOKEN) {
    const bot = new Bot(process.env.TOKEN, {polling: true})

    setInterval(() => {
        checkTasks().catch(e => console.log(e))
    }, 1000)

    bot.on('message', async msg => {
        const task = tasks.find((el: any) => msg.chat.id === el.id)
        if (task) {
            if (msg.text) {
                task.isActive = true
                task.str = msg.text
            }
        } else if (msg.text === '/start') {
            await bot.sendMessage(msg.chat.id, 'Hello', {
                reply_markup: keyboard
            })
        } else {
            await bot.sendMessage(msg.chat.id, 'Check command list')
        }
    })

    bot.on('callback_query', async callback => {
        if (callback.message) {
            tasks.push({id: callback.message.chat.id, isActive: false, str: ''})
            await bot.sendMessage(callback.message.chat.id, 'Введите текст')
        }
    })

    async function checkTasks() {
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].isActive) {
                const response = await getRegexp(tasks[i])
                await bot.sendMessage(tasks[i].id, response)
                tasks.splice(i, 1)
            }
        }
    }


} else {
    throw new Error('Нет токена')
}