import Reg from './reg'
import Bot from 'node-telegram-bot-api'
import { Tasks } from "./interfaces"
import dotenv from 'dotenv'

dotenv.config()

const keyboard = {
    inline_keyboard: [
        [
            { text: 'Regexp', callback_data: 'regexp'}
        ]
    ]
}

const keyboard2 = {
    inline_keyboard: [
        [
            { text: 'Short', callback_data: 'short'}
        ]
    ]
}

const tasks: Tasks[] = []

if (process.env.TOKEN) {
    const bot = new Bot(process.env.TOKEN, {polling: true})

    setInterval(() => {
        checkTasks().catch(e => console.log(e))
    }, 500)

    bot.on('message', async msg => {
        const task = tasks.find(el => el.id === msg.chat.id)
        if (msg.text === '/start') {
            await bot.sendMessage(msg.chat.id, 'Hello', {reply_markup: keyboard})
        } else if (task && msg.text) {
            task.str = msg.text
        } else {
            await bot.sendMessage(msg.chat.id, 'Check command list')
        }
    })

    bot.on('callback_query', async callback => {
        const task = tasks.find(el => el.id === callback.message?.chat.id)
        if (callback.data === 'regexp' && callback.message) {
            if (!task) {
              tasks.push({id: callback.message.chat.id, isActive: true, str: '', isGenerate: false, time: new Date()})
            } else {
                task.isActive = true
                task.isGenerate = false
                task.str = ''
                task.time = new Date()
            }
            await bot.sendMessage(callback.message.chat.id, 'Введите текст')
        } else if (callback.data === 'short') {
            if (task) {
              let req = new Reg(task)
              await bot.sendMessage(task.id, await req.getShort(task.str))
                .then(() => task.isActive = false)
            }                      
        } 
    })

    async function checkTasks() {
        for (let i = 0; i < tasks.length; i++) {
            const now: Date = new Date()
            const task = tasks[i]
            if (!task.isGenerate && task.str.length > 0) {
                let req = new Reg(task)
                task.str = await req.getRegexp()
                await sendMessage(task.id, task.str)
                    .then(() => task.isGenerate = true)
            } 
            if ((now.getSeconds() - task.time.getSeconds() === 86400) || !task.isActive) {
                tasks.splice(i, 1)
                console.log('Task deleted')
            }
        }
    }

    async function sendMessage(chat_id:number, message:string) {
        await bot.sendMessage(chat_id, message, {reply_markup: keyboard2})
    }

} else {
    throw new Error('Missing token')
}