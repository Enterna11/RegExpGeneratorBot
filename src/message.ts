export const normalMessage = {
  greeting: 'Здравствуйте',
  searchMessage: 'Введите текст',
  validationMessage: 'Введите минимальное количество символов и обязательные символы.\nНапример: 8, Aa1'
}

export const errorMessage = {
  maxLength: 'Количество введенных обязательных символов, превышает максимальную длину строки.\nПроверьте введенные данные и повторите ввод',
  unknownCommand: 'Неизвестная команда',
  wrongForm: 'Неверная форма, смотрите пример'
}

export const keyboard = {
  regExp: {
    inline_keyboard: [
      [
        {
          text: 'SearchRegexp',
          callback_data: 'search'
        }
      ],
      [
        {
          text: 'ValidationRegexp',
          callback_data: 'validation'
        }
      ]
    ]
  },
  short: {
    inline_keyboard: [
      [
        {
          text: 'Short',
          callback_data: 'short'
        }
      ]
    ]
  }
}
