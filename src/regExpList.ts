export default {
  combiningLettersEn: /((\[A-Z]|\[a-z])\+*(\[a-z]|\[A-Z])\+*)|((\[A-Za-z]|\[A-Z]|\[a-z])\+*(\[a-z]|\[A-Za-z]|\[A-Z])\+*)/g,
  combiningLettersRu: /((\[А-ЯЁ]|\[а-яё])\+*(\[а-яё]|\[А-ЯЁ])\+*)|((\[А-ЯЁа-яё]|\[А-ЯЁ]|\[а-яё])\+*(\[а-яё]|\[А-ЯЁа-яё]|\[А-ЯЁ])\+*)/g,
  cominingLettersNumbers: /((\\d|\\w)\+*(\[A-Za-z]|\[A-Z]|\[a-z])\+*)|((\[A-Za-z]|\[A-Z]|\[a-z])\+*(\\d|\\w)\+*)/g,
  inputData: /^\d+,\s*[\W\w]+$/
}
