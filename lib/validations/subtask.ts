import { z } from "zod"

export const createSubtaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  taskId: z.string().uuid("Invalid task ID"),
})

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>

export const updateSubtaskSchema = z.object({
  id: z.string().uuid("Invalid subtask ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .optional(),
  isCompleted: z.boolean().optional(),
})

export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>

export const toggleSubtaskCompleteSchema = z.object({
  id: z.string().uuid("Invalid subtask ID"),
})

export type ToggleSubtaskCompleteInput = z.infer<typeof toggleSubtaskCompleteSchema>

export const deleteSubtaskSchema = z.object({
  id: z.string().uuid("Invalid subtask ID"),
})

export type DeleteSubtaskInput = z.infer<typeof deleteSubtaskSchema>

export const reorderSubtasksSchema = z.object({
  subtasks: z.array(
    z.object({
      id: z.string().uuid("Invalid subtask ID"),
      order: z.number().int().min(0),
    })
  ),
})

export type ReorderSubtasksInput = z.infer<typeof reorderSubtasksSchema>
