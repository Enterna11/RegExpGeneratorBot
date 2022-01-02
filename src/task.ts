import regExpList from './regExpList'
import * as MyTask from './interfaces'
import * as MyClass from './regClasses'
import { CallbackQuery, Message } from 'node-telegram-bot-api'
import { sendMessage } from './index'
import { errorMessage, normalMessage, keyboard } from './message'

let tasks: MyTask.AnyTask = {}

setInterval(() => {
  checkAndWorkWithTask()
    .catch(e => console.error(e))
}, 300)
setInterval(() => {
  clearTasks()
    .catch(e => console.error(e))
}, 1000)

export default async function getData (message: Message | null, callback: CallbackQuery | null): Promise<void> {
  if (message !== null) {
    await getAndSortMessage(message).catch(e => console.error(e))
  } else if (callback !== null) {
    await getAndSortCallbackData(callback).catch(e => console.error(e))
  }
}

async function getAndSortMessage (message: Message): Promise<void> {
  const task = tasks[message.chat.id]
  const taskType = task instanceof MyClass.SearchReg ? 'search' : 'validation'
  if (message.text !== undefined) {
    if (message.text === '/start') {
      await sendMessage(message.chat.id, normalMessage.greeting, keyboard.regExp)
    } else if (task !== undefined) {
      await sortTask(message.chat.id, taskType, message.text)
    } else {
      await sendMessage(message.chat.id, errorMessage.unknownCommand)
    }
  }
}

async function getAndSortCallbackData (callback: CallbackQuery): Promise<void> {
  if (callback.message !== undefined && callback.data !== undefined) {
    const id: number = callback.message.chat.id
    const messageText: string = callback.data === 'search' ? normalMessage.searchMessage : normalMessage.validationMessage
    if (callback.data !== 'short') {
      await sendMessage(id, messageText)
    }
    await sortTask(id, callback.data)
  }
}

async function sortTask (id: number, taskType: string, text: string | null = null): Promise<void> {
  const task = tasks[id]
  if (task === undefined) {
    await createTask(taskType, id)
  } else {
    await changeTask(task, taskType, text, id)
  }
}

async function createTask (type: string, id: number): Promise<void> {
  tasks[id] = type === 'search' ? new MyClass.SearchReg() : new MyClass.ValidationReg()
}

async function changeTask (task: MyTask.Tasks, type: string, text: string | null, id: number): Promise<void> {
  if (task instanceof MyClass.SearchReg && type !== 'short') {
    task.taskText = text
    task.isGeneration = false
  } else if (task instanceof MyClass.ValidationReg && text !== null) {
    const checkedText = await validTaskData(id, text)
    if (checkedText.isValid) {
      task.maxLength = checkedText.length
      task.taskText = checkedText.text
    }
  } else if (type === 'short' && task instanceof MyClass.SearchReg) {
    task.isShort = true
  }
}

async function validTaskData (chatId: number, str: string): Promise<MyTask.ValidText> {
  let isValid: boolean = false
  const arr = str.split(',')
  if (!regExpList.inputData.test(str)) {
    await sendMessage(chatId, errorMessage.wrongForm)
  } else if (Number(arr[0]) < arr[1].trim().length) {
    await sendMessage(chatId, errorMessage.maxLength)
  } else {
    isValid = true
  }
  return { isValid: isValid, length: Number(arr[0]), text: arr[1].trim() }
}

async function checkAndWorkWithTask (): Promise<void> {
  for (const key of Object.keys(tasks)) {
    const taskKey: number = Number(key)
    const task = tasks[taskKey]
    if (task.isActive) {
      if (task instanceof MyClass.SearchReg) {
        if (!task.isGeneration && task.taskText !== null) {
          await task.getRegExp()
            .then(async (result) => {
              task.isGeneration = true
              task.taskText = result
              await sendMessage(taskKey, result, keyboard.short)
            })
        } else if (task.isShort === true) {
          await task.getShort()
            .then(async (result) => {
              task.isActive = false
              await sendMessage(taskKey, result)
            })
        }
      } else if (task instanceof MyClass.ValidationReg) {
        if (task.maxLength !== null && task.taskText !== null) {
          await task.getRegExp()
            .then(async (result) => {
              task.isActive = false
              await sendMessage(taskKey, result)
            })
        }
      }
    }
  }
}

async function clearTasks (): Promise<void> {
  const now: Date = new Date()
  for (const key of Object.keys(tasks)) {
    const taskKey: number = Number(key)
    const task = tasks[taskKey]
    if ((now.getSeconds() - task.time.getSeconds() >= 84600) || !task.isActive) {
      const { [taskKey]: _, ...t } = tasks
      tasks = t
      console.log('Task deleted: ', _, Object.keys(tasks).length)
    }
  }
}
