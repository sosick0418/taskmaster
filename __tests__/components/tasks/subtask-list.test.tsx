import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SubtaskList } from "@/components/tasks/subtask-list"
import type { SubTask } from "@/types/task"

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

// Mock dnd-kit
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: React.PropsWithChildren) => <>{children}</>,
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
  arrayMove: vi.fn((arr, from, to) => {
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
      {checked ? "✓" : ""}
    </button>
  ),
}))

const createSubtask = (id: string, title: string, isCompleted = false, order = 0): SubTask => ({
  id,
  title,
  isCompleted,
  order,
  taskId: "task-1",
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe("SubtaskList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders empty list with add button", () => {
    render(<SubtaskList taskId="task-1" subtasks={[]} />)
    expect(screen.getByText("Add subtask")).toBeInTheDocument()
  })

  it("renders list of subtasks", () => {
    const subtasks = [
      createSubtask("1", "First subtask"),
      createSubtask("2", "Second subtask"),
    ]
    render(<SubtaskList taskId="task-1" subtasks={subtasks} />)
    expect(screen.getByText("First subtask")).toBeInTheDocument()
    expect(screen.getByText("Second subtask")).toBeInTheDocument()
  })

  it("shows add input when Add subtask button is clicked", () => {
    render(<SubtaskList taskId="task-1" subtasks={[]} />)
    fireEvent.click(screen.getByText("Add subtask"))
    expect(screen.getByPlaceholderText("Add subtask...")).toBeInTheDocument()
  })

  it("adds new subtask when Enter is pressed", async () => {
    const onSubtasksChange = vi.fn()
    render(<SubtaskList taskId="task-1" subtasks={[]} onSubtasksChange={onSubtasksChange} />)

    fireEvent.click(screen.getByText("Add subtask"))
    const input = screen.getByPlaceholderText("Add subtask...")
    fireEvent.change(input, { target: { value: "New subtask" } })
    fireEvent.keyDown(input, { key: "Enter" })

    await waitFor(() => {
      expect(screen.getByText("New subtask")).toBeInTheDocument()
    })
  })

  it("cancels add when Escape is pressed", () => {
    render(<SubtaskList taskId="task-1" subtasks={[]} />)

    fireEvent.click(screen.getByText("Add subtask"))
    const input = screen.getByPlaceholderText("Add subtask...")
    fireEvent.keyDown(input, { key: "Escape" })

    expect(screen.queryByPlaceholderText("Add subtask...")).not.toBeInTheDocument()
    expect(screen.getByText("Add subtask")).toBeInTheDocument()
  })

  it("does not add subtask with empty title", async () => {
    render(<SubtaskList taskId="task-1" subtasks={[]} />)

    fireEvent.click(screen.getByText("Add subtask"))
    const input = screen.getByPlaceholderText("Add subtask...")
    fireEvent.change(input, { target: { value: "   " } })
    fireEvent.keyDown(input, { key: "Enter" })

    // Add button should still be disabled or input still visible
    expect(screen.getByPlaceholderText("Add subtask...")).toBeInTheDocument()
  })

  it("closes add input on blur when empty", () => {
    render(<SubtaskList taskId="task-1" subtasks={[]} />)

    fireEvent.click(screen.getByText("Add subtask"))
    const input = screen.getByPlaceholderText("Add subtask...")
    fireEvent.blur(input)

    expect(screen.queryByPlaceholderText("Add subtask...")).not.toBeInTheDocument()
  })

  it("renders checkboxes for each subtask", () => {
    const subtasks = [
      createSubtask("1", "First subtask"),
      createSubtask("2", "Second subtask", true),
    ]
    render(<SubtaskList taskId="task-1" subtasks={subtasks} />)

    const checkboxes = screen.getAllByRole("checkbox")
    expect(checkboxes).toHaveLength(2)
    expect(checkboxes[0]).toHaveAttribute("aria-checked", "false")
    expect(checkboxes[1]).toHaveAttribute("aria-checked", "true")
  })

  it("renders Add button for adding subtasks", () => {
    render(<SubtaskList taskId="task-1" subtasks={[]} />)
    const addButton = screen.getByRole("button", { name: /add subtask/i })
    expect(addButton).toBeInTheDocument()
  })
})
