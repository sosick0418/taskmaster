import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TaskCard } from "@/components/tasks/task-card"
import type { Task } from "@/types/task"

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

const mockTask: Task = {
  id: "1",
  title: "Test Task",
  description: "Test description",
  priority: "HIGH",
  status: "TODO",
  isCompleted: false,
  dueDate: new Date("2025-01-10"),
  order: 0,
  tags: [
    { id: 1, name: "work" },
    { id: 2, name: "urgent" },
  ],
}

const mockHandlers = {
  onToggleComplete: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
}

describe("TaskCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders task title", () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)
    expect(screen.getByText("Test Task")).toBeInTheDocument()
  })

  it("renders task description", () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)
    expect(screen.getByText("Test description")).toBeInTheDocument()
  })

  it("renders priority badge", () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)
    expect(screen.getByText("High")).toBeInTheDocument()
  })

  it("renders tags", () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)
    expect(screen.getByText("work")).toBeInTheDocument()
    expect(screen.getByText("urgent")).toBeInTheDocument()
  })

  it("calls onToggleComplete when checkbox is clicked", () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)
    const checkbox = screen.getByRole("checkbox")
    fireEvent.click(checkbox)
    expect(mockHandlers.onToggleComplete).toHaveBeenCalledWith("1")
  })

  it("renders without description when not provided", () => {
    const taskWithoutDesc = { ...mockTask, description: null }
    render(<TaskCard task={taskWithoutDesc} {...mockHandlers} />)
    expect(screen.getByText("Test Task")).toBeInTheDocument()
    expect(screen.queryByText("Test description")).not.toBeInTheDocument()
  })

  it("renders without due date when not provided", () => {
    const taskWithoutDue = { ...mockTask, dueDate: null }
    render(<TaskCard task={taskWithoutDue} {...mockHandlers} />)
    expect(screen.getByText("Test Task")).toBeInTheDocument()
  })

  it("renders completed task with correct styling", () => {
    const completedTask = { ...mockTask, isCompleted: true, status: "DONE" as const }
    render(<TaskCard task={completedTask} {...mockHandlers} />)
    const titleElement = screen.getByText("Test Task")
    expect(titleElement).toHaveClass("line-through")
  })

  it("renders checkbox as checked for completed task", () => {
    const completedTask = { ...mockTask, isCompleted: true, status: "DONE" as const }
    render(<TaskCard task={completedTask} {...mockHandlers} />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).toHaveAttribute("aria-checked", "true")
  })
})
