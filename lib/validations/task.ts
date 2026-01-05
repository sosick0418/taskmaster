import { z } from "zod"

export const TaskStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"])
export type TaskStatus = z.infer<typeof TaskStatus>

export const Priority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
export type Priority = z.infer<typeof Priority>

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  status: TaskStatus.default("TODO"),
  priority: Priority.default("MEDIUM"),
  dueDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  status: TaskStatus.optional(),
  priority: Priority.optional(),
  dueDate: z.coerce.date().nullable().optional(),
  isCompleted: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export const updateTaskStatusSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
  status: TaskStatus,
})

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>

export const reorderTasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string().uuid("Invalid task ID"),
      order: z.number().int().min(0),
      status: TaskStatus.optional(),
    })
  ),
})

export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>

export const deleteTaskSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
})

export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>

export const toggleTaskCompleteSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
})

export type ToggleTaskCompleteInput = z.infer<typeof toggleTaskCompleteSchema>
