import { Task } from "./interfaces"

const reg: any = {
    space: '\\s',
    bigEn: '[A-Z]',
    smallEn: '[a-z]',
    bigRu: '[А-ЯЁ]',
    smallRu: '[а-яё]',
    specialCharacters: './?^$+|',
    symbols: '!@#%&*()-_=\'"/;:[]{},',
    numbers: '\\d'
}

export default class Reg {
    private task: Task
    constructor(task: Task) {
        this.task = task
    } 

    private async count(ch: any, arr: Array<any>): Promise<number> {
        let j: number = 0
        for (let char of arr) {
            if (char === ch) {
                j++
            } else {
                return j
            }
        }
        return j
    }
    
    private async optimizeRegexp(regexp: string[]): Promise<string>{
        let newRegexp = ''
        while (regexp.length > 0) {
            let current = regexp.splice(0, 1)[0]
            let quantity = await this.count(current, regexp)
            if (quantity > 0) {
                newRegexp += current + '+'
                regexp.splice(0, quantity)
            } else {
                newRegexp += current
            }
        }
        return newRegexp
    }

    private async convertToRegExp(str: string) {
        let regExp: string[] = []
        for (let ch of str) {
            let asciiCode: number = ch.charCodeAt(0)
            if (ch === ' ') {
                regExp.push(reg.space)
            } else if ((1040 <= asciiCode && asciiCode <= 1071) || asciiCode === 1025) {
                regExp.push(reg.bigRu)
            } else if ((1072 <= asciiCode && asciiCode <= 1103) || asciiCode === 1105) {
                regExp.push(reg.smallRu)
            } else if (65 <= asciiCode && asciiCode <= 90) {
                regExp.push(reg.bigEn)
            } else if (97 <= asciiCode && asciiCode <= 122) {
                regExp.push(reg.smallEn)
            } else if (48 <= asciiCode && asciiCode <= 57) {
                regExp.push(reg.numbers)
            } else if (reg.specialCharacters.includes(ch)) {
                regExp.push('\\' + ch)
            } else if (reg.symbols.includes(ch)) {
                regExp.push(ch)
            }
        }
        return regExp
    }
    
    async getRegexp(): Promise<string> {
        const regExp = await this.convertToRegExp(this.task.str)
        const response = await this.optimizeRegexp(regExp)
        return response
    }
}