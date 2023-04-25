import { Date as SugarDate } from 'sugar'

export function dateFromString(value: string): Date {
  const dateNum = Date.parse(value)
  if (!isNaN(dateNum)) {
    return new Date(dateNum)
  }

  const date = SugarDate.create(value)
  if (!date) {
    // TODO:
    return new Date()
  }

  return date
}

export function covertCamelCaseToSentence(name: string) {
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
    return str.toUpperCase()
  })
}