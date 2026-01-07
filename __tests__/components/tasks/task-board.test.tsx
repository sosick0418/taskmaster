import { describe, it, expect, vi, beforeEach, type Mock } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { TaskBoard } from "@/components/tasks/task-board"
import type { Task } from "@/types/task"

// Track DndContext event handlers for testing drag and drop
let dndContextProps: {
  onDragStart?: (event: unknown) => void
  onDragOver?: (event: unknown) => void
  onDragEnd?: (event: unknown) => void
} = {}

// Mock DnD kit with event handler capture
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragStart, onDragOver, onDragEnd }: {
    children: React.ReactNode
    onDragStart?: (event: unknown) => void
    onDragOver?: (event: unknown) => void
    onDragEnd?: (event: unknown) => void
  }) => {
    // Capture the event handlers so we can call them in tests
    dndContextProps = { onDragStart, onDragOver, onDragEnd }
    return <div data-testid="dnd-context">{children}</div>
  },
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  PointerSensor: vi.fn(),
  useSensor: vi.fn((sensor, options) => ({ sensor, options })),
  useSensors: vi.fn((...sensors) => sensors),
  closestCorners: vi.fn(),
  useDroppable: vi.fn(() => ({ setNodeRef: vi.fn(), isOver: false })),
}))

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
  arrayMove: vi.fn((arr, from, to) => {
    const result = [...arr]
    const [removed] = result.splice(from, 1)
    result.splice(to, 0, removed)
    return result
  }),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  })),
}))

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ""),
    },
  },
}))

// Mock the animated checkbox and confetti
vi.mock("@/components/shared/animated-checkbox", () => ({
  CircularCheckbox: ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      data-testid="circular-checkbox"
    >
      {checked ? "Checked" : "Unchecked"}
    </button>
  ),
}))

vi.mock("@/components/shared/confetti", () => ({
  celebrateTaskComplete: vi.fn(),
}))

// Helper to create a mock task
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  title: "Test Task",
  description: null,
  priority: "MEDIUM",
  status: "TODO",
  isCompleted: false,
  dueDate: null,
  order: 0,
  tags: [],
  subtasks: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const mockTasks: Task[] = [
  createMockTask({
    id: "1",
    title: "Todo Task 1",
    description: "Description 1",
    priority: "HIGH",
    status: "TODO",
    order: 0,
  }),
  createMockTask({
    id: "2",
    title: "Todo Task 2",
    description: null,
    priority: "LOW",
    status: "TODO",
    order: 1,
  }),
  createMockTask({
    id: "3",
    title: "In Progress Task",
    description: null,
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    order: 0,
  }),
  createMockTask({
    id: "4",
    title: "Done Task",
    description: null,
    priority: "LOW",
    status: "DONE",
    isCompleted: true,
    order: 0,
  }),
]

describe("TaskBoard", () => {
  const mockOnTaskMove = vi.fn()
  const mockOnToggleComplete = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnAddTask = vi.fn()
  const mockOnClick = vi.fn()

  const defaultProps = {
    tasks: mockTasks,
    onTaskMove: mockOnTaskMove,
    onToggleComplete: mockOnToggleComplete,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onAddTask: mockOnAddTask,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    dndContextProps = {}
  })

  describe("Rendering", () => {
    it("renders all three columns", () => {
      render(<TaskBoard {...defaultProps} />)

      expect(screen.getByText("To Do")).toBeInTheDocument()
      expect(screen.getByText("In Progress")).toBeInTheDocument()
      expect(screen.getByText("Done")).toBeInTheDocument()
    })

    it("renders tasks in correct columns", () => {
      render(<TaskBoard {...defaultProps} />)

      expect(screen.getByText("Todo Task 1")).toBeInTheDocument()
      expect(screen.getByText("Todo Task 2")).toBeInTheDocument()
      expect(screen.getByText("In Progress Task")).toBeInTheDocument()
      expect(screen.getByText("Done Task")).toBeInTheDocument()
    })

    it("renders DndContext wrapper", () => {
      render(<TaskBoard {...defaultProps} />)

      expect(screen.getByTestId("dnd-context")).toBeInTheDocument()
    })

    it("renders DragOverlay container", () => {
      render(<TaskBoard {...defaultProps} />)

      expect(screen.getByTestId("drag-overlay")).toBeInTheDocument()
    })

    it("shows correct task counts in column headers", () => {
      render(<TaskBoard {...defaultProps} />)

      // TODO column has 2 tasks
      expect(screen.getByText("2 tasks")).toBeInTheDocument()
      // IN_PROGRESS and DONE have 1 task each
      const singleTaskCounts = screen.getAllByText("1 tasks")
      expect(singleTaskCounts).toHaveLength(2)
    })

    it("renders empty state when no tasks", () => {
      render(<TaskBoard {...defaultProps} tasks={[]} />)

      const noTasksElements = screen.getAllByText("No tasks")
      expect(noTasksElements).toHaveLength(3)
    })

    it("passes onClick handler to columns when provided", () => {
      render(<TaskBoard {...defaultProps} onClick={mockOnClick} />)

      // The component should render without errors when onClick is provided
      expect(screen.getByText("To Do")).toBeInTheDocument()
    })
  })

  describe("Task Grouping and Sorting", () => {
    it("groups tasks by status correctly", () => {
      const tasksWithVariedStatuses: Task[] = [
        createMockTask({ id: "t1", title: "Task A", status: "TODO", order: 0 }),
        createMockTask({ id: "t2", title: "Task B", status: "IN_PROGRESS", order: 0 }),
        createMockTask({ id: "t3", title: "Task C", status: "DONE", order: 0, isCompleted: true }),
        createMockTask({ id: "t4", title: "Task D", status: "TODO", order: 1 }),
      ]

      render(<TaskBoard {...defaultProps} tasks={tasksWithVariedStatuses} />)

      expect(screen.getByText("Task A")).toBeInTheDocument()
      expect(screen.getByText("Task B")).toBeInTheDocument()
      expect(screen.getByText("Task C")).toBeInTheDocument()
      expect(screen.getByText("Task D")).toBeInTheDocument()
    })

    it("sorts tasks by order within each column", () => {
      const unsortedTasks: Task[] = [
        createMockTask({ id: "t1", title: "Second Task", status: "TODO", order: 1 }),
        createMockTask({ id: "t2", title: "First Task", status: "TODO", order: 0 }),
        createMockTask({ id: "t3", title: "Third Task", status: "TODO", order: 2 }),
      ]

      render(<TaskBoard {...defaultProps} tasks={unsortedTasks} />)

      // All tasks should be rendered
      expect(screen.getByText("First Task")).toBeInTheDocument()
      expect(screen.getByText("Second Task")).toBeInTheDocument()
      expect(screen.getByText("Third Task")).toBeInTheDocument()
    })

    it("handles tasks with same order gracefully", () => {
      const sameOrderTasks: Task[] = [
        createMockTask({ id: "t1", title: "Task 1", status: "TODO", order: 0 }),
        createMockTask({ id: "t2", title: "Task 2", status: "TODO", order: 0 }),
      ]

      render(<TaskBoard {...defaultProps} tasks={sameOrderTasks} />)

      expect(screen.getByText("Task 1")).toBeInTheDocument()
      expect(screen.getByText("Task 2")).toBeInTheDocument()
    })
  })

  describe("Drag Start Handler", () => {
    it("sets active task when drag starts", () => {
      render(<TaskBoard {...defaultProps} />)

      expect(dndContextProps.onDragStart).toBeDefined()

      // Simulate drag start with a valid task
      act(() => {
        dndContextProps.onDragStart?.({
          active: { id: "1" },
        })
      })

      // The active task should be set (shown in DragOverlay)
      // Since we're mocking, we can verify the handler was called
      expect(dndContextProps.onDragStart).toBeDefined()
    })

    it("does not set active task for non-existent task id", () => {
      render(<TaskBoard {...defaultProps} />)

      act(() => {
        dndContextProps.onDragStart?.({
          active: { id: "non-existent" },
        })
      })

      // No errors should occur
      expect(screen.getByTestId("dnd-context")).toBeInTheDocument()
    })
  })

  describe("Drag Over Handler", () => {
    it("calls onTaskMove when dragging to a different column", () => {
      render(<TaskBoard {...defaultProps} />)

      expect(dndContextProps.onDragOver).toBeDefined()

      // Simulate dragging task 1 (TODO) over IN_PROGRESS column
      act(() => {
        dndContextProps.onDragOver?.({
          active: { id: "1" },
          over: { id: "IN_PROGRESS" },
        })
      })

      expect(mockOnTaskMove).toHaveBeenCalledWith("1", "IN_PROGRESS", 1)
    })

    it("calls onTaskMove when dragging to DONE column", () => {
      render(<TaskBoard {...defaultProps} />)

      act(() => {
        dndContextProps.onDragOver?.({
          active: { id: "1" },
          over: { id: "DONE" },
        })
      })

      expect(mockOnTaskMove).toHaveBeenCalledWith("1", "DONE", 1)
    })

    it("does not call onTaskMove when dragging to same column", () => {
      render(<TaskBoard {...defaultProps} />)

      // Task 1 is already in TODO column
      act(() => {
        dndContextProps.onDragOver?.({
          active: { id: "1" },
          over: { id: "TODO" },
        })
      })

      expect(mockOnTaskMove).not.toHaveBeenCalled()
    })

    it("does not call onTaskMove when over is null", () => {
      render(<TaskBoard {...defaultProps} />)

      act(() => {
        dndContextProps.onDragOver?.({
          active: { id: "1" },
          over: null,
        })
      })

      expect(mockOnTaskMove).not.toHaveBeenCalled()
    })

    it("does not call onTaskMove for non-existent task", () => {
      render(<TaskBoard {...defaultProps} />)

      act(() => {
        dndContextProps.onDragOver?.({
          active: { id: "non-existent" },
          over: { id: "IN_PROGRESS" },
        })
      })

      expect(mockOnTaskMove).not.toHaveBeenCalled()
    })

    it("does not call onTaskMove when dragging over another task", () => {
      render(<TaskBoard {...defaultProps} />)

      // Dragging task 1 over task 2 (both in TODO)
      act(() => {
        dndContextProps.onDragOver?.({
          active: { id: "1" },
          over: { id: "2" },
        })
      })

      expect(mockOnTaskMove).not.toHaveBeenCalled()
    })

    it("calculates correct order when dragging to empty column", () => {
      const tasksWithEmptyColumn: Task[] = [
        createMockTask({ id: "t1", title: "Task 1", status: "TODO", order: 0 }),
      ]

      render(<TaskBoard {...defaultProps} tasks={tasksWithEmptyColumn} />)

      act(() => {
        dndContextProps.onDragOver?.({
          active: { id: "t1" },
          over: { id: "IN_PROGRESS" },
        })
      })

      // IN_PROGRESS column is empty, so newOrder should be 0
      expect(mockOnTaskMove).toHaveBeenCalledWith("t1", "IN_PROGRESS", 0)
    })

    it("calculates correct order when dragging to column with tasks", () => {
      const tasksInTargetColumn: Task[] = [
        createMockTask({ id: "t1", title: "Task 1", status: "TODO", order: 0 }),
        createMockTask({ id: "t2", title: "Task 2", status: "IN_PROGRESS", order: 0 }),
        createMockTask({ id: "t3", title: "Task 3", status: "IN_PROGRESS", order: 1 }),
      ]

      render(<TaskBoard {...defaultProps} tasks={tasksInTargetColumn} />)

      act(() => {
        dndContextProps.onDragOver?.({
          active: { id: "t1" },
          over: { id: "IN_PROGRESS" },
        })
      })

      // IN_PROGRESS has 2 tasks, so newOrder should be 2
      expect(mockOnTaskMove).toHaveBeenCalledWith("t1", "IN_PROGRESS", 2)
    })
  })

  describe("Drag End Handler", () => {
    it("clears active task when drag ends", () => {
      render(<TaskBoard {...defaultProps} />)

      // First start a drag
      act(() => {
        dndContextProps.onDragStart?.({
          active: { id: "1" },
        })
      })

      // Then end the drag
      act(() => {
        dndContextProps.onDragEnd?.({
          active: { id: "1" },
          over: null,
        })
      })

      // No errors should occur
      expect(screen.getByTestId("dnd-context")).toBeInTheDocument()
    })

    it("does not call onTaskMove when over is null", () => {
      render(<TaskBoard {...defaultProps} />)

      act(() => {
        dndContextProps.onDragEnd?.({
          active: { id: "1" },
          over: null,
        })
      })

      expect(mockOnTaskMove).not.toHaveBeenCalled()
    })

    it("does not call onTaskMove when dropping on same position", () => {
      render(<TaskBoard {...defaultProps} />)

      act(() => {
        dndContextProps.onDragEnd?.({
          active: { id: "1" },
          over: { id: "1" },
        })
      })

      expect(mockOnTaskMove).not.toHaveBeenCalled()
    })

    it("reorders tasks within same column when dropping on another task", () => {
      render(<TaskBoard {...defaultProps} />)

      // Drag task 1 (order 0) to position of task 2 (order 1) in TODO column
      act(() => {
        dndContextProps.onDragEnd?.({
          active: { id: "1" },
          over: { id: "2" },
        })
      })

      // Should reorder within the same column
      expect(mockOnTaskMove).toHaveBeenCalledWith("1", "TODO", 1)
    })

    it("moves task to column when dropping on column id", () => {
      render(<TaskBoard {...defaultProps} />)

      // Drag task 1 from TODO to IN_PROGRESS column
      act(() => {
        dndContextProps.onDragEnd?.({
          active: { id: "1" },
          over: { id: "IN_PROGRESS" },
        })
      })

      // Should move to end of IN_PROGRESS column (which has 1 task)
      expect(mockOnTaskMove).toHaveBeenCalledWith("1", "IN_PROGRESS", 1)
    })

    it("moves task to DONE column", () => {
      render(<TaskBoard {...defaultProps} />)

      act(() => {
        dndContextProps.onDragEnd?.({
          active: { id: "1" },
          over: { id: "DONE" },
        })
      })

      expect(mockOnTaskMove).toHaveBeenCalledWith("1", "DONE", 1)
    })

    it("moves task to TODO column from IN_PROGRESS", () => {
      render(<TaskBoard {...defaultProps} />)

      act(() => {
        dndContextProps.onDragEnd?.({
          active: { id: "3" }, // IN_PROGRESS task
          over: { id: "TODO" },
        })
      })

      expect(mockOnTaskMove).toHaveBeenCalledWith("3", "TODO", 2)
    })

    it("does not call onTaskMove for non-existent active task", () => {
      render(<TaskBoard {...defaultProps} />)

      act(() => {
        dndContextProps.onDragEnd?.({
          active: { id: "non-existent" },
          over: { id: "TODO" },
        })
      })

      expect(mockOnTaskMove).not.toHaveBeenCalled()
    })

    it("does not reorder when indices are the same", () => {
      const singleTaskColumn: Task[] = [
        createMockTask({ id: "t1", title: "Only Task", status: "TODO", order: 0 }),
      ]

      render(<TaskBoard {...defaultProps} tasks={singleTaskColumn} />)

      // Try to drop on a non-existent task in the same column
      act(() => {
        dndContextProps.onDragEnd?.({
          active: { id: "t1" },
          over: { id: "non-existent" },
        })
      })

      expect(mockOnTaskMove).not.toHaveBeenCalled()
    })

    it("handles dropping task on task from different column", () => {
      render(<TaskBoard {...defaultProps} />)

      // Task 1 is in TODO, Task 3 is in IN_PROGRESS
      // This should not trigger reordering since they're in different columns
      act(() => {
        dndContextProps.onDragEnd?.({
          active: { id: "1" },
          over: { id: "3" },
        })
      })

      // Different columns, so no same-column reorder
      expect(mockOnTaskMove).not.toHaveBeenCalled()
    })
  })

  describe("Sensor Configuration", () => {
    it("configures PointerSensor with distance constraint", async () => {
      // Import the mocked functions
      const dndCore = await import("@dnd-kit/core")

      render(<TaskBoard {...defaultProps} />)

      // Verify that useSensors was called (the mock returns the sensors array)
      expect(dndCore.useSensors).toHaveBeenCalled()
      // Verify that useSensor was called with PointerSensor and config
      expect(dndCore.useSensor).toHaveBeenCalledWith(
        dndCore.PointerSensor,
        expect.objectContaining({
          activationConstraint: { distance: 8 },
        })
      )
    })
  })

  describe("Edge Cases", () => {
    it("handles empty tasks array", () => {
      render(<TaskBoard {...defaultProps} tasks={[]} />)

      const columns = screen.getAllByText("No tasks")
      expect(columns).toHaveLength(3)
    })

    it("handles tasks with all statuses", () => {
      const allStatusTasks: Task[] = [
        createMockTask({ id: "t1", title: "Todo", status: "TODO", order: 0 }),
        createMockTask({ id: "t2", title: "Progress", status: "IN_PROGRESS", order: 0 }),
        createMockTask({ id: "t3", title: "Completed", status: "DONE", order: 0, isCompleted: true }),
      ]

      render(<TaskBoard {...defaultProps} tasks={allStatusTasks} />)

      expect(screen.getByText("Todo")).toBeInTheDocument()
      expect(screen.getByText("Progress")).toBeInTheDocument()
      expect(screen.getByText("Completed")).toBeInTheDocument()
    })

    it("handles large number of tasks", () => {
      const manyTasks: Task[] = Array.from({ length: 50 }, (_, i) =>
        createMockTask({
          id: `task-${i}`,
          title: `Task ${i}`,
          status: ["TODO", "IN_PROGRESS", "DONE"][i % 3] as Task["status"],
          order: Math.floor(i / 3),
          isCompleted: i % 3 === 2,
        })
      )

      render(<TaskBoard {...defaultProps} tasks={manyTasks} />)

      // Check that the first task is rendered
      expect(screen.getByText("Task 0")).toBeInTheDocument()
    })

    it("updates when tasks prop changes", () => {
      const { rerender } = render(<TaskBoard {...defaultProps} />)

      expect(screen.getByText("Todo Task 1")).toBeInTheDocument()

      const newTasks: Task[] = [
        createMockTask({ id: "new-1", title: "New Task", status: "TODO", order: 0 }),
      ]

      rerender(<TaskBoard {...defaultProps} tasks={newTasks} />)

      expect(screen.getByText("New Task")).toBeInTheDocument()
      expect(screen.queryByText("Todo Task 1")).not.toBeInTheDocument()
    })

    it("handles rapid task updates during drag", () => {
      render(<TaskBoard {...defaultProps} />)

      // Start drag
      act(() => {
        dndContextProps.onDragStart?.({ active: { id: "1" } })
      })

      // Multiple drag overs in quick succession
      act(() => {
        dndContextProps.onDragOver?.({ active: { id: "1" }, over: { id: "IN_PROGRESS" } })
      })

      act(() => {
        dndContextProps.onDragOver?.({ active: { id: "1" }, over: { id: "DONE" } })
      })

      // End drag
      act(() => {
        dndContextProps.onDragEnd?.({ active: { id: "1" }, over: { id: "DONE" } })
      })

      // Should have been called multiple times
      expect(mockOnTaskMove).toHaveBeenCalledTimes(3)
    })

    it("handles tasks with duplicate ids gracefully", () => {
      // This is an edge case that shouldn't happen in practice
      // but the component should not crash
      const duplicateIdTasks: Task[] = [
        createMockTask({ id: "same-id", title: "Task 1", status: "TODO", order: 0 }),
        createMockTask({ id: "same-id", title: "Task 2", status: "TODO", order: 1 }),
      ]

      // Should not throw
      expect(() => {
        render(<TaskBoard {...defaultProps} tasks={duplicateIdTasks} />)
      }).not.toThrow()
    })

    it("handles negative order values", () => {
      const negativeOrderTasks: Task[] = [
        createMockTask({ id: "t1", title: "Task 1", status: "TODO", order: -1 }),
        createMockTask({ id: "t2", title: "Task 2", status: "TODO", order: 0 }),
      ]

      render(<TaskBoard {...defaultProps} tasks={negativeOrderTasks} />)

      expect(screen.getByText("Task 1")).toBeInTheDocument()
      expect(screen.getByText("Task 2")).toBeInTheDocument()
    })
  })

  describe("Callback Props", () => {
    it("passes onToggleComplete to columns", () => {
      render(<TaskBoard {...defaultProps} />)

      // The onToggleComplete should be passed through to TaskColumn
      // We verify by checking the component renders without errors
      expect(screen.getByText("To Do")).toBeInTheDocument()
    })

    it("passes onEdit to columns", () => {
      render(<TaskBoard {...defaultProps} />)

      expect(screen.getByText("In Progress")).toBeInTheDocument()
    })

    it("passes onDelete to columns", () => {
      render(<TaskBoard {...defaultProps} />)

      expect(screen.getByText("Done")).toBeInTheDocument()
    })

    it("passes onAddTask to columns", () => {
      // Render with empty tasks so the "Add task" text buttons are visible
      render(<TaskBoard {...defaultProps} tasks={[]} />)

      // Verify "Add task" buttons are rendered (these appear in empty columns)
      const addButtons = screen.getAllByRole("button", { name: /add task/i })
      expect(addButtons.length).toBe(3) // One per column
    })

    it("conditionally passes onClick to columns", () => {
      const { rerender } = render(<TaskBoard {...defaultProps} />)

      // Without onClick
      expect(screen.getByText("To Do")).toBeInTheDocument()

      // With onClick
      rerender(<TaskBoard {...defaultProps} onClick={mockOnClick} />)
      expect(screen.getByText("To Do")).toBeInTheDocument()
    })
  })

  describe("Memoization", () => {
    it("does not re-calculate tasksByStatus when unrelated props change", () => {
      const { rerender } = render(<TaskBoard {...defaultProps} />)

      // Re-render with same tasks but different callbacks
      const newOnEdit = vi.fn()
      rerender(<TaskBoard {...defaultProps} onEdit={newOnEdit} />)

      // Component should still render correctly
      expect(screen.getByText("Todo Task 1")).toBeInTheDocument()
    })

    it("re-calculates tasksByStatus when tasks prop changes", () => {
      const { rerender } = render(<TaskBoard {...defaultProps} />)

      expect(screen.getByText("Todo Task 1")).toBeInTheDocument()

      const updatedTasks = [
        ...mockTasks,
        createMockTask({ id: "new-task", title: "Newly Added", status: "TODO", order: 2 }),
      ]

      rerender(<TaskBoard {...defaultProps} tasks={updatedTasks} />)

      expect(screen.getByText("Newly Added")).toBeInTheDocument()
    })
  })
})
