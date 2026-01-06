export type NotificationType =
  | "DUE_DATE_REMINDER"
  | "TASK_OVERDUE"
  | "DAILY_DIGEST"
  | "TASK_COMPLETED"
  | "SYSTEM"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  taskId: string | null
  task?: {
    id: string
    title: string
  } | null
  createdAt: Date
}

export interface NotificationPreference {
  id: string
  userId: string
  inAppEnabled: boolean
  dueDateReminder: boolean
  reminderDaysBefore: number
  dailyDigest: boolean
  digestTime: string | null
  createdAt: Date
  updatedAt: Date
}

export interface NotificationWithTask extends Notification {
  task: {
    id: string
    title: string
  } | null
}
