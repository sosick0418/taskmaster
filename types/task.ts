import type { Priority, TaskStatus } from "@/lib/validations/task"

export interface Task {
  id: string
  title: string
  description: string | null
  priority: Priority
  status: TaskStatus
  isCompleted: boolean
  dueDate: Date | null
  order: number
  tags: { id: number; name: string }[]
}
