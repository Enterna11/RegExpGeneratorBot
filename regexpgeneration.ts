import { Task } from "./interfaces"

let reg: any = {
    ' ': '\\s',
    bigEn: '[A-Z]',
    smallEn: '[a-z]',
    bigRu: '[А-ЯЁ]',
    smallRu: '[а-яё]',
    symbols: '!@#$%^&*()_-+=:;"\'<>\\|{},.\/'

}

async function optimizeRegexp(regexp: string): Promise<string> {
    return regexp
}

export default async function getRegexp(task: Task) {
    let response: string = ''
    for (let ch of task.str) {
        if (reg.hasOwnProperty(ch)) {
            response += reg[ch]
        } else if ((1040 <= ch.charCodeAt(0) && ch.charCodeAt(0) <= 1071) || ch.charCodeAt(0) === 1025) {
            response += reg.bigRu
        } else if ((1072 <= ch.charCodeAt(0) && ch.charCodeAt(0) <= 1103) || ch.charCodeAt(0) === 1105) {
            response += reg.smallRu
        } else if (65 <= ch.charCodeAt(0) && ch.charCodeAt(0) <= 90) {
            response += reg.bigEn
        } else if (97 <= ch.charCodeAt(0) && ch.charCodeAt(0) <= 122) {
            response += reg.smallEn
        }  else if (reg.symbols.includes(ch)) {
            response += '\\' + ch
        }
    response = await optimizeRegexp(response)
    }
    return response
}
