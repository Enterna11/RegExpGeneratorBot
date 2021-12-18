export interface Task {
    id: number
    isActive: boolean
    isGenerate: boolean
    str: string
    time: Date
}

export type Tasks = Task