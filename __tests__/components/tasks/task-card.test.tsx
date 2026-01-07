import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TaskCard } from "@/components/tasks/task-card"
import type { Task, SubTask } from "@/types/task"
import { celebrateTaskComplete } from "@/components/shared/confetti"

// Mock the animated checkbox and confetti
vi.mock("@/components/shared/animated-checkbox", () => ({
  CircularCheckbox: ({
    checked,
    onChange,
  }: {
    checked: boolean
    onChange: () => void
  }) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      data-testid="circular-checkbox"
      data-checkbox
    >
      {checked ? "checked" : "unchecked"}
    </button>
  ),
}))

vi.mock("@/components/shared/confetti", () => ({
  celebrateTaskComplete: vi.fn(),
}))

// Helper to create a task with default values
function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "test-task-id-1",
    title: "Test Task",
    description: "Test description",
    priority: "MEDIUM",
    status: "TODO",
    isCompleted: false,
    dueDate: null,
    order: 0,
    tags: [],
    subtasks: [],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  }
}

// Helper to create subtasks
function createMockSubtask(overrides: Partial<SubTask> = {}): SubTask {
  return {
    id: "subtask-1",
    title: "Subtask 1",
    isCompleted: false,
    order: 0,
    taskId: "test-task-id-1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  }
}

const createMockHandlers = () => ({
  onToggleComplete: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onClick: vi.fn(),
})

describe("TaskCard", () => {
  let mockHandlers: ReturnType<typeof createMockHandlers>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Set a fixed date for consistent testing
    vi.setSystemTime(new Date("2025-01-15T12:00:00"))
    mockHandlers = createMockHandlers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("Basic Rendering", () => {
    it("renders task title", () => {
      const task = createMockTask({ title: "My Important Task" })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText("My Important Task")).toBeInTheDocument()
    })

    it("renders task description when provided", () => {
      const task = createMockTask({ description: "This is a detailed description" })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText("This is a detailed description")).toBeInTheDocument()
    })

    it("does not render description when null", () => {
      const task = createMockTask({ description: null })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.queryByText("Test description")).not.toBeInTheDocument()
    })

    it("renders checkbox", () => {
      const task = createMockTask()
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByRole("checkbox")).toBeInTheDocument()
    })
  })

  describe("Priority Badge", () => {
    it.each([
      ["LOW", "Low"],
      ["MEDIUM", "Medium"],
      ["HIGH", "High"],
      ["URGENT", "Urgent"],
    ] as const)("renders %s priority badge correctly", (priority, expectedLabel) => {
      const task = createMockTask({ priority })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText(expectedLabel)).toBeInTheDocument()
    })
  })

  describe("Tags", () => {
    it("renders multiple tags", () => {
      const task = createMockTask({
        tags: [
          { id: 1, name: "work" },
          { id: 2, name: "urgent" },
          { id: 3, name: "frontend" },
        ],
      })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText("work")).toBeInTheDocument()
      expect(screen.getByText("urgent")).toBeInTheDocument()
      expect(screen.getByText("frontend")).toBeInTheDocument()
    })

    it("renders without tags when array is empty", () => {
      const task = createMockTask({ tags: [] })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText("Test Task")).toBeInTheDocument()
      // No tags should be rendered
      const tagContainer = screen.queryByText("work")
      expect(tagContainer).not.toBeInTheDocument()
    })
  })

  describe("Due Date Formatting", () => {
    it("displays 'Today' for due date on current day", () => {
      const task = createMockTask({ dueDate: new Date("2025-01-15T18:00:00") })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText("Today")).toBeInTheDocument()
    })

    it("displays 'Tomorrow' for due date on next day", () => {
      const task = createMockTask({ dueDate: new Date("2025-01-16T12:00:00") })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText("Tomorrow")).toBeInTheDocument()
    })

    it("displays relative time for past due dates", () => {
      const task = createMockTask({ dueDate: new Date("2025-01-10T12:00:00") })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText(/ago/)).toBeInTheDocument()
    })

    it("displays relative time for future due dates", () => {
      const task = createMockTask({ dueDate: new Date("2025-01-25T12:00:00") })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText(/in/)).toBeInTheDocument()
    })

    it("applies overdue styling for past due dates", () => {
      const task = createMockTask({ dueDate: new Date("2025-01-10T12:00:00") })
      render(<TaskCard task={task} {...mockHandlers} />)
      const dueDateElement = screen.getByText(/ago/).closest("div")
      expect(dueDateElement).toHaveClass("bg-red-500/20")
    })

    it("does not apply overdue styling for future due dates", () => {
      const task = createMockTask({ dueDate: new Date("2025-01-25T12:00:00") })
      render(<TaskCard task={task} {...mockHandlers} />)
      const dueDateElement = screen.getByText(/in/).closest("div")
      expect(dueDateElement).toHaveClass("bg-muted")
      expect(dueDateElement).not.toHaveClass("bg-red-500/20")
    })

    it("does not render due date when null", () => {
      const task = createMockTask({ dueDate: null })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.queryByText("Today")).not.toBeInTheDocument()
      expect(screen.queryByText("Tomorrow")).not.toBeInTheDocument()
    })
  })

  describe("Completed Task State", () => {
    it("renders checkbox as checked for completed task", () => {
      const task = createMockTask({ isCompleted: true, status: "DONE" })
      render(<TaskCard task={task} {...mockHandlers} />)
      const checkbox = screen.getByRole("checkbox")
      expect(checkbox).toHaveAttribute("aria-checked", "true")
    })

    it("renders checkbox as unchecked for incomplete task", () => {
      const task = createMockTask({ isCompleted: false })
      render(<TaskCard task={task} {...mockHandlers} />)
      const checkbox = screen.getByRole("checkbox")
      expect(checkbox).toHaveAttribute("aria-checked", "false")
    })

    it("applies strikethrough style to completed task title", () => {
      const task = createMockTask({ isCompleted: true, status: "DONE" })
      render(<TaskCard task={task} {...mockHandlers} />)
      const titleElement = screen.getByText("Test Task")
      expect(titleElement).toHaveClass("line-through")
    })

    it("applies opacity style to completed task container", () => {
      const task = createMockTask({ isCompleted: true, status: "DONE" })
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const cardElement = container.firstChild
      expect(cardElement).toHaveClass("opacity-60")
    })

    it("does not apply completed styles to incomplete task", () => {
      const task = createMockTask({ isCompleted: false })
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const cardElement = container.firstChild
      const titleElement = screen.getByText("Test Task")
      expect(cardElement).not.toHaveClass("opacity-60")
      expect(titleElement).not.toHaveClass("line-through")
    })
  })

  describe("Toggle Complete Interaction", () => {
    it("calls onToggleComplete when checkbox is clicked", async () => {
      const task = createMockTask({ id: "task-123" })
      render(<TaskCard task={task} {...mockHandlers} />)
      const checkbox = screen.getByRole("checkbox")
      fireEvent.click(checkbox)
      expect(mockHandlers.onToggleComplete).toHaveBeenCalledWith("task-123")
    })

    it("calls celebrateTaskComplete when completing a task", () => {
      const task = createMockTask({ isCompleted: false })
      render(<TaskCard task={task} {...mockHandlers} />)
      const checkbox = screen.getByRole("checkbox")
      fireEvent.click(checkbox)
      expect(celebrateTaskComplete).toHaveBeenCalled()
    })

    it("does not call celebrateTaskComplete when uncompleting a task", () => {
      const task = createMockTask({ isCompleted: true })
      render(<TaskCard task={task} {...mockHandlers} />)
      const checkbox = screen.getByRole("checkbox")
      fireEvent.click(checkbox)
      expect(celebrateTaskComplete).not.toHaveBeenCalled()
    })
  })

  describe("Card Click Interaction", () => {
    it("calls onClick when card is clicked", () => {
      const task = createMockTask()
      render(<TaskCard task={task} {...mockHandlers} />)
      // Click on the title area (not button, checkbox, or drag handle)
      fireEvent.click(screen.getByText("Test Task"))
      expect(mockHandlers.onClick).toHaveBeenCalledWith(task)
    })

    it("does not call onClick when checkbox is clicked", () => {
      const task = createMockTask()
      render(<TaskCard task={task} {...mockHandlers} />)
      const checkbox = screen.getByRole("checkbox")
      fireEvent.click(checkbox)
      expect(mockHandlers.onClick).not.toHaveBeenCalled()
    })

    it("applies cursor-pointer style when onClick is provided", () => {
      const task = createMockTask()
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const cardElement = container.firstChild
      expect(cardElement).toHaveClass("cursor-pointer")
    })

    it("does not apply cursor-pointer style when onClick is not provided", () => {
      const task = createMockTask()
      const { onClick, ...handlersWithoutClick } = mockHandlers
      const { container } = render(<TaskCard task={task} {...handlersWithoutClick} />)
      const cardElement = container.firstChild
      expect(cardElement).not.toHaveClass("cursor-pointer")
    })
  })

  describe("Hover Actions (Edit/Delete)", () => {
    // Note: These tests verify hover behavior by simulating mouseEnter/mouseLeave
    // The component uses internal isHovered state which triggers AnimatePresence
    // Buttons contain only icons (Pencil, Trash2), so we query by their SVG class

    const getEditButton = (container: HTMLElement) =>
      container.querySelector("button .lucide-pencil")?.closest("button")

    const getDeleteButton = (container: HTMLElement) =>
      container.querySelector("button .lucide-trash2")?.closest("button") ||
      container.querySelector("button .lucide-trash-2")?.closest("button")

    it("shows edit and delete buttons on hover for incomplete task", () => {
      const task = createMockTask({ isCompleted: false })
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const cardElement = container.firstChild as HTMLElement

      // Simulate mouse enter to trigger hover state
      fireEvent.mouseEnter(cardElement)

      // AnimatePresence is mocked to render children directly
      const editButton = getEditButton(container)
      const deleteButton = getDeleteButton(container)
      expect(editButton).toBeInTheDocument()
      expect(deleteButton).toBeInTheDocument()
    })

    it("does not show action buttons for completed task on hover", () => {
      const task = createMockTask({ isCompleted: true, status: "DONE" })
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const cardElement = container.firstChild as HTMLElement

      fireEvent.mouseEnter(cardElement)

      // Completed tasks should not show edit/delete buttons even when hovered
      expect(getEditButton(container)).toBeFalsy()
      expect(getDeleteButton(container)).toBeFalsy()
    })

    it("hides action buttons on mouse leave", () => {
      const task = createMockTask({ isCompleted: false })
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const cardElement = container.firstChild as HTMLElement

      // First hover to show buttons
      fireEvent.mouseEnter(cardElement)
      expect(getEditButton(container)).toBeInTheDocument()

      // Then leave to hide buttons
      fireEvent.mouseLeave(cardElement)
      expect(getEditButton(container)).toBeFalsy()
    })

    it("calls onEdit with task when edit button is clicked", () => {
      const task = createMockTask()
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const cardElement = container.firstChild as HTMLElement

      fireEvent.mouseEnter(cardElement)
      const editButton = getEditButton(container)
      expect(editButton).toBeInTheDocument()
      fireEvent.click(editButton!)
      expect(mockHandlers.onEdit).toHaveBeenCalledWith(task)
    })

    it("calls onDelete with task id when delete button is clicked", () => {
      const task = createMockTask({ id: "delete-me-123" })
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const cardElement = container.firstChild as HTMLElement

      fireEvent.mouseEnter(cardElement)
      const deleteButton = getDeleteButton(container)
      expect(deleteButton).toBeInTheDocument()
      fireEvent.click(deleteButton!)
      expect(mockHandlers.onDelete).toHaveBeenCalledWith("delete-me-123")
    })

    it("does not trigger card onClick when edit button is clicked", () => {
      const task = createMockTask()
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const cardElement = container.firstChild as HTMLElement

      fireEvent.mouseEnter(cardElement)
      const editButton = getEditButton(container)
      expect(editButton).toBeInTheDocument()
      fireEvent.click(editButton!)
      expect(mockHandlers.onClick).not.toHaveBeenCalled()
    })

    it("does not trigger card onClick when delete button is clicked", () => {
      const task = createMockTask()
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const cardElement = container.firstChild as HTMLElement

      fireEvent.mouseEnter(cardElement)
      const deleteButton = getDeleteButton(container)
      expect(deleteButton).toBeInTheDocument()
      fireEvent.click(deleteButton!)
      expect(mockHandlers.onClick).not.toHaveBeenCalled()
    })
  })

  describe("Drag Handle", () => {
    it("renders drag handle when dragHandleProps are provided", () => {
      const task = createMockTask()
      const dragHandleProps = { "data-testid": "drag-handle" }
      render(
        <TaskCard
          task={task}
          {...mockHandlers}
          dragHandleProps={dragHandleProps}
        />
      )
      expect(screen.getByTestId("drag-handle")).toBeInTheDocument()
    })

    it("does not render drag handle when dragHandleProps are not provided", () => {
      const task = createMockTask()
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.queryByTestId("drag-handle")).not.toBeInTheDocument()
    })

    it("does not trigger card onClick when drag handle is clicked", () => {
      const task = createMockTask()
      const dragHandleProps = { "data-testid": "drag-handle" }
      render(
        <TaskCard
          task={task}
          {...mockHandlers}
          dragHandleProps={dragHandleProps}
        />
      )
      fireEvent.click(screen.getByTestId("drag-handle"))
      expect(mockHandlers.onClick).not.toHaveBeenCalled()
    })
  })

  describe("Dragging State", () => {
    it("applies dragging styles when isDragging is true", () => {
      const task = createMockTask()
      const { container } = render(
        <TaskCard task={task} {...mockHandlers} isDragging={true} />
      )
      const cardElement = container.firstChild
      expect(cardElement).toHaveClass("shadow-2xl")
      expect(cardElement).toHaveClass("border-primary/30")
    })

    it("does not apply dragging styles when isDragging is false", () => {
      const task = createMockTask()
      const { container } = render(
        <TaskCard task={task} {...mockHandlers} isDragging={false} />
      )
      const cardElement = container.firstChild
      expect(cardElement).not.toHaveClass("shadow-2xl")
    })
  })

  describe("Subtask Progress", () => {
    it("renders subtask progress when subtasks exist", () => {
      const task = createMockTask({
        subtasks: [
          createMockSubtask({ id: "1", isCompleted: true }),
          createMockSubtask({ id: "2", isCompleted: false }),
          createMockSubtask({ id: "3", isCompleted: false }),
        ],
      })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText("1/3")).toBeInTheDocument()
    })

    it("does not render subtask progress when subtasks array is empty", () => {
      const task = createMockTask({ subtasks: [] })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.queryByText(/\/\d/)).not.toBeInTheDocument()
    })

    it("does not render subtask progress when subtasks is undefined", () => {
      // TypeScript requires subtasks, but test edge case
      const task = createMockTask()
      // @ts-expect-error - Testing undefined subtasks
      delete task.subtasks
      render(<TaskCard task={{ ...task, subtasks: undefined as unknown as SubTask[] }} {...mockHandlers} />)
      expect(screen.queryByText(/\/\d/)).not.toBeInTheDocument()
    })

    it("renders all completed subtasks correctly", () => {
      const task = createMockTask({
        subtasks: [
          createMockSubtask({ id: "1", isCompleted: true }),
          createMockSubtask({ id: "2", isCompleted: true }),
        ],
      })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText("2/2")).toBeInTheDocument()
    })
  })

  describe("Priority Gradient Accent", () => {
    it.each([
      ["LOW", "from-slate-500/20"],
      ["MEDIUM", "from-blue-500/20"],
      ["HIGH", "from-amber-500/20"],
      ["URGENT", "from-red-500/20"],
    ] as const)("applies %s priority gradient", (priority, expectedClass) => {
      const task = createMockTask({ priority })
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const gradientElement = container.querySelector(`.${expectedClass.replace("/", "\\/")}`)
      expect(gradientElement).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("handles task with all optional fields empty", () => {
      const task = createMockTask({
        description: null,
        dueDate: null,
        tags: [],
        subtasks: [],
      })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText("Test Task")).toBeInTheDocument()
    })

    it("handles task with very long title (truncation handled by CSS)", () => {
      const longTitle = "A".repeat(200)
      const task = createMockTask({ title: longTitle })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it("handles task with very long description (line-clamp handled by CSS)", () => {
      const longDescription = "B".repeat(1000)
      const task = createMockTask({ description: longDescription })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it("handles special characters in title", () => {
      const specialTitle = "<script>alert('xss')</script>"
      const task = createMockTask({ title: specialTitle })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText(specialTitle)).toBeInTheDocument()
    })

    it("handles special characters in tags", () => {
      const task = createMockTask({
        tags: [{ id: 1, name: "tag<with>special&chars" }],
      })
      render(<TaskCard task={task} {...mockHandlers} />)
      expect(screen.getByText("tag<with>special&chars")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("has accessible checkbox with correct aria-checked state", () => {
      const task = createMockTask({ isCompleted: false })
      render(<TaskCard task={task} {...mockHandlers} />)
      const checkbox = screen.getByRole("checkbox")
      expect(checkbox).toHaveAttribute("aria-checked", "false")
    })

    it("has action buttons visible when hovered", () => {
      const task = createMockTask()
      const { container } = render(<TaskCard task={task} {...mockHandlers} />)
      const cardElement = container.firstChild as HTMLElement

      fireEvent.mouseEnter(cardElement)

      // Buttons have icons, find them by their svg class
      const editButton = container.querySelector("button .lucide-pencil")?.closest("button")
      const deleteButton = container.querySelector("button .lucide-trash2")?.closest("button") ||
        container.querySelector("button .lucide-trash-2")?.closest("button")

      expect(editButton).toBeInTheDocument()
      expect(deleteButton).toBeInTheDocument()
    })

    it("checkbox is focusable and clickable", () => {
      const task = createMockTask()
      render(<TaskCard task={task} {...mockHandlers} />)
      const checkbox = screen.getByRole("checkbox")
      expect(checkbox).toHaveAttribute("type", "button")
    })
  })

  describe("Component Memoization Stability", () => {
    it("maintains consistent rendering with same props", () => {
      const task = createMockTask()
      const { rerender } = render(<TaskCard task={task} {...mockHandlers} />)

      // Re-render with same props
      rerender(<TaskCard task={task} {...mockHandlers} />)

      expect(screen.getByText("Test Task")).toBeInTheDocument()
    })

    it("updates correctly when task prop changes", () => {
      const task1 = createMockTask({ title: "Task 1" })
      const task2 = createMockTask({ title: "Task 2" })

      const { rerender } = render(<TaskCard task={task1} {...mockHandlers} />)
      expect(screen.getByText("Task 1")).toBeInTheDocument()

      rerender(<TaskCard task={task2} {...mockHandlers} />)
      expect(screen.getByText("Task 2")).toBeInTheDocument()
      expect(screen.queryByText("Task 1")).not.toBeInTheDocument()
    })
  })
})
