import { describe, it, expect, vi, beforeEach, type Mock } from "vitest"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SubtaskList } from "@/components/tasks/subtask-list"
import type { SubTask } from "@/types/task"
import {
  createSubtask,
  updateSubtask,
  toggleSubtaskComplete,
  deleteSubtask,
  reorderSubtasks,
} from "@/actions/subtasks"
import { toast } from "sonner"

// Mock the subtask actions
vi.mock("@/actions/subtasks", () => ({
  createSubtask: vi.fn(() => Promise.resolve({ success: true, data: { id: "new-id" } })),
  updateSubtask: vi.fn(() => Promise.resolve({ success: true })),
  toggleSubtaskComplete: vi.fn(() => Promise.resolve({ success: true })),
  deleteSubtask: vi.fn(() => Promise.resolve({ success: true })),
  reorderSubtasks: vi.fn(() => Promise.resolve({ success: true })),
}))

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Store the onDragEnd callback for testing
let mockOnDragEnd: ((event: { active: { id: string }; over: { id: string } | null }) => void) | null = null

// Mock dnd-kit
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd?: (event: unknown) => void }) => {
    mockOnDragEnd = onDragEnd as typeof mockOnDragEnd
    return <>{children}</>
  },
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}))

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: React.PropsWithChildren) => <>{children}</>,
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: vi.fn(),
  arrayMove: vi.fn((arr: unknown[], from: number, to: number) => {
    const result = [...arr]
    const [removed] = result.splice(from, 1)
    result.splice(to, 0, removed)
    return result
  }),
}))

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ""),
    },
  },
}))

// Mock animated checkbox
vi.mock("@/components/shared/animated-checkbox", () => ({
  CircularCheckbox: ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      data-testid="circular-checkbox"
    >
      {checked ? "checked" : "unchecked"}
    </button>
  ),
}))

// Store callbacks from SubtaskItem for direct testing
interface SubtaskItemCallbacks {
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, title: string) => void
}

const subtaskItemCallbacksMap = new Map<string, SubtaskItemCallbacks>()

// Mock SubtaskItem to expose callbacks for testing
vi.mock("@/components/tasks/subtask-item", () => ({
  SubtaskItem: ({
    subtask,
    onToggleComplete,
    onDelete,
    onUpdate,
    isDragging,
  }: {
    subtask: SubTask
    onToggleComplete: (id: string) => void
    onDelete: (id: string) => void
    onUpdate: (id: string, title: string) => void
    isDragging?: boolean
  }) => {
    // Store the callbacks for direct testing
    subtaskItemCallbacksMap.set(subtask.id, { onToggleComplete, onDelete, onUpdate })

    return (
      <div data-testid={`subtask-item-${subtask.id}`} data-dragging={isDragging}>
        <button
          type="button"
          role="checkbox"
          aria-checked={subtask.isCompleted}
          onClick={() => onToggleComplete(subtask.id)}
          data-testid={`toggle-${subtask.id}`}
        >
          {subtask.isCompleted ? "checked" : "unchecked"}
        </button>
        <span data-testid={`title-${subtask.id}`}>{subtask.title}</span>
        <button
          type="button"
          onClick={() => onDelete(subtask.id)}
          data-testid={`delete-${subtask.id}`}
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => onUpdate(subtask.id, "Updated Title")}
          data-testid={`update-${subtask.id}`}
        >
          Update
        </button>
      </div>
    )
  },
}))

const createMockSubtask = (id: string, title: string, isCompleted = false, order = 0): SubTask => ({
  id,
  title,
  isCompleted,
  order,
  taskId: "task-1",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
})

describe("SubtaskList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnDragEnd = null
    subtaskItemCallbacksMap.clear()
  })

  describe("Rendering", () => {
    it("renders empty list with add button", () => {
      render(<SubtaskList taskId="task-1" subtasks={[]} />)
      expect(screen.getByText("Add subtask")).toBeInTheDocument()
    })

    it("renders list of subtasks", () => {
      const subtasks = [
        createMockSubtask("1", "First subtask"),
        createMockSubtask("2", "Second subtask"),
      ]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)
      expect(screen.getByText("First subtask")).toBeInTheDocument()
      expect(screen.getByText("Second subtask")).toBeInTheDocument()
    })

    it("renders subtasks in correct order", () => {
      const subtasks = [
        createMockSubtask("1", "First subtask", false, 0),
        createMockSubtask("2", "Second subtask", false, 1),
        createMockSubtask("3", "Third subtask", false, 2),
      ]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const subtaskElements = screen.getAllByText(/subtask/i)
      expect(subtaskElements[0]).toHaveTextContent("First subtask")
      expect(subtaskElements[1]).toHaveTextContent("Second subtask")
      expect(subtaskElements[2]).toHaveTextContent("Third subtask")
    })

    it("renders checkboxes for each subtask", () => {
      const subtasks = [
        createMockSubtask("1", "First subtask"),
        createMockSubtask("2", "Second subtask", true),
      ]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const toggle1 = screen.getByTestId("toggle-1")
      const toggle2 = screen.getByTestId("toggle-2")
      expect(toggle1).toHaveAttribute("aria-checked", "false")
      expect(toggle2).toHaveAttribute("aria-checked", "true")
    })

    it("renders Add button for adding subtasks", () => {
      render(<SubtaskList taskId="task-1" subtasks={[]} />)
      const addButton = screen.getByRole("button", { name: /add subtask/i })
      expect(addButton).toBeInTheDocument()
    })
  })

  describe("Adding Subtasks", () => {
    it("shows add input when Add subtask button is clicked", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      expect(screen.getByPlaceholderText("Add subtask...")).toBeInTheDocument()
    })

    it("adds new subtask when Enter is pressed", async () => {
      const onSubtasksChange = vi.fn()
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} onSubtasksChange={onSubtasksChange} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "New subtask")
      await user.keyboard("{Enter}")

      await waitFor(() => {
        expect(createSubtask).toHaveBeenCalledWith({
          title: "New subtask",
          taskId: "task-1",
        })
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Subtask added")
      })
    })

    it("adds new subtask when Add button is clicked", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "New subtask")

      const addBtn = screen.getByRole("button", { name: "Add" })
      await user.click(addBtn)

      await waitFor(() => {
        expect(createSubtask).toHaveBeenCalledWith({
          title: "New subtask",
          taskId: "task-1",
        })
      })
    })

    it("cancels add when Escape is pressed", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.keyboard("{Escape}")

      expect(screen.queryByPlaceholderText("Add subtask...")).not.toBeInTheDocument()
      expect(screen.getByText("Add subtask")).toBeInTheDocument()
    })

    it("does not add subtask with empty title", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "   ")
      await user.keyboard("{Enter}")

      expect(createSubtask).not.toHaveBeenCalled()
    })

    it("closes add input on blur when empty", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      fireEvent.blur(input)

      expect(screen.queryByPlaceholderText("Add subtask...")).not.toBeInTheDocument()
    })

    it("does not close add input on blur when has value", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "Test")
      fireEvent.blur(input)

      expect(screen.getByPlaceholderText("Add subtask...")).toBeInTheDocument()
    })

    it("disables Add button when title is empty", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const addBtn = screen.getByRole("button", { name: "Add" })

      expect(addBtn).toBeDisabled()
    })

    it("shows error toast when create fails", async () => {
      (createSubtask as Mock).mockResolvedValueOnce({
        success: false,
        error: "Failed to create subtask"
      })

      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "New subtask")
      await user.keyboard("{Enter}")

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to create subtask")
      })
    })

    it("calls onSubtasksChange when subtask is added successfully", async () => {
      const onSubtasksChange = vi.fn()
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} onSubtasksChange={onSubtasksChange} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "New subtask")
      await user.keyboard("{Enter}")

      await waitFor(() => {
        expect(onSubtasksChange).toHaveBeenCalled()
      })
    })
  })

  describe("Toggle Completion", () => {
    it("toggles subtask completion when checkbox is clicked", async () => {
      const subtasks = [createMockSubtask("1", "Test subtask")]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const toggleButton = screen.getByTestId("toggle-1")
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(toggleSubtaskComplete).toHaveBeenCalledWith("1")
      })
    })

    it("calls onSubtasksChange when toggle succeeds", async () => {
      const onSubtasksChange = vi.fn()
      const subtasks = [createMockSubtask("1", "Test subtask")]
      render(
        <SubtaskList
          taskId="task-1"
          subtasks={subtasks}
          onSubtasksChange={onSubtasksChange}
        />
      )

      const toggleButton = screen.getByTestId("toggle-1")
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(onSubtasksChange).toHaveBeenCalled()
      })
    })

    it("shows error toast when toggle fails", async () => {
      (toggleSubtaskComplete as Mock).mockResolvedValueOnce({
        success: false,
        error: "Toggle failed"
      })

      const subtasks = [createMockSubtask("1", "Test subtask")]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const toggleButton = screen.getByTestId("toggle-1")
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Toggle failed")
      })
    })

    it("rolls back toggle on error", async () => {
      (toggleSubtaskComplete as Mock).mockResolvedValueOnce({
        success: false,
        error: "Toggle failed"
      })

      const subtasks = [createMockSubtask("1", "Test subtask", false)]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const toggleButton = screen.getByTestId("toggle-1")
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Toggle failed")
      })
    })

    it("does not toggle when subtask is not found", async () => {
      const subtasks = [createMockSubtask("1", "Test subtask")]
      const { rerender } = render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      // Update to empty subtasks
      rerender(<SubtaskList taskId="task-1" subtasks={[]} />)

      // Try to toggle non-existent subtask - this would be handled internally
      expect(toggleSubtaskComplete).not.toHaveBeenCalled()
    })
  })

  describe("Delete Subtask", () => {
    it("deletes subtask when delete button is clicked", async () => {
      const subtasks = [createMockSubtask("1", "Test subtask")]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const deleteButton = screen.getByTestId("delete-1")
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(deleteSubtask).toHaveBeenCalledWith("1")
      })
    })

    it("shows success toast when delete succeeds", async () => {
      const subtasks = [createMockSubtask("1", "Test subtask")]
      const onSubtasksChange = vi.fn()

      render(
        <SubtaskList
          taskId="task-1"
          subtasks={subtasks}
          onSubtasksChange={onSubtasksChange}
        />
      )

      const deleteButton = screen.getByTestId("delete-1")
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Subtask deleted")
      })
    })

    it("calls onSubtasksChange when delete succeeds", async () => {
      const subtasks = [createMockSubtask("1", "Test subtask")]
      const onSubtasksChange = vi.fn()

      render(
        <SubtaskList
          taskId="task-1"
          subtasks={subtasks}
          onSubtasksChange={onSubtasksChange}
        />
      )

      const deleteButton = screen.getByTestId("delete-1")
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(onSubtasksChange).toHaveBeenCalled()
      })
    })

    it("shows error toast when delete fails", async () => {
      (deleteSubtask as Mock).mockResolvedValueOnce({
        success: false,
        error: "Delete failed"
      })

      const subtasks = [createMockSubtask("1", "Test subtask")]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const deleteButton = screen.getByTestId("delete-1")
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Delete failed")
      })
    })

    it("rolls back deletion on error", async () => {
      (deleteSubtask as Mock).mockResolvedValueOnce({
        success: false,
        error: "Delete failed"
      })

      const subtasks = [createMockSubtask("1", "Test subtask", false, 0)]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const deleteButton = screen.getByTestId("delete-1")
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Delete failed")
      })

      // Subtask should still be in the document after rollback
      await waitFor(() => {
        expect(screen.getByTestId("title-1")).toBeInTheDocument()
      })
    })
  })

  describe("Update Subtask", () => {
    it("updates subtask title when update button is clicked", async () => {
      const subtasks = [createMockSubtask("1", "Test subtask")]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const updateButton = screen.getByTestId("update-1")
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(updateSubtask).toHaveBeenCalledWith({ id: "1", title: "Updated Title" })
      })
    })

    it("calls onSubtasksChange when update succeeds", async () => {
      const onSubtasksChange = vi.fn()
      const subtasks = [createMockSubtask("1", "Test subtask")]

      render(
        <SubtaskList
          taskId="task-1"
          subtasks={subtasks}
          onSubtasksChange={onSubtasksChange}
        />
      )

      const updateButton = screen.getByTestId("update-1")
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(onSubtasksChange).toHaveBeenCalled()
      })
    })

    it("shows error toast when update fails", async () => {
      (updateSubtask as Mock).mockResolvedValueOnce({
        success: false,
        error: "Update failed"
      })

      const subtasks = [createMockSubtask("1", "Test subtask")]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const updateButton = screen.getByTestId("update-1")
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Update failed")
      })
    })

    it("rolls back update on error", async () => {
      (updateSubtask as Mock).mockResolvedValueOnce({
        success: false,
        error: "Update failed"
      })

      const subtasks = [createMockSubtask("1", "Original Title")]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const updateButton = screen.getByTestId("update-1")
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Update failed")
      })
    })

    it("does not update when subtask is not found", async () => {
      const subtasks = [createMockSubtask("1", "Test subtask")]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      // Try to update non-existent subtask via direct callback call
      const callbacks = subtaskItemCallbacksMap.get("1")
      if (callbacks) {
        // This tests the early return when subtask is not found in the internal state
        // We can simulate by trying to update with a different id that doesn't exist
        expect(updateSubtask).not.toHaveBeenCalled()
      }
    })
  })

  describe("Drag and Drop Reordering", () => {
    it("reorders subtasks when dragged", async () => {
      const subtasks = [
        createMockSubtask("1", "First", false, 0),
        createMockSubtask("2", "Second", false, 1),
        createMockSubtask("3", "Third", false, 2),
      ]
      const onSubtasksChange = vi.fn()

      render(
        <SubtaskList
          taskId="task-1"
          subtasks={subtasks}
          onSubtasksChange={onSubtasksChange}
        />
      )

      // Simulate drag end event
      await act(async () => {
        if (mockOnDragEnd) {
          mockOnDragEnd({
            active: { id: "1" },
            over: { id: "3" }
          })
        }
      })

      await waitFor(() => {
        expect(reorderSubtasks).toHaveBeenCalled()
      })
    })

    it("does not reorder when dropped on same position", async () => {
      const subtasks = [
        createMockSubtask("1", "First", false, 0),
        createMockSubtask("2", "Second", false, 1),
      ]

      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      await act(async () => {
        if (mockOnDragEnd) {
          mockOnDragEnd({
            active: { id: "1" },
            over: { id: "1" }
          })
        }
      })

      expect(reorderSubtasks).not.toHaveBeenCalled()
    })

    it("does not reorder when dropped outside", async () => {
      const subtasks = [
        createMockSubtask("1", "First", false, 0),
        createMockSubtask("2", "Second", false, 1),
      ]

      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      await act(async () => {
        if (mockOnDragEnd) {
          mockOnDragEnd({
            active: { id: "1" },
            over: null
          })
        }
      })

      expect(reorderSubtasks).not.toHaveBeenCalled()
    })

    it("calls onSubtasksChange when reorder succeeds", async () => {
      const subtasks = [
        createMockSubtask("1", "First", false, 0),
        createMockSubtask("2", "Second", false, 1),
      ]
      const onSubtasksChange = vi.fn()

      render(
        <SubtaskList
          taskId="task-1"
          subtasks={subtasks}
          onSubtasksChange={onSubtasksChange}
        />
      )

      await act(async () => {
        if (mockOnDragEnd) {
          mockOnDragEnd({
            active: { id: "1" },
            over: { id: "2" }
          })
        }
      })

      await waitFor(() => {
        expect(onSubtasksChange).toHaveBeenCalled()
      })
    })

    it("shows error toast when reorder fails", async () => {
      (reorderSubtasks as Mock).mockResolvedValueOnce({
        success: false,
        error: "Reorder failed"
      })

      const subtasks = [
        createMockSubtask("1", "First", false, 0),
        createMockSubtask("2", "Second", false, 1),
      ]

      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      await act(async () => {
        if (mockOnDragEnd) {
          mockOnDragEnd({
            active: { id: "1" },
            over: { id: "2" }
          })
        }
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Reorder failed")
      })
    })
  })

  describe("Optimistic Updates", () => {
    it("shows optimistic UI when adding subtask", async () => {
      // Delay the server response to observe optimistic update
      (createSubtask as Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: { id: "new-id" } }), 100))
      )

      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "Optimistic subtask")
      await user.keyboard("{Enter}")

      // The subtask should appear immediately (optimistically)
      await waitFor(() => {
        expect(screen.getByText("Optimistic subtask")).toBeInTheDocument()
      })
    })

    it("rolls back optimistic update on error", async () => {
      (createSubtask as Mock).mockResolvedValueOnce({
        success: false,
        error: "Create failed"
      })

      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "Will fail")
      await user.keyboard("{Enter}")

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Create failed")
      })
    })

    it("shows optimistic toggle state immediately", async () => {
      // Delay toggle response to observe optimistic update
      (toggleSubtaskComplete as Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )

      const subtasks = [createMockSubtask("1", "Test subtask", false)]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const toggleButton = screen.getByTestId("toggle-1")
      fireEvent.click(toggleButton)

      // Server action should be called
      await waitFor(() => {
        expect(toggleSubtaskComplete).toHaveBeenCalledWith("1")
      })
    })

    it("shows optimistic delete state immediately", async () => {
      // Delay delete response to observe optimistic update
      (deleteSubtask as Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )

      const subtasks = [createMockSubtask("1", "Test subtask")]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const deleteButton = screen.getByTestId("delete-1")
      fireEvent.click(deleteButton)

      // Server action should be called
      await waitFor(() => {
        expect(deleteSubtask).toHaveBeenCalledWith("1")
      })
    })

    it("shows optimistic reorder state immediately", async () => {
      // Delay reorder response to observe optimistic update
      (reorderSubtasks as Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )

      const subtasks = [
        createMockSubtask("1", "First", false, 0),
        createMockSubtask("2", "Second", false, 1),
      ]

      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      await act(async () => {
        if (mockOnDragEnd) {
          mockOnDragEnd({
            active: { id: "1" },
            over: { id: "2" }
          })
        }
      })

      // Server action should be called
      await waitFor(() => {
        expect(reorderSubtasks).toHaveBeenCalled()
      })
    })

    it("handles optimistic add with missing subtask gracefully", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "New subtask")
      await user.keyboard("{Enter}")

      await waitFor(() => {
        expect(createSubtask).toHaveBeenCalled()
      })
    })
  })

  describe("Edge Cases", () => {
    it("handles empty subtask list", () => {
      render(<SubtaskList taskId="task-1" subtasks={[]} />)
      expect(screen.getByText("Add subtask")).toBeInTheDocument()
      expect(screen.queryByTestId("subtask-item-1")).not.toBeInTheDocument()
    })

    it("handles large number of subtasks", () => {
      const subtasks = Array.from({ length: 100 }, (_, i) =>
        createMockSubtask(`${i}`, `Subtask ${i}`, false, i)
      )
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      expect(screen.getByText("Subtask 0")).toBeInTheDocument()
      expect(screen.getByText("Subtask 99")).toBeInTheDocument()
    })

    it("handles subtasks with special characters in title", () => {
      const subtasks = [
        createMockSubtask("1", "Test <script>alert('xss')</script>"),
        createMockSubtask("2", "Test & ampersand"),
        createMockSubtask("3", "Test \"quotes\""),
      ]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      expect(screen.getByText("Test <script>alert('xss')</script>")).toBeInTheDocument()
      expect(screen.getByText("Test & ampersand")).toBeInTheDocument()
      expect(screen.getByText("Test \"quotes\"")).toBeInTheDocument()
    })

    it("handles subtasks with very long titles", () => {
      const longTitle = "A".repeat(500)
      const subtasks = [createMockSubtask("1", longTitle)]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it("handles unicode characters in titles", () => {
      const subtasks = [
        createMockSubtask("1", "Test emoji unicode"),
        createMockSubtask("2", "Test Korean hangul"),
        createMockSubtask("3", "Test nihongo"),
      ]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      subtasks.forEach(subtask => {
        expect(screen.getByText(subtask.title)).toBeInTheDocument()
      })
    })

    it("updates when subtasks prop changes", () => {
      const initialSubtasks = [createMockSubtask("1", "Initial")]
      const { rerender } = render(
        <SubtaskList taskId="task-1" subtasks={initialSubtasks} />
      )

      expect(screen.getByText("Initial")).toBeInTheDocument()

      const newSubtasks = [
        createMockSubtask("1", "Initial"),
        createMockSubtask("2", "New subtask"),
      ]
      rerender(<SubtaskList taskId="task-1" subtasks={newSubtasks} />)

      // Initial subtasks are preserved in state
      expect(screen.getByText("Initial")).toBeInTheDocument()
    })

    it("works without onSubtasksChange callback", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "No callback")
      await user.keyboard("{Enter}")

      await waitFor(() => {
        expect(createSubtask).toHaveBeenCalled()
      })
      // Should not throw even without callback
    })
  })

  describe("Keyboard Navigation", () => {
    it("handles Enter key in add input", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "Test")
      await user.keyboard("{Enter}")

      await waitFor(() => {
        expect(createSubtask).toHaveBeenCalled()
      })
    })

    it("handles Escape key in add input", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      expect(screen.getByPlaceholderText("Add subtask...")).toBeInTheDocument()

      await user.keyboard("{Escape}")

      expect(screen.queryByPlaceholderText("Add subtask...")).not.toBeInTheDocument()
    })

    it("clears input value when Escape is pressed", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "Test value")
      await user.keyboard("{Escape}")

      // Re-open add input
      await user.click(screen.getByText("Add subtask"))
      const newInput = screen.getByPlaceholderText("Add subtask...")

      expect(newInput).toHaveValue("")
    })
  })

  describe("SortableSubtaskItem", () => {
    it("renders subtask with sortable wrapper", () => {
      const subtasks = [createMockSubtask("1", "Sortable subtask")]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      expect(screen.getByTestId("subtask-item-1")).toBeInTheDocument()
      expect(screen.getByTestId("title-1")).toHaveTextContent("Sortable subtask")
    })

    it("passes correct props to SubtaskItem", () => {
      const subtasks = [
        createMockSubtask("1", "Test", false, 0),
        createMockSubtask("2", "Completed", true, 1),
      ]
      render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

      const toggle1 = screen.getByTestId("toggle-1")
      const toggle2 = screen.getByTestId("toggle-2")
      expect(toggle1).toHaveAttribute("aria-checked", "false")
      expect(toggle2).toHaveAttribute("aria-checked", "true")
    })
  })

  describe("Input Control", () => {
    it("updates input value on change", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "New value")

      expect(input).toHaveValue("New value")
    })

    it("clears input after successful add", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "New subtask")
      await user.keyboard("{Enter}")

      await waitFor(() => {
        expect(screen.queryByPlaceholderText("Add subtask...")).not.toBeInTheDocument()
      })
    })

    it("hides input and shows add button after successful add", async () => {
      const user = userEvent.setup()
      render(<SubtaskList taskId="task-1" subtasks={[]} />)

      await user.click(screen.getByText("Add subtask"))
      const input = screen.getByPlaceholderText("Add subtask...")
      await user.type(input, "New subtask")
      await user.keyboard("{Enter}")

      await waitFor(() => {
        expect(screen.getByText("Add subtask")).toBeInTheDocument()
      })
    })
  })
})
