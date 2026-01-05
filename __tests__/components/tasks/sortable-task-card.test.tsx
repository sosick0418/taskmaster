import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { SortableTaskCard } from "@/components/tasks/sortable-task-card"
import type { Task } from "@/types/task"

// Mock useSortable
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: vi.fn(() => ({
    attributes: { "aria-describedby": "test-id" },
    listeners: { onMouseDown: vi.fn() },
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

const mockTask: Task = {
  id: "1",
  title: "Test Task",
  description: "Test Description",
  priority: "HIGH",
  status: "TODO",
  isCompleted: false,
  dueDate: new Date("2025-01-15"),
  order: 0,
  tags: [{ id: 1, name: "work" }],
}

describe("SortableTaskCard", () => {
  const mockOnToggleComplete = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders task card with title", () => {
    render(
      <SortableTaskCard
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText("Test Task")).toBeInTheDocument()
  })

  it("renders task card with description", () => {
    render(
      <SortableTaskCard
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText("Test Description")).toBeInTheDocument()
  })

  it("renders task card with priority badge", () => {
    render(
      <SortableTaskCard
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    // Priority badge shows "High" label (not "HIGH")
    expect(screen.getByText("High")).toBeInTheDocument()
  })

  it("renders task card with tags", () => {
    render(
      <SortableTaskCard
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText("work")).toBeInTheDocument()
  })

  it("applies sortable wrapper", () => {
    const { container } = render(
      <SortableTaskCard
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    // The component should render with a div wrapper
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement)
  })
})
