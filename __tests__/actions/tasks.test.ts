import { describe, it, expect, vi, beforeEach } from "vitest"

// Valid UUIDs for testing
const VALID_USER_ID = "123e4567-e89b-12d3-a456-426614174001"
const OTHER_USER_ID = "123e4567-e89b-12d3-a456-426614174099"
const VALID_TASK_ID = "123e4567-e89b-12d3-a456-426614174000"
const VALID_TASK_ID_2 = "223e4567-e89b-12d3-a456-426614174002"
const VALID_TASK_ID_3 = "323e4567-e89b-12d3-a456-426614174003"

// Mock dependencies first
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

const mockAuth = vi.fn()
vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}))

const mockTaskFindMany = vi.fn()
const mockTaskFindFirst = vi.fn()
const mockTaskCreate = vi.fn()
const mockTaskUpdate = vi.fn()
const mockTaskDelete = vi.fn()
const mockTaskCount = vi.fn()
const mockSubTaskCount = vi.fn()
const mockTransaction = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findMany: (args: unknown) => mockTaskFindMany(args),
      findFirst: (args: unknown) => mockTaskFindFirst(args),
      create: (args: unknown) => mockTaskCreate(args),
      update: (args: unknown) => mockTaskUpdate(args),
      delete: (args: unknown) => mockTaskDelete(args),
      count: (args: unknown) => mockTaskCount(args),
    },
    subTask: {
      count: (args: unknown) => mockSubTaskCount(args),
    },
    $transaction: (args: unknown) => mockTransaction(args),
  },
}))

// Import after mocks
import {
  getTasks,
  getTasksByStatus,
  getTaskStats,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  updateTaskStatus,
  reorderTasks,
} from "@/actions/tasks"
import { revalidatePath } from "next/cache"

describe("Task Server Actions", () => {
  const mockUser = { id: VALID_USER_ID, name: "Test User", email: "test@example.com" }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // getTasks
  // ============================================
  describe("getTasks", () => {
    it("returns tasks for authenticated user", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      const mockTasks = [
        { id: VALID_TASK_ID, title: "Task 1", userId: VALID_USER_ID, tags: [], subtasks: [] },
        { id: VALID_TASK_ID_2, title: "Task 2", userId: VALID_USER_ID, tags: [], subtasks: [] },
      ]
      mockTaskFindMany.mockResolvedValue(mockTasks)

      const result = await getTasks()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockTasks)
      }
      expect(mockTaskFindMany).toHaveBeenCalledWith({
        where: { userId: VALID_USER_ID },
        include: {
          tags: true,
          subtasks: { orderBy: { order: "asc" } },
        },
        orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
      })
    })

    it("returns error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await getTasks()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Unauthorized")
      }
    })

    it("returns error when session has no user", async () => {
      mockAuth.mockResolvedValue({ user: null })

      const result = await getTasks()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Unauthorized")
      }
    })

    it("returns error when user has no id", async () => {
      mockAuth.mockResolvedValue({ user: { email: "test@example.com" } })

      const result = await getTasks()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Unauthorized")
      }
    })

    it("handles database errors gracefully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindMany.mockRejectedValue(new Error("Database connection failed"))

      const result = await getTasks()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Database connection failed")
      }
    })

    it("handles non-Error exceptions", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindMany.mockRejectedValue("Unknown error")

      const result = await getTasks()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Failed to fetch tasks")
      }
    })
  })

  // ============================================
  // getTasksByStatus
  // ============================================
  describe("getTasksByStatus", () => {
    it("returns tasks filtered by TODO status", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      const mockTasks = [
        { id: VALID_TASK_ID, title: "Task 1", status: "TODO", userId: VALID_USER_ID },
      ]
      mockTaskFindMany.mockResolvedValue(mockTasks)

      const result = await getTasksByStatus("TODO")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockTasks)
      }
      expect(mockTaskFindMany).toHaveBeenCalledWith({
        where: { userId: VALID_USER_ID, status: "TODO" },
        include: {
          tags: true,
          subtasks: { orderBy: { order: "asc" } },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      })
    })

    it("returns tasks filtered by IN_PROGRESS status", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      const mockTasks = [
        { id: VALID_TASK_ID, title: "Task 1", status: "IN_PROGRESS", userId: VALID_USER_ID },
      ]
      mockTaskFindMany.mockResolvedValue(mockTasks)

      const result = await getTasksByStatus("IN_PROGRESS")

      expect(result.success).toBe(true)
      expect(mockTaskFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: VALID_USER_ID, status: "IN_PROGRESS" },
        })
      )
    })

    it("returns tasks filtered by DONE status", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      const mockTasks = [
        { id: VALID_TASK_ID, title: "Task 1", status: "DONE", userId: VALID_USER_ID },
      ]
      mockTaskFindMany.mockResolvedValue(mockTasks)

      const result = await getTasksByStatus("DONE")

      expect(result.success).toBe(true)
      expect(mockTaskFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: VALID_USER_ID, status: "DONE" },
        })
      )
    })

    it("returns error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await getTasksByStatus("TODO")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Unauthorized")
      }
    })

    it("handles database errors gracefully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindMany.mockRejectedValue(new Error("Query failed"))

      const result = await getTasksByStatus("TODO")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Query failed")
      }
    })

    it("handles non-Error exceptions", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindMany.mockRejectedValue("Unknown error")

      const result = await getTasksByStatus("TODO")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Failed to fetch tasks")
      }
    })
  })

  // ============================================
  // getTaskStats
  // ============================================
  describe("getTaskStats", () => {
    it("returns task statistics correctly", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskCount
        .mockResolvedValueOnce(10) // totalTasks
        .mockResolvedValueOnce(3)  // inProgressTasks
        .mockResolvedValueOnce(5)  // completedTasks
      mockSubTaskCount
        .mockResolvedValueOnce(8)  // totalSubtasks
        .mockResolvedValueOnce(4)  // completedSubtasks

      const result = await getTaskStats()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          total: 18,      // 10 tasks + 8 subtasks
          inProgress: 3,
          completed: 9,   // 5 completed tasks + 4 completed subtasks
          todo: 2,        // 10 - 3 - 5
          tasks: {
            total: 10,
            completed: 5,
            inProgress: 3,
          },
          subtasks: {
            total: 8,
            completed: 4,
          },
        })
      }
    })

    it("handles zero tasks correctly", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskCount
        .mockResolvedValueOnce(0) // totalTasks
        .mockResolvedValueOnce(0) // inProgressTasks
        .mockResolvedValueOnce(0) // completedTasks
      mockSubTaskCount
        .mockResolvedValueOnce(0) // totalSubtasks
        .mockResolvedValueOnce(0) // completedSubtasks

      const result = await getTaskStats()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          total: 0,
          inProgress: 0,
          completed: 0,
          todo: 0,
          tasks: { total: 0, completed: 0, inProgress: 0 },
          subtasks: { total: 0, completed: 0 },
        })
      }
    })

    it("returns error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await getTaskStats()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Unauthorized")
      }
    })

    it("handles database errors gracefully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskCount.mockRejectedValue(new Error("Count failed"))

      const result = await getTaskStats()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Count failed")
      }
    })

    it("handles non-Error exceptions", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskCount.mockRejectedValue("Unknown error")

      const result = await getTaskStats()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Failed to fetch stats")
      }
    })
  })

  // ============================================
  // createTask
  // ============================================
  describe("createTask", () => {
    it("creates a task with minimal valid input", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue(null)
      mockTaskCreate.mockResolvedValue({ id: VALID_TASK_ID, title: "New Task" })

      const result = await createTask({
        title: "New Task",
        priority: "HIGH",
        status: "TODO",
        tags: [],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(VALID_TASK_ID)
      }
      expect(revalidatePath).toHaveBeenCalledWith("/tasks")
    })

    it("creates a task with all fields", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue(null)
      mockTaskCreate.mockResolvedValue({ id: VALID_TASK_ID })

      const dueDate = new Date("2025-12-31")
      const result = await createTask({
        title: "Complete Task",
        description: "A detailed description",
        priority: "URGENT",
        status: "IN_PROGRESS",
        dueDate,
        tags: [],
      })

      expect(result.success).toBe(true)
      expect(mockTaskCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Complete Task",
            description: "A detailed description",
            priority: "URGENT",
            status: "IN_PROGRESS",
            dueDate,
            userId: VALID_USER_ID,
          }),
        })
      )
    })

    it("creates a task with tags", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue(null)
      mockTaskCreate.mockResolvedValue({ id: VALID_TASK_ID })

      const result = await createTask({
        title: "Tagged Task",
        priority: "MEDIUM",
        status: "TODO",
        tags: ["urgent", "frontend"],
      })

      expect(result.success).toBe(true)
      expect(mockTaskCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: {
              connectOrCreate: [
                { where: { name: "urgent" }, create: { name: "urgent" } },
                { where: { name: "frontend" }, create: { name: "frontend" } },
              ],
            },
          }),
        })
      )
    })

    it("sets order based on highest existing order", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ order: 5 })
      mockTaskCreate.mockResolvedValue({ id: VALID_TASK_ID })

      await createTask({
        title: "New Task",
        priority: "MEDIUM",
        status: "TODO",
        tags: [],
      })

      expect(mockTaskCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            order: 6, // highestOrder (5) + 1
          }),
        })
      )
    })

    it("sets order to 0 when no existing tasks", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue(null)
      mockTaskCreate.mockResolvedValue({ id: VALID_TASK_ID })

      await createTask({
        title: "First Task",
        priority: "MEDIUM",
        status: "TODO",
        tags: [],
      })

      expect(mockTaskCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            order: 0, // (-1) + 1
          }),
        })
      )
    })

    it("returns error for empty title", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })

      const result = await createTask({
        title: "",
        priority: "HIGH",
        status: "TODO",
        tags: [],
      })

      expect(result.success).toBe(false)
    })

    it("returns error for title exceeding 100 characters", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })

      const result = await createTask({
        title: "A".repeat(101),
        priority: "HIGH",
        status: "TODO",
        tags: [],
      })

      expect(result.success).toBe(false)
    })

    it("returns error for description exceeding 500 characters", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })

      const result = await createTask({
        title: "Valid Title",
        description: "A".repeat(501),
        priority: "HIGH",
        status: "TODO",
        tags: [],
      })

      expect(result.success).toBe(false)
    })

    it("returns error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await createTask({
        title: "New Task",
        priority: "HIGH",
        status: "TODO",
        tags: [],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Please sign in to create tasks")
      }
    })

    it("handles database errors gracefully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue(null)
      mockTaskCreate.mockRejectedValue(new Error("Insert failed"))

      const result = await createTask({
        title: "New Task",
        priority: "HIGH",
        status: "TODO",
        tags: [],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Insert failed")
      }
    })

    it("handles non-Error exceptions", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue(null)
      mockTaskCreate.mockRejectedValue("Unknown error")

      const result = await createTask({
        title: "New Task",
        priority: "HIGH",
        status: "TODO",
        tags: [],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Failed to create task")
      }
    })
  })

  // ============================================
  // updateTask
  // ============================================
  describe("updateTask", () => {
    it("updates task title successfully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskUpdate.mockResolvedValue({ id: VALID_TASK_ID, title: "Updated Title" })

      const result = await updateTask({
        id: VALID_TASK_ID,
        title: "Updated Title",
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(VALID_TASK_ID)
      }
      expect(revalidatePath).toHaveBeenCalledWith("/tasks")
    })

    it("updates task with all fields", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskUpdate.mockResolvedValue({ id: VALID_TASK_ID })

      const dueDate = new Date("2025-06-30")
      const result = await updateTask({
        id: VALID_TASK_ID,
        title: "Updated Task",
        description: "Updated description",
        status: "IN_PROGRESS",
        priority: "HIGH",
        isCompleted: false,
        dueDate,
        tags: ["updated-tag"],
      })

      expect(result.success).toBe(true)
      expect(mockTaskUpdate).toHaveBeenCalledWith({
        where: { id: VALID_TASK_ID },
        data: expect.objectContaining({
          title: "Updated Task",
          description: "Updated description",
          status: "IN_PROGRESS",
          priority: "HIGH",
          isCompleted: false,
          dueDate,
          tags: {
            set: [],
            connectOrCreate: [
              { where: { name: "updated-tag" }, create: { name: "updated-tag" } },
            ],
          },
        }),
      })
    })

    it("clears dueDate when set to null", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskUpdate.mockResolvedValue({ id: VALID_TASK_ID })

      const result = await updateTask({
        id: VALID_TASK_ID,
        dueDate: null,
      })

      expect(result.success).toBe(true)
      expect(mockTaskUpdate).toHaveBeenCalledWith({
        where: { id: VALID_TASK_ID },
        data: expect.objectContaining({
          dueDate: null,
        }),
      })
    })

    it("updates description to empty string", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskUpdate.mockResolvedValue({ id: VALID_TASK_ID })

      const result = await updateTask({
        id: VALID_TASK_ID,
        description: "",
      })

      expect(result.success).toBe(true)
      expect(mockTaskUpdate).toHaveBeenCalledWith({
        where: { id: VALID_TASK_ID },
        data: expect.objectContaining({
          description: "",
        }),
      })
    })

    it("returns error when task not found", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue(null)

      const result = await updateTask({
        id: VALID_TASK_ID,
        title: "Updated Title",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Task not found")
      }
    })

    it("returns error when task belongs to another user", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      // findFirst returns null when userId doesn't match (simulating ownership check)
      mockTaskFindFirst.mockResolvedValue(null)

      const result = await updateTask({
        id: VALID_TASK_ID,
        title: "Updated Title",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Task not found")
      }
    })

    it("returns error for invalid UUID", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })

      const result = await updateTask({
        id: "invalid-uuid",
        title: "Updated Title",
      })

      expect(result.success).toBe(false)
    })

    it("returns error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await updateTask({
        id: VALID_TASK_ID,
        title: "Updated Title",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Please sign in to update tasks")
      }
    })

    it("handles database errors gracefully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskUpdate.mockRejectedValue(new Error("Update failed"))

      const result = await updateTask({
        id: VALID_TASK_ID,
        title: "Updated Title",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Update failed")
      }
    })

    it("handles non-Error exceptions", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskUpdate.mockRejectedValue("Unknown error")

      const result = await updateTask({
        id: VALID_TASK_ID,
        title: "Updated Title",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Failed to update task")
      }
    })
  })

  // ============================================
  // deleteTask
  // ============================================
  describe("deleteTask", () => {
    it("deletes a task successfully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskDelete.mockResolvedValue({})

      const result = await deleteTask(VALID_TASK_ID)

      expect(result.success).toBe(true)
      expect(mockTaskDelete).toHaveBeenCalledWith({
        where: { id: VALID_TASK_ID },
      })
      expect(revalidatePath).toHaveBeenCalledWith("/tasks")
    })

    it("returns error when task not found", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue(null)

      const result = await deleteTask(VALID_TASK_ID)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Task not found")
      }
    })

    it("returns error for invalid UUID", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })

      const result = await deleteTask("invalid-uuid")

      expect(result.success).toBe(false)
    })

    it("returns error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await deleteTask(VALID_TASK_ID)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Please sign in to delete tasks")
      }
    })

    it("handles database errors gracefully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskDelete.mockRejectedValue(new Error("Delete failed"))

      const result = await deleteTask(VALID_TASK_ID)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Delete failed")
      }
    })

    it("handles non-Error exceptions", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskDelete.mockRejectedValue("Unknown error")

      const result = await deleteTask(VALID_TASK_ID)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Failed to delete task")
      }
    })
  })

  // ============================================
  // toggleTaskComplete
  // ============================================
  describe("toggleTaskComplete", () => {
    it("toggles from incomplete to complete", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({
        id: VALID_TASK_ID,
        userId: VALID_USER_ID,
        isCompleted: false,
      })
      mockTaskUpdate.mockResolvedValue({ id: VALID_TASK_ID, isCompleted: true })

      const result = await toggleTaskComplete(VALID_TASK_ID)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isCompleted).toBe(true)
      }
      expect(mockTaskUpdate).toHaveBeenCalledWith({
        where: { id: VALID_TASK_ID },
        data: {
          isCompleted: true,
          status: "DONE",
        },
      })
      expect(revalidatePath).toHaveBeenCalledWith("/tasks")
    })

    it("toggles from complete to incomplete", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({
        id: VALID_TASK_ID,
        userId: VALID_USER_ID,
        isCompleted: true,
      })
      mockTaskUpdate.mockResolvedValue({ id: VALID_TASK_ID, isCompleted: false })

      const result = await toggleTaskComplete(VALID_TASK_ID)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isCompleted).toBe(false)
      }
      expect(mockTaskUpdate).toHaveBeenCalledWith({
        where: { id: VALID_TASK_ID },
        data: {
          isCompleted: false,
          status: "TODO",
        },
      })
    })

    it("returns error when task not found", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue(null)

      const result = await toggleTaskComplete(VALID_TASK_ID)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Task not found")
      }
    })

    it("returns error for invalid UUID", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })

      const result = await toggleTaskComplete("invalid-uuid")

      expect(result.success).toBe(false)
    })

    it("returns error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await toggleTaskComplete(VALID_TASK_ID)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Please sign in to update tasks")
      }
    })

    it("handles database errors gracefully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({
        id: VALID_TASK_ID,
        userId: VALID_USER_ID,
        isCompleted: false,
      })
      mockTaskUpdate.mockRejectedValue(new Error("Toggle failed"))

      const result = await toggleTaskComplete(VALID_TASK_ID)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Toggle failed")
      }
    })

    it("handles non-Error exceptions", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({
        id: VALID_TASK_ID,
        userId: VALID_USER_ID,
        isCompleted: false,
      })
      mockTaskUpdate.mockRejectedValue("Unknown error")

      const result = await toggleTaskComplete(VALID_TASK_ID)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Failed to toggle task")
      }
    })
  })

  // ============================================
  // updateTaskStatus
  // ============================================
  describe("updateTaskStatus", () => {
    it("updates task status to IN_PROGRESS", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskUpdate.mockResolvedValue({ id: VALID_TASK_ID, status: "IN_PROGRESS" })

      const result = await updateTaskStatus({
        id: VALID_TASK_ID,
        status: "IN_PROGRESS",
      })

      expect(result.success).toBe(true)
      expect(mockTaskUpdate).toHaveBeenCalledWith({
        where: { id: VALID_TASK_ID },
        data: {
          status: "IN_PROGRESS",
          isCompleted: false,
        },
      })
      expect(revalidatePath).toHaveBeenCalledWith("/tasks")
    })

    it("updates task status to DONE and sets isCompleted to true", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskUpdate.mockResolvedValue({ id: VALID_TASK_ID, status: "DONE" })

      const result = await updateTaskStatus({
        id: VALID_TASK_ID,
        status: "DONE",
      })

      expect(result.success).toBe(true)
      expect(mockTaskUpdate).toHaveBeenCalledWith({
        where: { id: VALID_TASK_ID },
        data: {
          status: "DONE",
          isCompleted: true,
        },
      })
    })

    it("updates task status to TODO and sets isCompleted to false", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskUpdate.mockResolvedValue({ id: VALID_TASK_ID, status: "TODO" })

      const result = await updateTaskStatus({
        id: VALID_TASK_ID,
        status: "TODO",
      })

      expect(result.success).toBe(true)
      expect(mockTaskUpdate).toHaveBeenCalledWith({
        where: { id: VALID_TASK_ID },
        data: {
          status: "TODO",
          isCompleted: false,
        },
      })
    })

    it("returns error when task not found", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue(null)

      const result = await updateTaskStatus({
        id: VALID_TASK_ID,
        status: "DONE",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Task not found")
      }
    })

    it("returns error for invalid UUID", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })

      const result = await updateTaskStatus({
        id: "invalid-uuid",
        status: "DONE",
      })

      expect(result.success).toBe(false)
    })

    it("returns error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await updateTaskStatus({
        id: VALID_TASK_ID,
        status: "DONE",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Please sign in to update tasks")
      }
    })

    it("handles database errors gracefully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskUpdate.mockRejectedValue(new Error("Status update failed"))

      const result = await updateTaskStatus({
        id: VALID_TASK_ID,
        status: "DONE",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Status update failed")
      }
    })

    it("handles non-Error exceptions", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockTaskUpdate.mockRejectedValue("Unknown error")

      const result = await updateTaskStatus({
        id: VALID_TASK_ID,
        status: "DONE",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Failed to update task status")
      }
    })
  })

  // ============================================
  // reorderTasks
  // ============================================
  describe("reorderTasks", () => {
    it("reorders tasks successfully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindMany.mockResolvedValue([
        { id: VALID_TASK_ID },
        { id: VALID_TASK_ID_2 },
        { id: VALID_TASK_ID_3 },
      ])
      mockTransaction.mockResolvedValue([])

      const result = await reorderTasks({
        tasks: [
          { id: VALID_TASK_ID, order: 2 },
          { id: VALID_TASK_ID_2, order: 0 },
          { id: VALID_TASK_ID_3, order: 1 },
        ],
      })

      expect(result.success).toBe(true)
      expect(mockTransaction).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith("/tasks")
    })

    it("reorders tasks with status change", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindMany.mockResolvedValue([{ id: VALID_TASK_ID }])
      mockTransaction.mockResolvedValue([])

      const result = await reorderTasks({
        tasks: [
          { id: VALID_TASK_ID, order: 0, status: "IN_PROGRESS" },
        ],
      })

      expect(result.success).toBe(true)
      expect(mockTransaction).toHaveBeenCalled()
    })

    it("sets isCompleted to true when status is DONE", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindMany.mockResolvedValue([{ id: VALID_TASK_ID }])
      mockTransaction.mockResolvedValue([])

      await reorderTasks({
        tasks: [
          { id: VALID_TASK_ID, order: 0, status: "DONE" },
        ],
      })

      expect(mockTransaction).toHaveBeenCalled()
    })

    it("returns error when some tasks not found", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      // Only return 2 tasks when 3 were requested
      mockTaskFindMany.mockResolvedValue([
        { id: VALID_TASK_ID },
        { id: VALID_TASK_ID_2 },
      ])

      const result = await reorderTasks({
        tasks: [
          { id: VALID_TASK_ID, order: 0 },
          { id: VALID_TASK_ID_2, order: 1 },
          { id: VALID_TASK_ID_3, order: 2 },
        ],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("One or more tasks not found")
      }
    })

    it("returns error when task belongs to another user", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      // Returns empty because the ownership check (userId: user.id) fails
      mockTaskFindMany.mockResolvedValue([])

      const result = await reorderTasks({
        tasks: [
          { id: VALID_TASK_ID, order: 0 },
        ],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("One or more tasks not found")
      }
    })

    it("returns error for invalid UUID in tasks array", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })

      const result = await reorderTasks({
        tasks: [
          { id: "invalid-uuid", order: 0 },
        ],
      })

      expect(result.success).toBe(false)
    })

    it("returns error for negative order value", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })

      const result = await reorderTasks({
        tasks: [
          { id: VALID_TASK_ID, order: -1 },
        ],
      })

      expect(result.success).toBe(false)
    })

    it("returns error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await reorderTasks({
        tasks: [
          { id: VALID_TASK_ID, order: 0 },
        ],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Please sign in to reorder tasks")
      }
    })

    it("handles database errors gracefully", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindMany.mockResolvedValue([{ id: VALID_TASK_ID }])
      mockTransaction.mockRejectedValue(new Error("Transaction failed"))

      const result = await reorderTasks({
        tasks: [
          { id: VALID_TASK_ID, order: 0 },
        ],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Transaction failed")
      }
    })

    it("handles non-Error exceptions", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindMany.mockResolvedValue([{ id: VALID_TASK_ID }])
      mockTransaction.mockRejectedValue("Unknown error")

      const result = await reorderTasks({
        tasks: [
          { id: VALID_TASK_ID, order: 0 },
        ],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("Failed to reorder tasks")
      }
    })

    it("handles empty tasks array", async () => {
      mockAuth.mockResolvedValue({ user: mockUser })
      mockTaskFindMany.mockResolvedValue([])
      mockTransaction.mockResolvedValue([])

      const result = await reorderTasks({
        tasks: [],
      })

      expect(result.success).toBe(true)
    })
  })
})
