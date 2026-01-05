import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TaskListView } from "@/components/tasks/task-list-view"
import type { Task } from "@/types/task"

// Mock server actions
vi.mock("@/actions/tasks", () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  toggleTaskComplete: vi.fn(),
}))

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Task 1",
    description: "Description 1",
    priority: "HIGH",
    status: "TODO",
    isCompleted: false,
    dueDate: new Date("2025-01-10"),
    order: 0,
    tags: [{ id: 1, name: "work" }],
  },
  {
    id: "2",
    title: "Task 2",
    description: null,
    priority: "LOW",
    status: "DONE",
    isCompleted: true,
    dueDate: null,
    order: 1,
    tags: [],
  },
]

const mockStats = {
  total: 2,
  inProgress: 0,
  completed: 1,
  todo: 1,
}

describe("TaskListView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders welcome message with user name", () => {
    render(
      <TaskListView
        initialTasks={mockTasks}
        stats={mockStats}
        userName="John"
      />
    )
    expect(screen.getByText(/welcome back,/i)).toBeInTheDocument()
    expect(screen.getByText("John")).toBeInTheDocument()
  })

  it("renders fallback when no user name provided", () => {
    render(
      <TaskListView
        initialTasks={mockTasks}
        stats={mockStats}
        userName={undefined}
      />
    )
    expect(screen.getByText("there")).toBeInTheDocument()
  })

  it("renders stats cards", () => {
    render(
      <TaskListView
        initialTasks={mockTasks}
        stats={mockStats}
        userName="John"
      />
    )
    expect(screen.getByText("Total Tasks")).toBeInTheDocument()
    expect(screen.getByText("In Progress")).toBeInTheDocument()
    expect(screen.getByText("Completed")).toBeInTheDocument()
    // Stats values are rendered - check the label exists
    const statLabels = ["Total Tasks", "In Progress", "Completed"]
    statLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it("renders task cards", () => {
    render(
      <TaskListView
        initialTasks={mockTasks}
        stats={mockStats}
        userName="John"
      />
    )
    expect(screen.getByText("Task 1")).toBeInTheDocument()
    expect(screen.getByText("Task 2")).toBeInTheDocument()
  })

  it("renders new task button", () => {
    render(
      <TaskListView
        initialTasks={mockTasks}
        stats={mockStats}
        userName="John"
      />
    )
    expect(screen.getByRole("button", { name: /new task/i })).toBeInTheDocument()
  })

  it("opens task form when new task button is clicked", async () => {
    const user = userEvent.setup()
    render(
      <TaskListView
        initialTasks={mockTasks}
        stats={mockStats}
        userName="John"
      />
    )
    await user.click(screen.getByRole("button", { name: /new task/i }))
    // Check for the form dialog's description text, which is unique to the form
    expect(screen.getByText("Add a new task to your list.")).toBeInTheDocument()
  })

  it("renders empty state when no tasks", () => {
    render(
      <TaskListView
        initialTasks={[]}
        stats={{ total: 0, inProgress: 0, completed: 0, todo: 0 }}
        userName="John"
      />
    )
    expect(screen.getByText("No tasks yet")).toBeInTheDocument()
    expect(screen.getByText("Create your first task to get started")).toBeInTheDocument()
  })

  it("renders create task button in empty state", () => {
    render(
      <TaskListView
        initialTasks={[]}
        stats={{ total: 0, inProgress: 0, completed: 0, todo: 0 }}
        userName="John"
      />
    )
    const createButtons = screen.getAllByRole("button", { name: /create task/i })
    expect(createButtons.length).toBeGreaterThan(0)
  })

  it("renders task descriptions", () => {
    render(
      <TaskListView
        initialTasks={mockTasks}
        stats={mockStats}
        userName="John"
      />
    )
    expect(screen.getByText("Description 1")).toBeInTheDocument()
  })

  it("renders task tags", () => {
    render(
      <TaskListView
        initialTasks={mockTasks}
        stats={mockStats}
        userName="John"
      />
    )
    expect(screen.getByText("work")).toBeInTheDocument()
  })
})
