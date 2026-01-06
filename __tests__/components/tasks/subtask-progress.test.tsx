import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { SubtaskProgress } from "@/components/tasks/subtask-progress"
import type { SubTask } from "@/types/task"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

const createSubtask = (id: string, isCompleted: boolean): SubTask => ({
  id,
  title: `Subtask ${id}`,
  isCompleted,
  order: 0,
  taskId: "task-1",
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe("SubtaskProgress", () => {
  it("returns null when subtasks array is empty", () => {
    const { container } = render(<SubtaskProgress subtasks={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders progress text correctly", () => {
    const subtasks = [
      createSubtask("1", true),
      createSubtask("2", false),
      createSubtask("3", false),
    ]
    render(<SubtaskProgress subtasks={subtasks} />)
    expect(screen.getByText("1/3")).toBeInTheDocument()
  })

  it("shows all completed status correctly", () => {
    const subtasks = [
      createSubtask("1", true),
      createSubtask("2", true),
    ]
    render(<SubtaskProgress subtasks={subtasks} />)
    expect(screen.getByText("2/2")).toBeInTheDocument()
  })

  it("shows zero completed status correctly", () => {
    const subtasks = [
      createSubtask("1", false),
      createSubtask("2", false),
    ]
    render(<SubtaskProgress subtasks={subtasks} />)
    expect(screen.getByText("0/2")).toBeInTheDocument()
  })

  it("applies emerald color class when all completed", () => {
    const subtasks = [
      createSubtask("1", true),
      createSubtask("2", true),
    ]
    const { container } = render(<SubtaskProgress subtasks={subtasks} />)
    expect(container.firstChild).toHaveClass("text-emerald-500")
  })

  it("applies muted foreground class when not all completed", () => {
    const subtasks = [
      createSubtask("1", true),
      createSubtask("2", false),
    ]
    const { container } = render(<SubtaskProgress subtasks={subtasks} />)
    expect(container.firstChild).toHaveClass("text-muted-foreground")
  })

  it("hides icon when showIcon is false", () => {
    const subtasks = [createSubtask("1", false)]
    const { container } = render(<SubtaskProgress subtasks={subtasks} showIcon={false} />)
    // Should only have text and progress bar, no icon
    const svgs = container.querySelectorAll("svg")
    expect(svgs.length).toBe(0)
  })

  it("applies sm size classes by default", () => {
    const subtasks = [createSubtask("1", false)]
    const { container } = render(<SubtaskProgress subtasks={subtasks} />)
    expect(container.firstChild).toHaveClass("gap-1.5", "text-xs")
  })

  it("applies md size classes when size is md", () => {
    const subtasks = [createSubtask("1", false)]
    const { container } = render(<SubtaskProgress subtasks={subtasks} size="md" />)
    expect(container.firstChild).toHaveClass("gap-2", "text-sm")
  })

  it("applies custom className", () => {
    const subtasks = [createSubtask("1", false)]
    const { container } = render(<SubtaskProgress subtasks={subtasks} className="custom-class" />)
    expect(container.firstChild).toHaveClass("custom-class")
  })

  it("renders progress bar", () => {
    const subtasks = [
      createSubtask("1", true),
      createSubtask("2", false),
    ]
    const { container } = render(<SubtaskProgress subtasks={subtasks} />)
    // Check for progress bar container
    const progressBar = container.querySelector(".rounded-full.bg-muted")
    expect(progressBar).toBeInTheDocument()
  })
})
