"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { NotificationWithTask, NotificationPreference } from "@/types/notification"

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session.user
}

export async function getNotifications(): Promise<ActionResult<NotificationWithTask[]>> {
  try {
    const user = await getCurrentUser()

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return { success: true, data: notifications }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch notifications",
    }
  }
}

export async function getUnreadCount(): Promise<ActionResult<number>> {
  try {
    const user = await getCurrentUser()

    const count = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    })

    return { success: true, data: count }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch unread count",
    }
  }
}

export async function markAsRead(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()

    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    })

    if (!notification) {
      return { success: false, error: "Notification not found" }
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    revalidatePath("/")
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark as read",
    }
  }
}

export async function markAllAsRead(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    })

    revalidatePath("/")
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark all as read",
    }
  }
}

export async function deleteNotification(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()

    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    })

    if (!notification) {
      return { success: false, error: "Notification not found" }
    }

    await prisma.notification.delete({
      where: { id },
    })

    revalidatePath("/")
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete notification",
    }
  }
}

export async function clearAllNotifications(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()

    await prisma.notification.deleteMany({
      where: { userId: user.id },
    })

    revalidatePath("/")
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear notifications",
    }
  }
}

// Notification Preferences
export async function getNotificationPreferences(): Promise<ActionResult<NotificationPreference>> {
  try {
    const user = await getCurrentUser()

    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    })

    // Create default preferences if not exists
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
        },
      })
    }

    return { success: true, data: prefs }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch preferences",
    }
  }
}

export async function updateNotificationPreferences(data: {
  inAppEnabled?: boolean
  dueDateReminder?: boolean
  reminderDaysBefore?: number
  dailyDigest?: boolean
  digestTime?: string | null
}): Promise<ActionResult<NotificationPreference>> {
  try {
    const user = await getCurrentUser()

    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data,
      },
    })

    revalidatePath("/settings")
    return { success: true, data: prefs }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update preferences",
    }
  }
}

// Helper function to create notifications (used by other parts of the system)
export async function createNotification(data: {
  userId: string
  type: "DUE_DATE_REMINDER" | "TASK_OVERDUE" | "DAILY_DIGEST" | "TASK_COMPLETED" | "SYSTEM"
  title: string
  message: string
  taskId?: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    // Check if user has in-app notifications enabled
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId: data.userId },
    })

    if (prefs && !prefs.inAppEnabled) {
      return { success: true, data: { id: "" } }
    }

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        taskId: data.taskId ?? null,
      },
    })

    return { success: true, data: { id: notification.id } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create notification",
    }
  }
}

// Check for due date reminders (can be called by a cron job)
export async function checkDueDateReminders(): Promise<ActionResult<number>> {
  try {
    const now = new Date()
    const users = await prisma.user.findMany({
      include: {
        notificationPreference: true,
        tasks: {
          where: {
            isCompleted: false,
            dueDate: { not: null },
          },
        },
      },
    })

    let notificationsCreated = 0

    for (const user of users) {
      const prefs = user.notificationPreference
      if (!prefs?.dueDateReminder) continue

      const reminderDays = prefs.reminderDaysBefore

      const MS_PER_DAY = 1000 * 60 * 60 * 24

      for (const task of user.tasks) {
        if (!task.dueDate) continue

        const daysUntilDue = Math.ceil(
          (task.dueDate.getTime() - now.getTime()) / MS_PER_DAY
        )

        // Check if task is due within the reminder period
        if (daysUntilDue === reminderDays) {
          // Check if we already sent a reminder for this task
          const existingReminder = await prisma.notification.findFirst({
            where: {
              userId: user.id,
              taskId: task.id,
              type: "DUE_DATE_REMINDER",
              createdAt: {
                gte: new Date(now.getTime() - MS_PER_DAY),
              },
            },
          })

          if (!existingReminder) {
            await createNotification({
              userId: user.id,
              type: "DUE_DATE_REMINDER",
              title: "Task Due Soon",
              message: `"${task.title}" is due in ${reminderDays} day${reminderDays === 1 ? "" : "s"}`,
              taskId: task.id,
            })
            notificationsCreated++
          }
        }

        // Check for overdue tasks
        if (daysUntilDue < 0) {
          const existingOverdue = await prisma.notification.findFirst({
            where: {
              userId: user.id,
              taskId: task.id,
              type: "TASK_OVERDUE",
              createdAt: {
                gte: new Date(now.getTime() - MS_PER_DAY),
              },
            },
          })

          if (!existingOverdue) {
            await createNotification({
              userId: user.id,
              type: "TASK_OVERDUE",
              title: "Task Overdue",
              message: `"${task.title}" is overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? "" : "s"}`,
              taskId: task.id,
            })
            notificationsCreated++
          }
        }
      }
    }

    return { success: true, data: notificationsCreated }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check reminders",
    }
  }
}
