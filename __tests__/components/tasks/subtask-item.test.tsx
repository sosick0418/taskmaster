import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { SubtaskItem } from "@/components/tasks/subtask-item"
import type { SubTask } from "@/types/task"

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

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

const mockSubtask: SubTask = {
  id: "subtask-1",
  title: "Test Subtask",
  isCompleted: false,
  order: 0,
  taskId: "task-1",
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockHandlers = {
  onToggleComplete: vi.fn(),
  onDelete: vi.fn(),
  onUpdate: vi.fn(),
}

describe("SubtaskItem", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders subtask title", () => {
    render(<SubtaskItem subtask={mockSubtask} {...mockHandlers} />)
    expect(screen.getByText("Test Subtask")).toBeInTheDocument()
  })

  it("renders checkbox unchecked for incomplete subtask", () => {
    render(<SubtaskItem subtask={mockSubtask} {...mockHandlers} />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).toHaveAttribute("aria-checked", "false")
  })

  it("renders checkbox checked for completed subtask", () => {
    const completedSubtask = { ...mockSubtask, isCompleted: true }
    render(<SubtaskItem subtask={completedSubtask} {...mockHandlers} />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).toHaveAttribute("aria-checked", "true")
  })

  it("calls onToggleComplete when checkbox is clicked", () => {
    render(<SubtaskItem subtask={mockSubtask} {...mockHandlers} />)
    const checkbox = screen.getByRole("checkbox")
    fireEvent.click(checkbox)
    expect(mockHandlers.onToggleComplete).toHaveBeenCalledWith("subtask-1")
  })

  it("applies line-through style to completed subtask title", () => {
    const completedSubtask = { ...mockSubtask, isCompleted: true }
    render(<SubtaskItem subtask={completedSubtask} {...mockHandlers} />)
    const title = screen.getByText("Test Subtask")
    expect(title).toHaveClass("line-through")
  })

  it("does not apply line-through style to incomplete subtask title", () => {
    render(<SubtaskItem subtask={mockSubtask} {...mockHandlers} />)
    const title = screen.getByText("Test Subtask")
    expect(title).not.toHaveClass("line-through")
  })

  it("enters edit mode on double click for incomplete subtask", () => {
    render(<SubtaskItem subtask={mockSubtask} {...mockHandlers} />)
    const title = screen.getByText("Test Subtask")
    fireEvent.doubleClick(title)
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("does not enter edit mode on double click for completed subtask", () => {
    const completedSubtask = { ...mockSubtask, isCompleted: true }
    render(<SubtaskItem subtask={completedSubtask} {...mockHandlers} />)
    const title = screen.getByText("Test Subtask")
    fireEvent.doubleClick(title)
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })

  it("saves edit on Enter key", () => {
    render(<SubtaskItem subtask={mockSubtask} {...mockHandlers} />)
    const title = screen.getByText("Test Subtask")
    fireEvent.doubleClick(title)

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "Updated Title" } })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith("subtask-1", "Updated Title")
  })

  it("cancels edit on Escape key", () => {
    render(<SubtaskItem subtask={mockSubtask} {...mockHandlers} />)
    const title = screen.getByText("Test Subtask")
    fireEvent.doubleClick(title)

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "Updated Title" } })
    fireEvent.keyDown(input, { key: "Escape" })

    expect(mockHandlers.onUpdate).not.toHaveBeenCalled()
    expect(screen.getByText("Test Subtask")).toBeInTheDocument()
  })

  it("does not call onUpdate if title is unchanged", () => {
    render(<SubtaskItem subtask={mockSubtask} {...mockHandlers} />)
    const title = screen.getByText("Test Subtask")
    fireEvent.doubleClick(title)

    const input = screen.getByRole("textbox")
    fireEvent.keyDown(input, { key: "Enter" })

    expect(mockHandlers.onUpdate).not.toHaveBeenCalled()
  })

  it("does not call onUpdate if title is empty", () => {
    render(<SubtaskItem subtask={mockSubtask} {...mockHandlers} />)
    const title = screen.getByText("Test Subtask")
    fireEvent.doubleClick(title)

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "   " } })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(mockHandlers.onUpdate).not.toHaveBeenCalled()
  })

  it("applies dragging styles when isDragging is true", () => {
    const { container } = render(
      <SubtaskItem subtask={mockSubtask} {...mockHandlers} isDragging={true} />
    )
    const item = container.firstChild as HTMLElement
    expect(item).toHaveClass("bg-muted")
  })

  it("renders drag handle when dragHandleProps provided", () => {
    render(
      <SubtaskItem
        subtask={mockSubtask}
        {...mockHandlers}
        dragHandleProps={{ "data-testid": "drag-handle" }}
      />
    )
    expect(screen.getByTestId("drag-handle")).toBeInTheDocument()
  })
})
