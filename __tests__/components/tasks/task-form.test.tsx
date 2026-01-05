import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TaskForm } from "@/components/tasks/task-form"

describe("TaskForm", () => {
  const mockOnSubmit = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders create form when no task provided", () => {
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    // Check for the dialog description which is unique
    expect(screen.getByText("Add a new task to your list.")).toBeInTheDocument()
    // Check for create button
    expect(screen.getByRole("button", { name: /create task/i })).toBeInTheDocument()
  })

  it("renders edit form when task provided", () => {
    const task = {
      id: "1",
      title: "Existing Task",
      description: "Description",
      priority: "HIGH" as const,
      status: "TODO" as const,
      dueDate: null,
      tags: [],
    }
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        task={task}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.getByText("Edit Task")).toBeInTheDocument()
    expect(screen.getByText("Update your task details below.")).toBeInTheDocument()
  })

  it("populates form fields when editing", () => {
    const task = {
      id: "1",
      title: "Existing Task",
      description: "Test description",
      priority: "HIGH" as const,
      status: "IN_PROGRESS" as const,
      dueDate: null,
      tags: [{ id: 1, name: "work" }],
    }
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        task={task}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.getByDisplayValue("Existing Task")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Test description")).toBeInTheDocument()
    expect(screen.getByText("work")).toBeInTheDocument()
  })

  it("renders title input field", () => {
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.getByPlaceholderText("What needs to be done?")).toBeInTheDocument()
  })

  it("renders description textarea", () => {
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.getByPlaceholderText("Add more details...")).toBeInTheDocument()
  })

  it("renders priority selector", () => {
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.getByText("Priority")).toBeInTheDocument()
  })

  it("renders status selector", () => {
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.getByText("Status")).toBeInTheDocument()
  })

  it("renders due date picker", () => {
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.getByText("Due Date")).toBeInTheDocument()
    expect(screen.getByText("Pick a date")).toBeInTheDocument()
  })

  it("renders tag input", () => {
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.getByPlaceholderText("Add a tag...")).toBeInTheDocument()
  })

  it("renders cancel button that calls onOpenChange", async () => {
    const user = userEvent.setup()
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    const cancelButton = screen.getByRole("button", { name: "Cancel" })
    await user.click(cancelButton)
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it("renders submit button with correct text for create", () => {
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.getByRole("button", { name: /create task/i })).toBeInTheDocument()
  })

  it("renders submit button with correct text for edit", () => {
    const task = {
      id: "1",
      title: "Task",
      description: null,
      priority: "MEDIUM" as const,
      status: "TODO" as const,
      dueDate: null,
      tags: [],
    }
    render(
      <TaskForm
        open={true}
        onOpenChange={mockOnOpenChange}
        task={task}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.getByRole("button", { name: /update task/i })).toBeInTheDocument()
  })

  it("does not render when open is false", () => {
    render(
      <TaskForm
        open={false}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.queryByText("Create Task")).not.toBeInTheDocument()
  })
})
