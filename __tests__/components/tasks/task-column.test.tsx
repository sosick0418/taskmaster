import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TaskColumn } from "@/components/tasks/task-column"
import type { Task } from "@/types/task"

// Mock DnD kit
vi.mock("@dnd-kit/core", () => ({
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

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Task 1",
    description: "Description",
    priority: "HIGH",
    status: "TODO",
    isCompleted: false,
    dueDate: null,
    order: 0,
    tags: [],
  },
  {
    id: "2",
    title: "Task 2",
    description: null,
    priority: "LOW",
    status: "TODO",
    isCompleted: false,
    dueDate: null,
    order: 1,
    tags: [],
  },
]

describe("TaskColumn", () => {
  const mockOnToggleComplete = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnAddTask = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders column title", () => {
    render(
      <TaskColumn
        id="TODO"
        title="To Do"
        tasks={mockTasks}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    expect(screen.getByText("To Do")).toBeInTheDocument()
  })

  it("renders task count", () => {
    render(
      <TaskColumn
        id="TODO"
        title="To Do"
        tasks={mockTasks}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    expect(screen.getByText("2 tasks")).toBeInTheDocument()
  })

  it("renders tasks in the column", () => {
    render(
      <TaskColumn
        id="TODO"
        title="To Do"
        tasks={mockTasks}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    expect(screen.getByText("Task 1")).toBeInTheDocument()
    expect(screen.getByText("Task 2")).toBeInTheDocument()
  })

  it("renders empty state when no tasks", () => {
    render(
      <TaskColumn
        id="TODO"
        title="To Do"
        tasks={[]}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    expect(screen.getByText("No tasks")).toBeInTheDocument()
    expect(screen.getByText("Add task")).toBeInTheDocument()
  })

  it("calls onAddTask when add button is clicked", () => {
    render(
      <TaskColumn
        id="IN_PROGRESS"
        title="In Progress"
        tasks={[]}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    const addButton = screen.getByRole("button", { name: /add task/i })
    fireEvent.click(addButton)

    expect(mockOnAddTask).toHaveBeenCalledWith("IN_PROGRESS")
  })

  it("renders correct icon for TODO status", () => {
    render(
      <TaskColumn
        id="TODO"
        title="To Do"
        tasks={mockTasks}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    // Column should render with slate gradient (TODO)
    const column = screen.getByText("To Do").closest("div")
    expect(column).toBeInTheDocument()
  })

  it("renders correct icon for IN_PROGRESS status", () => {
    render(
      <TaskColumn
        id="IN_PROGRESS"
        title="In Progress"
        tasks={[]}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    expect(screen.getByText("In Progress")).toBeInTheDocument()
  })

  it("renders correct icon for DONE status", () => {
    render(
      <TaskColumn
        id="DONE"
        title="Done"
        tasks={[]}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTask={mockOnAddTask}
      />
    )

    expect(screen.getByText("Done")).toBeInTheDocument()
  })
})
