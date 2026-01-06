import { describe, it, expect, vi, beforeEach } from "vitest"

// Valid UUIDs for testing
const VALID_USER_ID = "123e4567-e89b-12d3-a456-426614174001"
const OTHER_USER_ID = "123e4567-e89b-12d3-a456-426614174099"
const VALID_TASK_ID = "123e4567-e89b-12d3-a456-426614174002"
const VALID_SUBTASK_ID_1 = "123e4567-e89b-12d3-a456-426614174003"
const VALID_SUBTASK_ID_2 = "123e4567-e89b-12d3-a456-426614174004"

// Mock dependencies first
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

const mockAuth = vi.fn()
vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}))

const mockTaskFindFirst = vi.fn()
const mockSubTaskFindFirst = vi.fn()
const mockSubTaskFindMany = vi.fn()
const mockSubTaskCreate = vi.fn()
const mockSubTaskUpdate = vi.fn()
const mockSubTaskDelete = vi.fn()
const mockTransaction = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findFirst: () => mockTaskFindFirst(),
    },
    subTask: {
      findFirst: () => mockSubTaskFindFirst(),
      findMany: () => mockSubTaskFindMany(),
      create: (args: unknown) => mockSubTaskCreate(args),
      update: (args: unknown) => mockSubTaskUpdate(args),
      delete: (args: unknown) => mockSubTaskDelete(args),
    },
    $transaction: (args: unknown) => mockTransaction(args),
  },
}))

// Import after mocks
import {
  createSubtask,
  updateSubtask,
  toggleSubtaskComplete,
  deleteSubtask,
  reorderSubtasks,
} from "@/actions/subtasks"

describe("Subtask Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createSubtask", () => {
    it("returns error when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await createSubtask({ title: "Test", taskId: VALID_TASK_ID })

      expect(result.success).toBe(false)
      expect((result as { error: string }).error).toBe("Please sign in to create subtasks")
    })

    it("returns error when task is not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockTaskFindFirst.mockResolvedValue(null)

      const result = await createSubtask({ title: "Test", taskId: VALID_TASK_ID })

      expect(result.success).toBe(false)
      expect((result as { error: string }).error).toBe("Task not found")
    })

    it("creates subtask successfully", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockSubTaskFindFirst.mockResolvedValue({ order: 1 })
      mockSubTaskCreate.mockResolvedValue({ id: VALID_SUBTASK_ID_1 })

      const result = await createSubtask({ title: "Test Subtask", taskId: VALID_TASK_ID })

      expect(result.success).toBe(true)
      expect((result as { data: { id: string } }).data.id).toBe(VALID_SUBTASK_ID_1)
    })

    it("sets order to 0 when no existing subtasks", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockTaskFindFirst.mockResolvedValue({ id: VALID_TASK_ID, userId: VALID_USER_ID })
      mockSubTaskFindFirst.mockResolvedValue(null)
      mockSubTaskCreate.mockResolvedValue({ id: VALID_SUBTASK_ID_1 })

      await createSubtask({ title: "Test Subtask", taskId: VALID_TASK_ID })

      expect(mockSubTaskCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ order: 0 }),
        })
      )
    })
  })

  describe("updateSubtask", () => {
    it("returns error when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await updateSubtask({ id: VALID_SUBTASK_ID_1, title: "Updated" })

      expect(result.success).toBe(false)
      expect((result as { error: string }).error).toBe("Please sign in to update subtasks")
    })

    it("returns error when subtask is not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockSubTaskFindFirst.mockResolvedValue(null)

      const result = await updateSubtask({ id: VALID_SUBTASK_ID_1, title: "Updated" })

      expect(result.success).toBe(false)
      expect((result as { error: string }).error).toBe("Subtask not found")
    })

    it("returns error when user does not own the subtask", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockSubTaskFindFirst.mockResolvedValue({
        id: VALID_SUBTASK_ID_1,
        task: { userId: OTHER_USER_ID },
      })

      const result = await updateSubtask({ id: VALID_SUBTASK_ID_1, title: "Updated" })

      expect(result.success).toBe(false)
      expect((result as { error: string }).error).toBe("Subtask not found")
    })

    it("updates subtask successfully", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockSubTaskFindFirst.mockResolvedValue({
        id: VALID_SUBTASK_ID_1,
        task: { userId: VALID_USER_ID },
      })
      mockSubTaskUpdate.mockResolvedValue({ id: VALID_SUBTASK_ID_1 })

      const result = await updateSubtask({ id: VALID_SUBTASK_ID_1, title: "Updated Title" })

      expect(result.success).toBe(true)
    })
  })

  describe("toggleSubtaskComplete", () => {
    it("returns error when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await toggleSubtaskComplete(VALID_SUBTASK_ID_1)

      expect(result.success).toBe(false)
      expect((result as { error: string }).error).toBe("Please sign in to update subtasks")
    })

    it("toggles from incomplete to complete", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockSubTaskFindFirst.mockResolvedValue({
        id: VALID_SUBTASK_ID_1,
        isCompleted: false,
        task: { userId: VALID_USER_ID },
      })
      mockSubTaskUpdate.mockResolvedValue({ id: VALID_SUBTASK_ID_1, isCompleted: true })

      const result = await toggleSubtaskComplete(VALID_SUBTASK_ID_1)

      expect(result.success).toBe(true)
      expect((result as { data: { isCompleted: boolean } }).data.isCompleted).toBe(true)
      expect(mockSubTaskUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isCompleted: true },
        })
      )
    })

    it("toggles from complete to incomplete", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockSubTaskFindFirst.mockResolvedValue({
        id: VALID_SUBTASK_ID_1,
        isCompleted: true,
        task: { userId: VALID_USER_ID },
      })
      mockSubTaskUpdate.mockResolvedValue({ id: VALID_SUBTASK_ID_1, isCompleted: false })

      const result = await toggleSubtaskComplete(VALID_SUBTASK_ID_1)

      expect(result.success).toBe(true)
      expect((result as { data: { isCompleted: boolean } }).data.isCompleted).toBe(false)
    })
  })

  describe("deleteSubtask", () => {
    it("returns error when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await deleteSubtask(VALID_SUBTASK_ID_1)

      expect(result.success).toBe(false)
      expect((result as { error: string }).error).toBe("Please sign in to delete subtasks")
    })

    it("returns error when subtask is not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockSubTaskFindFirst.mockResolvedValue(null)

      const result = await deleteSubtask(VALID_SUBTASK_ID_1)

      expect(result.success).toBe(false)
      expect((result as { error: string }).error).toBe("Subtask not found")
    })

    it("deletes subtask successfully", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockSubTaskFindFirst.mockResolvedValue({
        id: VALID_SUBTASK_ID_1,
        task: { userId: VALID_USER_ID },
      })
      mockSubTaskDelete.mockResolvedValue({ id: VALID_SUBTASK_ID_1 })

      const result = await deleteSubtask(VALID_SUBTASK_ID_1)

      expect(result.success).toBe(true)
    })
  })

  describe("reorderSubtasks", () => {
    it("returns error when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null)

      const result = await reorderSubtasks({
        subtasks: [{ id: VALID_SUBTASK_ID_1, order: 0 }],
      })

      expect(result.success).toBe(false)
      expect((result as { error: string }).error).toBe("Please sign in to reorder subtasks")
    })

    it("returns error when some subtasks are not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockSubTaskFindMany.mockResolvedValue([])

      const result = await reorderSubtasks({
        subtasks: [
          { id: VALID_SUBTASK_ID_1, order: 0 },
          { id: VALID_SUBTASK_ID_2, order: 1 },
        ],
      })

      expect(result.success).toBe(false)
      expect((result as { error: string }).error).toBe("One or more subtasks not found")
    })

    it("returns error when user does not own all subtasks", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockSubTaskFindMany.mockResolvedValue([
        { id: VALID_SUBTASK_ID_1, task: { userId: VALID_USER_ID } },
        { id: VALID_SUBTASK_ID_2, task: { userId: OTHER_USER_ID } },
      ])

      const result = await reorderSubtasks({
        subtasks: [
          { id: VALID_SUBTASK_ID_1, order: 0 },
          { id: VALID_SUBTASK_ID_2, order: 1 },
        ],
      })

      expect(result.success).toBe(false)
      expect((result as { error: string }).error).toBe("Unauthorized access to subtasks")
    })

    it("reorders subtasks successfully", async () => {
      mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } })
      mockSubTaskFindMany.mockResolvedValue([
        { id: VALID_SUBTASK_ID_1, task: { userId: VALID_USER_ID } },
        { id: VALID_SUBTASK_ID_2, task: { userId: VALID_USER_ID } },
      ])
      mockTransaction.mockResolvedValue([])

      const result = await reorderSubtasks({
        subtasks: [
          { id: VALID_SUBTASK_ID_1, order: 1 },
          { id: VALID_SUBTASK_ID_2, order: 0 },
        ],
      })

      expect(result.success).toBe(true)
      expect(mockTransaction).toHaveBeenCalled()
    })
  })
})
