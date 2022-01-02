import * as MyTask from './interfaces'
import regExpList from './regExpList'

export abstract class TaskBaseClass {
  isActive: boolean
  isGeneration: boolean
  taskText: string | null
  time: Date
  isShort: boolean | undefined
  maxLength: number | undefined
  constructor (isActive = true, isGeneration = false, taskText = null, time = new Date(), isShort = undefined, maxLength = undefined) {
    this.isActive = isActive
    this.isGeneration = isGeneration
    this.taskText = taskText
    this.time = time
    this.isShort = isShort
    this.maxLength = maxLength
  }

  protected async convertToRegExp (str: string): Promise<string[]> {
    const regExp: string[] = str.split('').map(ch => {
      switch (true) {
        case (/\s/.test(ch)):
          return '\\s'
        case (/[А-ЯЁ]/.test(ch)):
          return '[А-ЯЁ]'
        case (/[а-яё]/.test(ch)):
          return '[а-яё]'
        case (/[A-Z]/.test(ch)):
          return '[A-Z]'
        case (/[a-z]/.test(ch)):
          return '[a-z]'
        case (/\d/.test(ch)):
          return '\\d'
        case (/\W/.test(ch)):
          return '\\W'
        default:
          return ''
      }
    })
    return regExp
  }

  protected async count (ch: string, arr: string[]): Promise<number> {
    let j: number = 0
    for (const char of arr) {
      if (char === ch) {
        j++
      } else {
        return j
      }
    }
    return j
  }
}

export class SearchReg extends TaskBaseClass {
  async getRegExp (): Promise<string> {
    if (this.taskText !== null) {
      const regExp = await this.convertToRegExp(this.taskText)
      const response = await this.optimizeRegexp(regExp)
      return response
    } else {
      return 'Missing text'
    }
  }

  async getShort (): Promise<string> {
    let newString: string = ''
    let string = this.taskText
    if (string !== null) {
      while (true) {
        string = string.replace(regExpList.combiningLettersEn, '[A-Za-z]+')
        string = string.replace(regExpList.cominingLettersNumbers, '\\w+')
        string = string.replace(regExpList.combiningLettersRu, '[А-ЯЁа-яё]+')
        if (newString === string) {
          return string
        } else {
          newString = string
        }
      }
    } else {
      return 'Missing text'
    }
  }

  private async optimizeRegexp (regexp: string[]): Promise<string> {
    let newRegexp = ''
    while (regexp.length > 0) {
      const current = regexp.splice(0, 1)[0]
      const quantity = await this.count(current, regexp)
      if (quantity > 0) {
        newRegexp += current + '+'
        regexp.splice(0, quantity)
      } else {
        newRegexp += current
      }
    }
    return newRegexp
  }
}

export class ValidationReg extends TaskBaseClass {
  async getRegExp (): Promise<string> {
    if (this.maxLength !== undefined && this.taskText !== null && this.maxLength !== null) {
      const regExp = await this.convertToRegExp(this.taskText)
      const obj = await this.getCount(regExp)
      const validationRegExp = await this.getValidationRegexp(obj, this.maxLength)
      return validationRegExp
    } else {
      return 'Wrong request'
    }
  }

  private async getCount (str: string[]): Promise<MyTask.CountCharacter> {
    const countCharcter: MyTask.CountCharacter = {}
    while (str.length > 0) {
      const current = str.splice(0, 1)[0]
      const quantity = await this.count(current, str)
      str.splice(0, quantity)
      if (Object.prototype.hasOwnProperty.call(countCharcter, current)) {
        countCharcter[current] += quantity + 1
      } else {
        countCharcter[current] = quantity + 1
      }
    }
    return countCharcter
  }

  private async getValidationRegexp (obj: MyTask.CountCharacter, length: number): Promise<string> {
    const string: string[] = []
    const symbols: string = Object.prototype.hasOwnProperty.call(obj, '\\W') ? '[\\W\\w]' : '[^\\W]'
    for (const el of Object.keys(obj)) {
      string.push(`(?=.*${el}{${obj[el]},})`)
    }
    return `^${string.join('')}${symbols}{${length},}$`
  }
}
