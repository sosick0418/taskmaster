"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createSubtaskSchema,
  updateSubtaskSchema,
  toggleSubtaskCompleteSchema,
  deleteSubtaskSchema,
  reorderSubtasksSchema,
  type CreateSubtaskInput,
  type UpdateSubtaskInput,
  type ReorderSubtasksInput,
} from "@/lib/validations/subtask"

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

export async function createSubtask(
  input: CreateSubtaskInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser()
    const validated = createSubtaskSchema.parse(input)

    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: validated.taskId, userId: user.id },
    })

    if (!task) {
      return { success: false, error: "Task not found" }
    }

    // Get the highest order for this task's subtasks
    const highestOrder = await prisma.subTask.findFirst({
      where: { taskId: validated.taskId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const subtask = await prisma.subTask.create({
      data: {
        title: validated.title,
        taskId: validated.taskId,
        order: (highestOrder?.order ?? -1) + 1,
      },
    })

    revalidatePath("/tasks")
    return { success: true, data: { id: subtask.id } }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to create subtasks" }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create subtask",
    }
  }
}

export async function updateSubtask(
  input: UpdateSubtaskInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser()
    const validated = updateSubtaskSchema.parse(input)

    // Verify ownership through task
    const existingSubtask = await prisma.subTask.findFirst({
      where: { id: validated.id },
      include: { task: { select: { userId: true } } },
    })

    if (!existingSubtask || existingSubtask.task.userId !== user.id) {
      return { success: false, error: "Subtask not found" }
    }

    const { id, title, isCompleted } = validated

    const subtask = await prisma.subTask.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
    })

    revalidatePath("/tasks")
    return { success: true, data: { id: subtask.id } }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to update subtasks" }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update subtask",
    }
  }
}

export async function toggleSubtaskComplete(
  id: string
): Promise<ActionResult<{ isCompleted: boolean }>> {
  try {
    const user = await getCurrentUser()
    const validated = toggleSubtaskCompleteSchema.parse({ id })

    // Verify ownership through task
    const existingSubtask = await prisma.subTask.findFirst({
      where: { id: validated.id },
      include: { task: { select: { userId: true } } },
    })

    if (!existingSubtask || existingSubtask.task.userId !== user.id) {
      return { success: false, error: "Subtask not found" }
    }

    const newIsCompleted = !existingSubtask.isCompleted

    await prisma.subTask.update({
      where: { id: validated.id },
      data: { isCompleted: newIsCompleted },
    })

    revalidatePath("/tasks")
    return { success: true, data: { isCompleted: newIsCompleted } }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to update subtasks" }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle subtask",
    }
  }
}

export async function deleteSubtask(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const validated = deleteSubtaskSchema.parse({ id })

    // Verify ownership through task
    const existingSubtask = await prisma.subTask.findFirst({
      where: { id: validated.id },
      include: { task: { select: { userId: true } } },
    })

    if (!existingSubtask || existingSubtask.task.userId !== user.id) {
      return { success: false, error: "Subtask not found" }
    }

    await prisma.subTask.delete({
      where: { id: validated.id },
    })

    revalidatePath("/tasks")
    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to delete subtasks" }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete subtask",
    }
  }
}

export async function reorderSubtasks(
  input: ReorderSubtasksInput
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const validated = reorderSubtasksSchema.parse(input)

    // Verify ownership of all subtasks
    const subtaskIds = validated.subtasks.map((s) => s.id)
    const existingSubtasks = await prisma.subTask.findMany({
      where: { id: { in: subtaskIds } },
      include: { task: { select: { userId: true } } },
    })

    if (existingSubtasks.length !== subtaskIds.length) {
      return { success: false, error: "One or more subtasks not found" }
    }

    // Verify all subtasks belong to user
    const allOwned = existingSubtasks.every((s) => s.task.userId === user.id)
    if (!allOwned) {
      return { success: false, error: "Unauthorized access to subtasks" }
    }

    // Update all subtasks in a transaction
    await prisma.$transaction(
      validated.subtasks.map((subtask) =>
        prisma.subTask.update({
          where: { id: subtask.id },
          data: { order: subtask.order },
        })
      )
    )

    revalidatePath("/tasks")
    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to reorder subtasks" }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder subtasks",
    }
  }
}
