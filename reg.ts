import { Task } from "./interfaces"

export default class Reg {
    private task: Task
    constructor(task: Task) {
        this.task = task
    } 

    async getRegexp(): Promise<string> {
        const regExp = await this.convertToRegExp(this.task.str)
        const response = await this.optimizeRegexp(regExp)
        return response
    }

    async getShort(string: string): Promise<string> {
        let isChange: boolean = true
        let newString: string = ''
        while (isChange === true) {
            string = string.replace(/((\[A-Z]|\[a-z])\+*(\[a-z]|\[A-Z])\+*)|((\[A-Za-z]|\[A-Z]|\[a-z])\+*(\[a-z]|\[A-Za-z]|\[A-Z])\+*)/g, '[A-Za-z]+')
            string = string.replace(/((\\d|\\w)\+*(\[A-Za-z]|\[A-Z]|\[a-z])\+*)|((\[A-Za-z]|\[A-Z]|\[a-z])\+*(\\d|\\w)\+*)|((\[A-Za-z]|\[A-Z]|\[a-z])\+*(\\d|\\w)\+*(\[A-Za-z]|\[A-Z]|\[a-z])\+*)/g, '\\w+')
            string = string.replace(/((\[А-ЯЁ]|\[а-яё])\+*(\[а-яё]|\[А-ЯЁ])\+*)|((\[А-ЯЁа-яё]|\[А-ЯЁ]|\[а-яё])\+*(\[а-яё]|\[А-ЯЁа-яё]|\[А-ЯЁ])\+*)/g, '[А-ЯЁа-яё]+')
            console.log(string)
            if (newString === string) {
                isChange = false
            } else {
                newString = string
            }
        }
        return string
    }

    private async convertToRegExp(str: string) : Promise<string[]> {
        let regExp: string[] = []
        for (let ch of str) {
            let asciiCode: number = ch.charCodeAt(0)
            if (ch === ' ') {
                regExp.push('\\s')
            } else if ((1040 <= asciiCode && asciiCode <= 1071) || asciiCode === 1025) {
                regExp.push('[А-ЯЁ]')
            } else if ((1072 <= asciiCode && asciiCode <= 1103) || asciiCode === 1105) {
                regExp.push('[а-яё]')
            } else if (65 <= asciiCode && asciiCode <= 90) {
                regExp.push('[A-Z]')
            } else if (97 <= asciiCode && asciiCode <= 122) {
                regExp.push('[a-z]')
            } else if (48 <= asciiCode && asciiCode <= 57) {
                regExp.push('\\d')
            } else if ('./?^$+|'.includes(ch)) {
                regExp.push('\\' + ch)
            } else if ('!@#%&*()-_=\'"/;:[]{},'.includes(ch)) {
                regExp.push(ch)
            }
        }
        return regExp
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
}