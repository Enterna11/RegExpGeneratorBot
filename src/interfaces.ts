import * as MyClass from './regClasses'

export type Tasks = MyClass.TaskBaseClass

export interface TasksList {
  [key: number]: Tasks
}

export type AnyTask = TasksList

export interface CountCharacter {
  [key: string]: number
}

export interface ValidText {
  isValid: boolean
  length: number
  text: string
}
