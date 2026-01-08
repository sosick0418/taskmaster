"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  startOfDay,
  endOfDay,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  differenceInHours,
} from "date-fns"
import type {
  AnalyticsData,
  DailyStats,
  WeeklyStats,
  MonthlyStats,
  PriorityDistribution,
  StatusDistribution,
  ActivityDay,
  ProductivityStats,
} from "@/types/analytics"

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

export async function getAnalyticsData(): Promise<ActionResult<AnalyticsData>> {
  try {
    const user = await getCurrentUser()
    const now = new Date()

    // Fetch all data in parallel
    const [
      daily,
      weekly,
      monthly,
      priorityDistribution,
      statusDistribution,
      activityHeatmap,
      productivity,
    ] = await Promise.all([
      getDailyStats(user.id, now),
      getWeeklyStats(user.id, now),
      getMonthlyStats(user.id, now),
      getPriorityDistribution(user.id),
      getStatusDistribution(user.id),
      getActivityHeatmap(user.id, now),
      getProductivityStats(user.id, now),
    ])

    return {
      success: true,
      data: {
        daily,
        weekly,
        monthly,
        priorityDistribution,
        statusDistribution,
        activityHeatmap,
        productivity,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch analytics",
    }
  }
}

async function getDailyStats(userId: string, now: Date): Promise<DailyStats[]> {
  const days = eachDayOfInterval({
    start: subDays(now, 30),
    end: now,
  })

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        {
          createdAt: {
            gte: subDays(now, 30),
          },
        },
        {
          updatedAt: {
            gte: subDays(now, 30),
          },
          isCompleted: true,
        },
      ],
    },
    select: {
      createdAt: true,
      updatedAt: true,
      isCompleted: true,
    },
  })

  return days.map((day) => {
    const dayStart = startOfDay(day)
    const dayEnd = endOfDay(day)

    const created = tasks.filter(
      (t) => t.createdAt >= dayStart && t.createdAt <= dayEnd
    ).length

    const completed = tasks.filter(
      (t) =>
        t.isCompleted &&
        t.updatedAt >= dayStart &&
        t.updatedAt <= dayEnd
    ).length

    return {
      date: format(day, "MMM d"),
      created,
      completed,
    }
  })
}

async function getWeeklyStats(userId: string, now: Date): Promise<WeeklyStats[]> {
  const weeks = eachWeekOfInterval({
    start: subWeeks(now, 12),
    end: now,
  })

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        {
          createdAt: {
            gte: subWeeks(now, 12),
          },
        },
        {
          updatedAt: {
            gte: subWeeks(now, 12),
          },
          isCompleted: true,
        },
      ],
    },
    select: {
      createdAt: true,
      updatedAt: true,
      isCompleted: true,
    },
  })

  return weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart)

    const created = tasks.filter(
      (t) => t.createdAt >= weekStart && t.createdAt <= weekEnd
    ).length

    const completed = tasks.filter(
      (t) =>
        t.isCompleted &&
        t.updatedAt >= weekStart &&
        t.updatedAt <= weekEnd
    ).length

    const completionRate = created > 0 ? Math.round((completed / created) * 100) : 0

    return {
      week: format(weekStart, "MMM d"),
      created,
      completed,
      completionRate,
    }
  })
}

async function getMonthlyStats(userId: string, now: Date): Promise<MonthlyStats[]> {
  const months = eachMonthOfInterval({
    start: subMonths(now, 12),
    end: now,
  })

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        {
          createdAt: {
            gte: subMonths(now, 12),
          },
        },
        {
          updatedAt: {
            gte: subMonths(now, 12),
          },
          isCompleted: true,
        },
      ],
    },
    select: {
      createdAt: true,
      updatedAt: true,
      isCompleted: true,
    },
  })

  return months.map((monthStart) => {
    const monthEnd = endOfMonth(monthStart)

    const created = tasks.filter(
      (t) => t.createdAt >= monthStart && t.createdAt <= monthEnd
    ).length

    const completed = tasks.filter(
      (t) =>
        t.isCompleted &&
        t.updatedAt >= monthStart &&
        t.updatedAt <= monthEnd
    ).length

    const completionRate = created > 0 ? Math.round((completed / created) * 100) : 0

    return {
      month: format(monthStart, "MMM yyyy"),
      created,
      completed,
      completionRate,
    }
  })
}

async function getPriorityDistribution(userId: string): Promise<PriorityDistribution[]> {
  const tasks = await prisma.task.groupBy({
    by: ["priority"],
    where: { userId },
    _count: true,
  })

  const total = tasks.reduce((sum, t) => sum + t._count, 0)
  const priorities: Array<"LOW" | "MEDIUM" | "HIGH" | "URGENT"> = ["LOW", "MEDIUM", "HIGH", "URGENT"]

  return priorities.map((priority) => {
    const found = tasks.find((t) => t.priority === priority)
    const count = found?._count ?? 0
    return {
      priority,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }
  })
}

async function getStatusDistribution(userId: string): Promise<StatusDistribution[]> {
  const tasks = await prisma.task.groupBy({
    by: ["status"],
    where: { userId },
    _count: true,
  })

  const total = tasks.reduce((sum, t) => sum + t._count, 0)
  const statuses: Array<"TODO" | "IN_PROGRESS" | "DONE"> = ["TODO", "IN_PROGRESS", "DONE"]

  return statuses.map((status) => {
    const found = tasks.find((t) => t.status === status)
    const count = found?._count ?? 0
    return {
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }
  })
}

async function getActivityHeatmap(userId: string, now: Date): Promise<ActivityDay[]> {
  // Get activity for the last year
  const startDate = subDays(now, 365)
  const days = eachDayOfInterval({ start: startDate, end: now })

  // Fetch completed tasks and subtasks in parallel
  const [tasks, subtasks] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        updatedAt: {
          gte: startDate,
        },
        isCompleted: true,
      },
      select: {
        updatedAt: true,
      },
    }),
    prisma.subTask.findMany({
      where: {
        task: { userId },
        updatedAt: {
          gte: startDate,
        },
        isCompleted: true,
      },
      select: {
        updatedAt: true,
      },
    }),
  ])

  // Count completions per day (tasks + subtasks)
  const completionsByDay = new Map<string, number>()

  tasks.forEach((task) => {
    const dateKey = format(task.updatedAt, "yyyy-MM-dd")
    completionsByDay.set(dateKey, (completionsByDay.get(dateKey) ?? 0) + 1)
  })

  subtasks.forEach((subtask) => {
    const dateKey = format(subtask.updatedAt, "yyyy-MM-dd")
    completionsByDay.set(dateKey, (completionsByDay.get(dateKey) ?? 0) + 1)
  })

  // Find max for level calculation
  const maxCount = Math.max(...Array.from(completionsByDay.values()), 1)

  // Level thresholds for activity heatmap
  const LEVEL_THRESHOLD_LOW = 0.25
  const LEVEL_THRESHOLD_MEDIUM = 0.5
  const LEVEL_THRESHOLD_HIGH = 0.75

  return days.map((day) => {
    const dateKey = format(day, "yyyy-MM-dd")
    const count = completionsByDay.get(dateKey) ?? 0

    // Calculate level (0-4)
    let level: 0 | 1 | 2 | 3 | 4 = 0
    if (count > 0) {
      const ratio = count / maxCount
      if (ratio <= LEVEL_THRESHOLD_LOW) level = 1
      else if (ratio <= LEVEL_THRESHOLD_MEDIUM) level = 2
      else if (ratio <= LEVEL_THRESHOLD_HIGH) level = 3
      else level = 4
    }

    return {
      date: dateKey,
      count,
      level,
    }
  })
}

async function getProductivityStats(userId: string, now: Date): Promise<ProductivityStats> {
  // Get tasks and subtasks for calculations
  const yearAgo = subDays(now, 365)
  const thisWeekStart = startOfWeek(now)
  const lastWeekStart = startOfWeek(subWeeks(now, 1))
  const lastWeekEnd = endOfWeek(lastWeekStart)

  const [tasks, allSubtasks, completedSubtasks, thisWeekSubtasks] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        isCompleted: true,
        updatedAt: {
          gte: yearAgo,
        },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.subTask.count({
      where: { task: { userId } },
    }),
    prisma.subTask.count({
      where: { task: { userId }, isCompleted: true },
    }),
    prisma.subTask.count({
      where: {
        task: { userId },
        isCompleted: true,
        updatedAt: { gte: thisWeekStart },
      },
    }),
  ])

  // Calculate streaks (including subtasks)
  const subtasksForStreak = await prisma.subTask.findMany({
    where: {
      task: { userId },
      isCompleted: true,
      updatedAt: { gte: yearAgo },
    },
    select: { updatedAt: true },
  })

  const completionDays = new Set([
    ...tasks.map((t) => format(t.updatedAt, "yyyy-MM-dd")),
    ...subtasksForStreak.map((s) => format(s.updatedAt, "yyyy-MM-dd")),
  ])

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Check consecutive days from today going back
  for (let i = 0; i <= 365; i++) {
    const day = format(subDays(now, i), "yyyy-MM-dd")
    if (completionDays.has(day)) {
      tempStreak++
      if (i === currentStreak) {
        currentStreak = tempStreak
      }
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
      tempStreak = 0
    }
  }
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak
  }

  // This week vs last week (tasks only for comparison)
  const thisWeekCompleted = tasks.filter(
    (t) => t.updatedAt >= thisWeekStart
  ).length

  const lastWeekCompleted = tasks.filter(
    (t) => t.updatedAt >= lastWeekStart && t.updatedAt <= lastWeekEnd
  ).length

  const weekOverWeekChange = lastWeekCompleted > 0
    ? Math.round(((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100)
    : thisWeekCompleted > 0 ? 100 : 0

  // Average completion time
  const completedWithTime = tasks.filter(
    (t) => t.createdAt && t.updatedAt
  )
  const avgHours = completedWithTime.length > 0
    ? completedWithTime.reduce((sum, t) => sum + differenceInHours(t.updatedAt, t.createdAt), 0) / completedWithTime.length
    : null

  // Most productive day of week (including subtasks)
  const dayCount: Record<string, number> = {}
  ;[...tasks, ...subtasksForStreak].forEach((item) => {
    const day = format(item.updatedAt, "EEEE")
    dayCount[day] = (dayCount[day] ?? 0) + 1
  })

  const mostProductiveDay = Object.entries(dayCount).length > 0
    ? Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    : null

  return {
    currentStreak,
    longestStreak,
    thisWeekCompleted,
    lastWeekCompleted,
    weekOverWeekChange,
    averageCompletionTime: avgHours ? Math.round(avgHours) : null,
    mostProductiveDay,
    subtasks: {
      total: allSubtasks,
      completed: completedSubtasks,
      thisWeekCompleted: thisWeekSubtasks,
    },
  }
}
