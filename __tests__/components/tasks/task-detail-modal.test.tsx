import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TaskDetailModal } from "@/components/tasks/task-detail-modal"
import type { Task } from "@/types/task"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Mock the animated checkbox
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

// Mock confetti
vi.mock("@/components/shared/confetti", () => ({
  celebrateTaskComplete: vi.fn(),
}))

// Mock SubtaskList
vi.mock("@/components/tasks/subtask-list", () => ({
  SubtaskList: ({ taskId }: { taskId: string }) => (
    <div data-testid="subtask-list">Subtask List for {taskId}</div>
  ),
}))

// Mock PriorityBadge
vi.mock("@/components/tasks/priority-badge", () => ({
  PriorityBadge: ({ priority }: { priority: string }) => (
    <span data-testid="priority-badge">{priority}</span>
  ),
}))

// Mock UI components
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: React.PropsWithChildren<{ open: boolean }>) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: React.PropsWithChildren) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogTitle: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <h2 className={className}>{children}</h2>
  ),
}))

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

const mockTask: Task = {
  id: "task-1",
  title: "Test Task",
  description: "Test description",
  priority: "HIGH",
  status: "TODO",
  isCompleted: false,
  dueDate: new Date("2025-01-15"),
  order: 0,
  tags: [
    { id: 1, name: "work" },
    { id: 2, name: "urgent" },
  ],
  subtasks: [
    {
      id: "st-1",
      title: "Subtask 1",
      isCompleted: false,
      order: 0,
      taskId: "task-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date(),
}

const mockHandlers = {
  onOpenChange: vi.fn(),
  onToggleComplete: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onSubtasksChange: vi.fn(),
}

describe("TaskDetailModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders nothing when task is null", () => {
    const { container } = render(
      <TaskDetailModal task={null} open={true} {...mockHandlers} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when dialog is closed", () => {
    const { container } = render(
      <TaskDetailModal task={mockTask} open={false} {...mockHandlers} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders task title", () => {
    render(<TaskDetailModal task={mockTask} open={true} {...mockHandlers} />)
    expect(screen.getByText("Test Task")).toBeInTheDocument()
  })

  it("renders task description", () => {
    render(<TaskDetailModal task={mockTask} open={true} {...mockHandlers} />)
    expect(screen.getByText("Test description")).toBeInTheDocument()
  })

  it("renders priority badge", () => {
    render(<TaskDetailModal task={mockTask} open={true} {...mockHandlers} />)
    expect(screen.getByTestId("priority-badge")).toBeInTheDocument()
  })

  it("renders tags", () => {
    render(<TaskDetailModal task={mockTask} open={true} {...mockHandlers} />)
    expect(screen.getByText("work")).toBeInTheDocument()
    expect(screen.getByText("urgent")).toBeInTheDocument()
  })

  it("renders subtask list", () => {
    render(<TaskDetailModal task={mockTask} open={true} {...mockHandlers} />)
    expect(screen.getByTestId("subtask-list")).toBeInTheDocument()
  })

  it("renders status label", () => {
    render(<TaskDetailModal task={mockTask} open={true} {...mockHandlers} />)
    expect(screen.getByText("To Do")).toBeInTheDocument()
  })

  it("calls onToggleComplete when checkbox is clicked", () => {
    render(<TaskDetailModal task={mockTask} open={true} {...mockHandlers} />)
    const checkbox = screen.getByRole("checkbox")
    fireEvent.click(checkbox)
    expect(mockHandlers.onToggleComplete).toHaveBeenCalledWith("task-1")
  })

  it("calls onEdit and closes modal when Edit button is clicked", () => {
    render(<TaskDetailModal task={mockTask} open={true} {...mockHandlers} />)
    const editButton = screen.getByRole("button", { name: /edit/i })
    fireEvent.click(editButton)
    expect(mockHandlers.onOpenChange).toHaveBeenCalledWith(false)
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask)
  })

  it("calls onDelete and closes modal when Delete button is clicked", () => {
    render(<TaskDetailModal task={mockTask} open={true} {...mockHandlers} />)
    const deleteButton = screen.getByRole("button", { name: /delete/i })
    fireEvent.click(deleteButton)
    expect(mockHandlers.onOpenChange).toHaveBeenCalledWith(false)
    expect(mockHandlers.onDelete).toHaveBeenCalledWith("task-1")
  })

  it("renders In Progress status correctly", () => {
    const inProgressTask = { ...mockTask, status: "IN_PROGRESS" as const }
    render(<TaskDetailModal task={inProgressTask} open={true} {...mockHandlers} />)
    expect(screen.getByText("In Progress")).toBeInTheDocument()
  })

  it("renders Done status correctly", () => {
    const doneTask = { ...mockTask, status: "DONE" as const, isCompleted: true }
    render(<TaskDetailModal task={doneTask} open={true} {...mockHandlers} />)
    expect(screen.getByText("Done")).toBeInTheDocument()
  })

  it("applies line-through style to completed task title", () => {
    const completedTask = { ...mockTask, isCompleted: true, status: "DONE" as const }
    render(<TaskDetailModal task={completedTask} open={true} {...mockHandlers} />)
    const title = screen.getByText("Test Task")
    expect(title).toHaveClass("line-through")
  })

  it("renders without description when not provided", () => {
    const taskWithoutDesc = { ...mockTask, description: null }
    render(<TaskDetailModal task={taskWithoutDesc} open={true} {...mockHandlers} />)
    expect(screen.queryByText("Description")).not.toBeInTheDocument()
  })

  it("renders without tags when empty", () => {
    const taskWithoutTags = { ...mockTask, tags: [] }
    render(<TaskDetailModal task={taskWithoutTags} open={true} {...mockHandlers} />)
    expect(screen.queryByText("Tags")).not.toBeInTheDocument()
  })

  it("shows subtask progress when subtasks exist", () => {
    render(<TaskDetailModal task={mockTask} open={true} {...mockHandlers} />)
    expect(screen.getByText("0 of 1 completed")).toBeInTheDocument()
  })
})
