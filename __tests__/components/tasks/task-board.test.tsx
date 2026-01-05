import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { TaskBoard } from "@/components/tasks/task-board"
import type { Task } from "@/types/task"

// Mock DnD kit
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div data-testid="drag-overlay">{children}</div>,
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  closestCorners: vi.fn(),
  useDroppable: vi.fn(() => ({ setNodeRef: vi.fn(), isOver: false })),
}))

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
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
      {checked ? "✓" : ""}
    </button>
  ),
}))

vi.mock("@/components/shared/confetti", () => ({
  celebrateTaskComplete: vi.fn(),
}))

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Todo Task",
    description: "Description 1",
    priority: "HIGH",
    status: "TODO",
    isCompleted: false,
    dueDate: null,
    order: 0,
    tags: [],
  },
  {
    id: "2",
    title: "In Progress Task",
    description: null,
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    isCompleted: false,
    dueDate: null,
    order: 0,
    tags: [],
  },
  {
    id: "3",
    title: "Done Task",
    description: null,
    priority: "LOW",
    status: "DONE",
    isCompleted: true,
    dueDate: null,
    order: 0,
    tags: [],
  },
]

describe("TaskBoard", () => {
  const mockOnTaskMove = vi.fn()
  const mockOnToggleComplete = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnAddTask = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders all three columns", () => {
    render(
      <TaskBoard
        tasks={mockTasks}
        onTaskMove={mockOnTaskMove}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    expect(screen.getByText("To Do")).toBeInTheDocument()
    expect(screen.getByText("In Progress")).toBeInTheDocument()
    expect(screen.getByText("Done")).toBeInTheDocument()
  })

  it("renders tasks in correct columns", () => {
    render(
      <TaskBoard
        tasks={mockTasks}
        onTaskMove={mockOnTaskMove}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    expect(screen.getByText("Todo Task")).toBeInTheDocument()
    expect(screen.getByText("In Progress Task")).toBeInTheDocument()
    expect(screen.getByText("Done Task")).toBeInTheDocument()
  })

  it("renders DndContext wrapper", () => {
    render(
      <TaskBoard
        tasks={mockTasks}
        onTaskMove={mockOnTaskMove}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    expect(screen.getByTestId("dnd-context")).toBeInTheDocument()
  })

  it("shows task counts in column headers", () => {
    render(
      <TaskBoard
        tasks={mockTasks}
        onTaskMove={mockOnTaskMove}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    // Each column should show "1 tasks" since we have one task per status
    const taskCounts = screen.getAllByText("1 tasks")
    expect(taskCounts.length).toBe(3)
  })

  it("renders empty state when no tasks", () => {
    render(
      <TaskBoard
        tasks={[]}
        onTaskMove={mockOnTaskMove}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    // Should show "No tasks" in empty columns
    const noTasksElements = screen.getAllByText("No tasks")
    expect(noTasksElements.length).toBe(3)
  })

  it("renders drag overlay container", () => {
    render(
      <TaskBoard
        tasks={mockTasks}
        onTaskMove={mockOnTaskMove}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    expect(screen.getByTestId("drag-overlay")).toBeInTheDocument()
  })
})
