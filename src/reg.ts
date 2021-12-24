import Task from './interfaces'
import regExpList from './regExpList'

export default class Reg {
  private readonly task: Task
  constructor (task: Task) {
    this.task = task
  }

  async getRegexp (): Promise<string> {
    const regExp = await this.convertToRegExp(this.task.str)
    const response = await this.optimizeRegexp(regExp)
    return response
  }

  async getShort (string: string): Promise<string> {
    let newString: string = ''
    while (true) {
      string = string.replace(regExpList.combiningLettersEn, '[A-Za-z]+')
      string = string.replace(regExpList.cominingLettersNumbers, '\\w+')
      string = string.replace(regExpList.combiningLettersRu, '[А-ЯЁа-яё]+')
      if (newString === string) {
        break
      } else {
        newString = string
      }
    }
    return string
  }

  private async convertToRegExp (str: string): Promise<string[]> {
    const regExp: string[] = str.split('').map(ch => {
      const asciiCode: number = ch.charCodeAt(0)
      switch (true) {
        case (ch === ' '):
          return '\\s'
        case ((asciiCode >= 1040 && asciiCode <= 1071) || asciiCode === 1025):
          return '[А-ЯЁ]'
        case ((asciiCode >= 1072 && asciiCode <= 1103) || asciiCode === 1105):
          return '[а-яё]'
        case (asciiCode >= 65 && asciiCode <= 90):
          return '[A-Z]'
        case (asciiCode >= 97 && asciiCode <= 122):
          return '[a-z]'
        case (asciiCode >= 48 && asciiCode <= 57):
          return '\\d'
        case ('./?^$+|'.includes(ch)):
          return '\\' + ch
        case ('!@#%&*()-_=\'"/;:[]{},'.includes(ch)):
          return ch
        default:
          return ''
      }
    })
    return regExp
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

  private async count (ch: string, arr: string[]): Promise<number> {
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
