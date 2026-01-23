"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  reorderTasksSchema,
  deleteTaskSchema,
  toggleTaskCompleteSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type UpdateTaskStatusInput,
  type ReorderTasksInput,
} from "@/lib/validations/task"

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

export async function getTasks() {
  try {
    const user = await getCurrentUser()

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      include: {
        tags: true,
        subtasks: { orderBy: { order: "asc" } },
      },
      orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    })

    return { success: true as const, data: tasks }
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch tasks",
    }
  }
}

export async function getTasksByStatus(status: string) {
  try {
    const user = await getCurrentUser()

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        status: status as "TODO" | "IN_PROGRESS" | "DONE",
      },
      include: {
        tags: true,
        subtasks: { orderBy: { order: "asc" } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })

    return { success: true as const, data: tasks }
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch tasks",
    }
  }
}

export async function getTaskStats() {
  try {
    const user = await getCurrentUser()

    const [
      totalTasks,
      inProgressTasks,
      completedTasks,
      totalSubtasks,
      completedSubtasks,
    ] = await Promise.all([
      prisma.task.count({ where: { userId: user.id } }),
      prisma.task.count({ where: { userId: user.id, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { userId: user.id, status: "DONE" } }),
      prisma.subTask.count({
        where: { task: { userId: user.id } },
      }),
      prisma.subTask.count({
        where: { task: { userId: user.id }, isCompleted: true },
      }),
    ])

    // Combined stats (tasks + subtasks)
    const total = totalTasks + totalSubtasks
    const completed = completedTasks + completedSubtasks
    const inProgress = inProgressTasks

    return {
      success: true as const,
      data: {
        total,
        inProgress,
        completed,
        todo: totalTasks - inProgressTasks - completedTasks,
        // Detailed breakdown
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
        },
        subtasks: {
          total: totalSubtasks,
          completed: completedSubtasks,
        },
      },
    }
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
    }
  }
}

export async function createTask(
  input: CreateTaskInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser()
    const validated = createTaskSchema.parse(input)

    // Get the highest order for the status
    const highestOrder = await prisma.task.findFirst({
      where: { userId: user.id, status: validated.status },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const task = await prisma.task.create({
      data: {
        title: validated.title,
        description: validated.description ?? null,
        status: validated.status,
        priority: validated.priority,
        dueDate: validated.dueDate ?? null,
        isCompleted: validated.status === "DONE",
        order: (highestOrder?.order ?? -1) + 1,
        userId: user.id,
        ...(validated.tags.length > 0 && {
          tags: {
            connectOrCreate: validated.tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      },
    })

    revalidatePath("/tasks")
    return { success: true, data: { id: task.id } }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to create tasks" }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    }
  }
}

export async function updateTask(
  input: UpdateTaskInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser()
    const validated = updateTaskSchema.parse(input)

    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: { id: validated.id, userId: user.id },
    })

    if (!existingTask) {
      return { success: false, error: "Task not found" }
    }

    const { id, tags, dueDate, title, description, status, priority, isCompleted } = validated
    const nextIsCompleted = isCompleted ?? (status !== undefined ? status === "DONE" : undefined)

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description ?? null }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(nextIsCompleted !== undefined && { isCompleted: nextIsCompleted }),
        ...(dueDate !== undefined && { dueDate: dueDate ?? null }),
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      },
    })

    revalidatePath("/tasks")
    return { success: true, data: { id: task.id } }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to update tasks" }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    }
  }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const validated = deleteTaskSchema.parse({ id })

    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: { id: validated.id, userId: user.id },
    })

    if (!existingTask) {
      return { success: false, error: "Task not found" }
    }

    await prisma.task.delete({
      where: { id: validated.id },
    })

    revalidatePath("/tasks")
    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to delete tasks" }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    }
  }
}

export async function toggleTaskComplete(id: string): Promise<ActionResult<{ isCompleted: boolean }>> {
  try {
    const user = await getCurrentUser()
    const validated = toggleTaskCompleteSchema.parse({ id })

    // Verify ownership and get current state
    const existingTask = await prisma.task.findFirst({
      where: { id: validated.id, userId: user.id },
    })

    if (!existingTask) {
      return { success: false, error: "Task not found" }
    }

    const newIsCompleted = !existingTask.isCompleted
    const newStatus = newIsCompleted ? "DONE" : "TODO"

    await prisma.task.update({
      where: { id: validated.id },
      data: {
        isCompleted: newIsCompleted,
        status: newStatus,
      },
    })

    revalidatePath("/tasks")
    return { success: true, data: { isCompleted: newIsCompleted } }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to update tasks" }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle task",
    }
  }
}

export async function updateTaskStatus(
  input: UpdateTaskStatusInput
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const validated = updateTaskStatusSchema.parse(input)

    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: { id: validated.id, userId: user.id },
    })

    if (!existingTask) {
      return { success: false, error: "Task not found" }
    }

    await prisma.task.update({
      where: { id: validated.id },
      data: {
        status: validated.status,
        isCompleted: validated.status === "DONE",
      },
    })

    revalidatePath("/tasks")
    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to update tasks" }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task status",
    }
  }
}

export async function reorderTasks(
  input: ReorderTasksInput
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const validated = reorderTasksSchema.parse(input)

    // Verify ownership of all tasks
    const taskIds = validated.tasks.map((t) => t.id)
    const existingTasks = await prisma.task.findMany({
      where: { id: { in: taskIds }, userId: user.id },
      select: { id: true },
    })

    if (existingTasks.length !== taskIds.length) {
      return { success: false, error: "One or more tasks not found" }
    }

    // Update all tasks in a transaction
    await prisma.$transaction(
      validated.tasks.map((task) =>
        prisma.task.update({
          where: { id: task.id },
          data: {
            order: task.order,
            ...(task.status && {
              status: task.status,
              isCompleted: task.status === "DONE",
            }),
          },
        })
      )
    )

    revalidatePath("/tasks")
    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to reorder tasks" }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder tasks",
    }
  }
}
