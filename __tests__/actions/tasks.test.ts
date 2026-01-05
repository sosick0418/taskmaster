import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import {
  getTasks,
  getTaskStats,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
} from "@/actions/tasks"

// Valid UUIDs for testing
const VALID_TASK_ID = "123e4567-e89b-12d3-a456-426614174000"
const VALID_USER_ID = "123e4567-e89b-12d3-a456-426614174001"

describe("Task Server Actions", () => {
  const mockUser = { id: VALID_USER_ID, name: "Test User", email: "test@example.com" }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as any)
  })

  describe("getTasks", () => {
    it("returns tasks for authenticated user", async () => {
      const mockTasks = [
        { id: VALID_TASK_ID, title: "Task 1", userId: VALID_USER_ID, tags: [] },
        { id: "223e4567-e89b-12d3-a456-426614174002", title: "Task 2", userId: VALID_USER_ID, tags: [] },
      ]
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks as any)

      const result = await getTasks()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTasks)
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: VALID_USER_ID },
        include: { tags: true },
        orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
      })
    })

    it("returns error for unauthenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      const result = await getTasks()

      expect(result.success).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })
  })

  describe("getTaskStats", () => {
    it("returns task statistics", async () => {
      vi.mocked(prisma.task.count)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // inProgress
        .mockResolvedValueOnce(5) // completed

      const result = await getTaskStats()

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        total: 10,
        inProgress: 3,
        completed: 5,
        todo: 2,
      })
    })
  })

  describe("createTask", () => {
    it("creates a task with valid input", async () => {
      vi.mocked(prisma.task.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.task.create).mockResolvedValue({
        id: "new-task-id",
        title: "New Task",
      } as any)

      const result = await createTask({
        title: "New Task",
        priority: "HIGH",
        status: "TODO",
        tags: [],
      })

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe("new-task-id")
    })

    it("returns error for invalid input", async () => {
      const result = await createTask({
        title: "", // Empty title should fail validation
        priority: "HIGH",
        status: "TODO",
        tags: [],
      })

      expect(result.success).toBe(false)
    })

    it("returns error for unauthenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      const result = await createTask({
        title: "New Task",
        priority: "HIGH",
        status: "TODO",
        tags: [],
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe("Please sign in to create tasks")
    })
  })

  describe("updateTask", () => {
    it("updates a task successfully", async () => {
      vi.mocked(prisma.task.findFirst).mockResolvedValue({
        id: VALID_TASK_ID,
        userId: VALID_USER_ID,
      } as any)
      vi.mocked(prisma.task.update).mockResolvedValue({
        id: VALID_TASK_ID,
        title: "Updated Task",
      } as any)

      const result = await updateTask({
        id: VALID_TASK_ID,
        title: "Updated Task",
      })

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(VALID_TASK_ID)
    })

    it("returns error when task not found", async () => {
      vi.mocked(prisma.task.findFirst).mockResolvedValue(null)
      const nonExistentId = "323e4567-e89b-12d3-a456-426614174003"

      const result = await updateTask({
        id: nonExistentId,
        title: "Updated Task",
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe("Task not found")
    })
  })

  describe("deleteTask", () => {
    it("deletes a task successfully", async () => {
      vi.mocked(prisma.task.findFirst).mockResolvedValue({
        id: VALID_TASK_ID,
        userId: VALID_USER_ID,
      } as any)
      vi.mocked(prisma.task.delete).mockResolvedValue({} as any)

      const result = await deleteTask(VALID_TASK_ID)

      expect(result.success).toBe(true)
    })

    it("returns error when task not found", async () => {
      vi.mocked(prisma.task.findFirst).mockResolvedValue(null)
      const nonExistentId = "423e4567-e89b-12d3-a456-426614174004"

      const result = await deleteTask(nonExistentId)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Task not found")
    })
  })

  describe("toggleTaskComplete", () => {
    it("toggles task completion status", async () => {
      vi.mocked(prisma.task.findFirst).mockResolvedValue({
        id: VALID_TASK_ID,
        userId: VALID_USER_ID,
        isCompleted: false,
      } as any)
      vi.mocked(prisma.task.update).mockResolvedValue({
        id: VALID_TASK_ID,
        isCompleted: true,
      } as any)

      const result = await toggleTaskComplete(VALID_TASK_ID)

      expect(result.success).toBe(true)
      expect(result.data?.isCompleted).toBe(true)
    })

    it("returns error when task not found", async () => {
      vi.mocked(prisma.task.findFirst).mockResolvedValue(null)
      const nonExistentId = "523e4567-e89b-12d3-a456-426614174005"

      const result = await toggleTaskComplete(nonExistentId)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Task not found")
    })
  })
})
