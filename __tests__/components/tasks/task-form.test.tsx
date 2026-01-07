import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TaskForm } from "@/components/tasks/task-form"

// Mock SubtaskList component since it has complex dependencies
vi.mock("@/components/tasks/subtask-list", () => ({
  SubtaskList: ({ taskId, subtasks }: { taskId: string; subtasks: unknown[] }) => (
    <div data-testid="subtask-list" data-task-id={taskId}>
      {subtasks.length} subtask(s)
    </div>
  ),
}))

describe("TaskForm", () => {
  const mockOnSubmit = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  describe("Form Rendering", () => {
    describe("Create Mode", () => {
      it("renders create form when no task provided", () => {
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )
        // Dialog title in heading
        expect(screen.getByRole("heading", { name: "Create Task" })).toBeInTheDocument()
        expect(screen.getByText("Add a new task to your list.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /create task/i })).toBeInTheDocument()
      })

      it("renders with default form values", () => {
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        // Title should be empty
        const titleInput = screen.getByPlaceholderText("What needs to be done?")
        expect(titleInput).toHaveValue("")

        // Description should be empty
        const descriptionInput = screen.getByPlaceholderText("Add more details...")
        expect(descriptionInput).toHaveValue("")

        // Due date picker should show placeholder
        expect(screen.getByText("Pick a date")).toBeInTheDocument()
      })
    })

    describe("Edit Mode", () => {
      const existingTask = {
        id: "task-1",
        title: "Existing Task",
        description: "Task description",
        priority: "HIGH" as const,
        status: "IN_PROGRESS" as const,
        dueDate: new Date("2025-06-15"),
        tags: [
          { id: 1, name: "work" },
          { id: 2, name: "important" },
        ],
        subtasks: [
          {
            id: "subtask-1",
            title: "Subtask 1",
            isCompleted: false,
            order: 0,
            taskId: "task-1",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }

      it("renders edit form when task provided", () => {
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            task={existingTask}
            onSubmit={mockOnSubmit}
          />
        )
        expect(screen.getByText("Edit Task")).toBeInTheDocument()
        expect(screen.getByText("Update your task details below.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /update task/i })).toBeInTheDocument()
      })

      it("populates form fields when editing", () => {
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            task={existingTask}
            onSubmit={mockOnSubmit}
          />
        )

        expect(screen.getByDisplayValue("Existing Task")).toBeInTheDocument()
        expect(screen.getByDisplayValue("Task description")).toBeInTheDocument()
        expect(screen.getByText("work")).toBeInTheDocument()
        expect(screen.getByText("important")).toBeInTheDocument()
      })

      it("shows subtask list when editing", () => {
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            task={existingTask}
            onSubmit={mockOnSubmit}
          />
        )

        expect(screen.getByText("Subtasks")).toBeInTheDocument()
        expect(screen.getByTestId("subtask-list")).toBeInTheDocument()
        expect(screen.getByText("1 subtask(s)")).toBeInTheDocument()
      })

      it("does not show subtask list when creating new task", () => {
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        expect(screen.queryByText("Subtasks")).not.toBeInTheDocument()
        expect(screen.queryByTestId("subtask-list")).not.toBeInTheDocument()
      })

      it("displays formatted due date when provided", () => {
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            task={existingTask}
            onSubmit={mockOnSubmit}
          />
        )

        // Should display formatted date instead of "Pick a date"
        expect(screen.queryByText("Pick a date")).not.toBeInTheDocument()
        // The date format is "PPP" which is like "June 15th, 2025"
        expect(screen.getByText(/june 15/i)).toBeInTheDocument()
      })

      it("handles task with no subtasks", () => {
        const taskWithoutSubtasks = {
          ...existingTask,
          subtasks: undefined,
        }

        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            task={taskWithoutSubtasks}
            onSubmit={mockOnSubmit}
          />
        )

        expect(screen.getByTestId("subtask-list")).toBeInTheDocument()
        expect(screen.getByText("0 subtask(s)")).toBeInTheDocument()
      })

      it("handles task with null description", () => {
        const taskWithNullDesc = {
          ...existingTask,
          description: null,
        }

        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            task={taskWithNullDesc}
            onSubmit={mockOnSubmit}
          />
        )

        const descriptionInput = screen.getByPlaceholderText("Add more details...")
        expect(descriptionInput).toHaveValue("")
      })
    })

    it("does not render when open is false", () => {
      render(
        <TaskForm
          open={false}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  describe("Form Elements", () => {
    it("renders title input field with required indicator", () => {
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )
      expect(screen.getByPlaceholderText("What needs to be done?")).toBeInTheDocument()
      expect(screen.getByText("*")).toBeInTheDocument()
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

    it("renders priority selector with label", () => {
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )
      expect(screen.getByText("Priority")).toBeInTheDocument()
    })

    it("renders status selector with label", () => {
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
      expect(screen.getByText("Tags")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Add a tag...")).toBeInTheDocument()
    })

    it("renders cancel and submit buttons", () => {
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /create task/i })).toBeInTheDocument()
    })
  })

  describe("Form Validation", () => {
    it("shows validation error when title is empty on submit", async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByRole("button", { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Title is required")).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it("allows valid form submission", async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      const titleInput = screen.getByPlaceholderText("What needs to be done?")
      await user.type(titleInput, "New Task")

      const submitButton = screen.getByRole("button", { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe("User Interactions", () => {
    describe("Cancel Button", () => {
      it("calls onOpenChange with false when clicked", async () => {
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
    })

    describe("Tag Management", () => {
      it("adds a tag when clicking the add button", async () => {
        const user = userEvent.setup()
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        const tagInput = screen.getByPlaceholderText("Add a tag...")
        await user.type(tagInput, "newtag")

        // Find the add tag button - it's the icon button right after the tag input
        // The button is next to the tag input and contains a Plus icon
        const tagInputContainer = tagInput.parentElement
        const addTagButton = tagInputContainer?.querySelector('button[type="button"]')
        expect(addTagButton).toBeTruthy()
        await user.click(addTagButton!)

        await waitFor(() => {
          expect(screen.getByText("newtag")).toBeInTheDocument()
        })
      })

      it("adds a tag when pressing Enter in tag input", async () => {
        const user = userEvent.setup()
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        const tagInput = screen.getByPlaceholderText("Add a tag...")
        await user.type(tagInput, "entertag{enter}")

        expect(screen.getByText("entertag")).toBeInTheDocument()
      })

      it("removes a tag when clicking the X button", async () => {
        const user = userEvent.setup()
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        // Add a tag first
        const tagInput = screen.getByPlaceholderText("Add a tag...")
        await user.type(tagInput, "removeme{enter}")

        expect(screen.getByText("removeme")).toBeInTheDocument()

        // Find and click the remove button within the tag
        const tagElement = screen.getByText("removeme").closest("span")
        const removeButton = tagElement?.querySelector("button")
        expect(removeButton).toBeTruthy()
        await user.click(removeButton!)

        expect(screen.queryByText("removeme")).not.toBeInTheDocument()
      })

      it("does not add empty or whitespace-only tags", async () => {
        const user = userEvent.setup()
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        const tagInput = screen.getByPlaceholderText("Add a tag...")
        await user.type(tagInput, "   {enter}")

        // No tag should be added
        const tagContainer = screen.queryByText(/^   $/)
        expect(tagContainer).not.toBeInTheDocument()
      })

      it("does not add duplicate tags", async () => {
        const user = userEvent.setup()
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        const tagInput = screen.getByPlaceholderText("Add a tag...")

        // Add same tag twice
        await user.type(tagInput, "duplicate{enter}")
        await user.type(tagInput, "duplicate{enter}")

        // Should only have one instance
        const tags = screen.getAllByText("duplicate")
        expect(tags).toHaveLength(1)
      })

      it("clears input after adding a tag", async () => {
        const user = userEvent.setup()
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        const tagInput = screen.getByPlaceholderText("Add a tag...")
        await user.type(tagInput, "cleartag{enter}")

        expect(tagInput).toHaveValue("")
      })
    })

    describe("Priority Selector", () => {
      it("renders priority combobox", () => {
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        // Find the priority trigger (first combobox)
        const comboboxes = screen.getAllByRole("combobox")
        expect(comboboxes.length).toBeGreaterThanOrEqual(2)
        // Priority selector should show default "Medium" value
        expect(comboboxes[0]).toBeInTheDocument()
      })

      it("displays task priority when editing", () => {
        const existingTask = {
          id: "task-1",
          title: "Task",
          description: null,
          priority: "HIGH" as const,
          status: "TODO" as const,
          dueDate: null,
          tags: [],
        }

        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            task={existingTask}
            onSubmit={mockOnSubmit}
          />
        )

        // The priority combobox should show "High"
        const comboboxes = screen.getAllByRole("combobox")
        expect(comboboxes[0]).toHaveTextContent(/high/i)
      })
    })

    describe("Status Selector", () => {
      it("renders status combobox", () => {
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        // Find the status trigger (second combobox)
        const comboboxes = screen.getAllByRole("combobox")
        expect(comboboxes.length).toBeGreaterThanOrEqual(2)
        // Status selector should show default "To Do" value
        expect(comboboxes[1]).toBeInTheDocument()
      })

      it("displays task status when editing", () => {
        const existingTask = {
          id: "task-1",
          title: "Task",
          description: null,
          priority: "MEDIUM" as const,
          status: "IN_PROGRESS" as const,
          dueDate: null,
          tags: [],
        }

        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            task={existingTask}
            onSubmit={mockOnSubmit}
          />
        )

        // The status combobox should show "In Progress"
        const comboboxes = screen.getAllByRole("combobox")
        expect(comboboxes[1]).toHaveTextContent(/in progress/i)
      })
    })

    describe("Due Date Selection", () => {
      it("renders date picker button", () => {
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        const datePickerButton = screen.getByText("Pick a date")
        expect(datePickerButton).toBeInTheDocument()
      })

      it("shows formatted date when task has due date", () => {
        const taskWithDate = {
          id: "task-1",
          title: "Task",
          description: null,
          priority: "MEDIUM" as const,
          status: "TODO" as const,
          dueDate: new Date("2025-07-04"),
          tags: [],
        }

        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            task={taskWithDate}
            onSubmit={mockOnSubmit}
          />
        )

        // Should show the formatted date
        expect(screen.queryByText("Pick a date")).not.toBeInTheDocument()
        expect(screen.getByText(/july 4/i)).toBeInTheDocument()
      })
    })

    describe("Form Input Changes", () => {
      it("updates title value on input", async () => {
        const user = userEvent.setup()
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        const titleInput = screen.getByPlaceholderText("What needs to be done?")
        await user.type(titleInput, "My New Task")

        expect(titleInput).toHaveValue("My New Task")
      })

      it("updates description value on input", async () => {
        const user = userEvent.setup()
        render(
          <TaskForm
            open={true}
            onOpenChange={mockOnOpenChange}
            onSubmit={mockOnSubmit}
          />
        )

        const descriptionInput = screen.getByPlaceholderText("Add more details...")
        await user.type(descriptionInput, "Task details here")

        expect(descriptionInput).toHaveValue("Task details here")
      })
    })
  })

  describe("Form Submission", () => {
    it("submits form with all data in create mode", async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      // Fill in form fields
      const titleInput = screen.getByPlaceholderText("What needs to be done?")
      await user.type(titleInput, "Test Task Title")

      const descriptionInput = screen.getByPlaceholderText("Add more details...")
      await user.type(descriptionInput, "Test description")

      // Add a tag
      const tagInput = screen.getByPlaceholderText("Add a tag...")
      await user.type(tagInput, "testtag{enter}")

      // Submit form
      const submitButton = screen.getByRole("button", { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Test Task Title",
            description: "Test description",
            tags: ["testtag"],
          })
        )
      })
    })

    it("submits form with task id in edit mode", async () => {
      const user = userEvent.setup()
      const existingTask = {
        id: "existing-task-123",
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
          task={existingTask}
          onSubmit={mockOnSubmit}
        />
      )

      // Modify title
      const titleInput = screen.getByPlaceholderText("What needs to be done?")
      await user.clear(titleInput)
      await user.type(titleInput, "Updated Task")

      // Submit form
      const submitButton = screen.getByRole("button", { name: /update task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "existing-task-123",
            title: "Updated Task",
          })
        )
      })
    })

    it("shows loading state while submitting", async () => {
      const user = userEvent.setup()

      // Make onSubmit return a promise that doesn't resolve immediately
      let resolveSubmit: () => void
      mockOnSubmit.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveSubmit = resolve
          })
      )

      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      const titleInput = screen.getByPlaceholderText("What needs to be done?")
      await user.type(titleInput, "Test Task")

      const submitButton = screen.getByRole("button", { name: /create task/i })
      await user.click(submitButton)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/creating\.\.\./i)).toBeInTheDocument()
      })

      // Resolve the promise
      resolveSubmit!()

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it("shows updating state while submitting in edit mode", async () => {
      const user = userEvent.setup()

      let resolveSubmit: () => void
      mockOnSubmit.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveSubmit = resolve
          })
      )

      const existingTask = {
        id: "task-1",
        title: "Existing Task",
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
          task={existingTask}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByRole("button", { name: /update task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/updating\.\.\./i)).toBeInTheDocument()
      })

      resolveSubmit!()
    })

    it("disables submit button while submitting", async () => {
      const user = userEvent.setup()

      let resolveSubmit: () => void
      mockOnSubmit.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveSubmit = resolve
          })
      )

      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      const titleInput = screen.getByPlaceholderText("What needs to be done?")
      await user.type(titleInput, "Test Task")

      const submitButton = screen.getByRole("button", { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        const loadingButton = screen.getByRole("button", { name: /creating/i })
        expect(loadingButton).toBeDisabled()
      })

      resolveSubmit!()
    })

    it("closes dialog after successful submission", async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      const titleInput = screen.getByPlaceholderText("What needs to be done?")
      await user.type(titleInput, "Test Task")

      const submitButton = screen.getByRole("button", { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it("resets form after successful submission", async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      const titleInput = screen.getByPlaceholderText("What needs to be done?")
      await user.type(titleInput, "Test Task")

      // Add a tag
      const tagInput = screen.getByPlaceholderText("Add a tag...")
      await user.type(tagInput, "testtag{enter}")
      expect(screen.getByText("testtag")).toBeInTheDocument()

      const submitButton = screen.getByRole("button", { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })

      // Re-render to simulate dialog reopening
      rerender(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      // Form should be reset (tags cleared)
      expect(screen.queryByText("testtag")).not.toBeInTheDocument()
    })
  })

  describe("Form Reset on Task Change", () => {
    it("resets form when task changes from edit to create", () => {
      const existingTask = {
        id: "task-1",
        title: "Existing Task",
        description: "Description",
        priority: "HIGH" as const,
        status: "IN_PROGRESS" as const,
        dueDate: null,
        tags: [{ id: 1, name: "work" }],
      }

      const { rerender } = render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          task={existingTask}
          onSubmit={mockOnSubmit}
        />
      )

      // Verify edit mode
      expect(screen.getByDisplayValue("Existing Task")).toBeInTheDocument()
      expect(screen.getByText("work")).toBeInTheDocument()

      // Change to create mode
      rerender(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          task={null}
          onSubmit={mockOnSubmit}
        />
      )

      // Form should be reset
      const titleInput = screen.getByPlaceholderText("What needs to be done?")
      expect(titleInput).toHaveValue("")
      expect(screen.queryByText("work")).not.toBeInTheDocument()
    })

    it("updates form when switching between different tasks", () => {
      const task1 = {
        id: "task-1",
        title: "Task One",
        description: "First description",
        priority: "LOW" as const,
        status: "TODO" as const,
        dueDate: null,
        tags: [{ id: 1, name: "tag1" }],
      }

      const task2 = {
        id: "task-2",
        title: "Task Two",
        description: "Second description",
        priority: "URGENT" as const,
        status: "DONE" as const,
        dueDate: null,
        tags: [{ id: 2, name: "tag2" }],
      }

      const { rerender } = render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          task={task1}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByDisplayValue("Task One")).toBeInTheDocument()
      expect(screen.getByText("tag1")).toBeInTheDocument()

      // Switch to task2
      rerender(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          task={task2}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByDisplayValue("Task Two")).toBeInTheDocument()
      expect(screen.queryByText("tag1")).not.toBeInTheDocument()
      expect(screen.getByText("tag2")).toBeInTheDocument()
    })

    it("preserves due date when editing task with date", () => {
      const taskWithDate = {
        id: "task-1",
        title: "Task with Date",
        description: null,
        priority: "MEDIUM" as const,
        status: "TODO" as const,
        dueDate: new Date("2025-12-25"),
        tags: [],
      }

      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          task={taskWithDate}
          onSubmit={mockOnSubmit}
        />
      )

      // Should show the formatted date
      expect(screen.queryByText("Pick a date")).not.toBeInTheDocument()
      expect(screen.getByText(/december 25/i)).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("handles task with empty tags array", () => {
      const taskWithEmptyTags = {
        id: "task-1",
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
          task={taskWithEmptyTags}
          onSubmit={mockOnSubmit}
        />
      )

      // Should render without errors
      expect(screen.getByDisplayValue("Task")).toBeInTheDocument()
    })

    it("handles task with undefined tags", () => {
      const taskWithUndefinedTags = {
        id: "task-1",
        title: "Task",
        description: null,
        priority: "MEDIUM" as const,
        status: "TODO" as const,
        dueDate: null,
        tags: undefined as unknown as { id: number; name: string }[],
      }

      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          task={taskWithUndefinedTags}
          onSubmit={mockOnSubmit}
        />
      )

      // Should render without errors
      expect(screen.getByDisplayValue("Task")).toBeInTheDocument()
    })

    it("handles very long title input", async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      const titleInput = screen.getByPlaceholderText("What needs to be done?")
      const longTitle = "A".repeat(100)
      await user.type(titleInput, longTitle)

      expect(titleInput).toHaveValue(longTitle)
    })

    it("handles multiple rapid tag additions", async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      const tagInput = screen.getByPlaceholderText("Add a tag...")

      // Add multiple tags rapidly
      await user.type(tagInput, "tag1{enter}")
      await user.type(tagInput, "tag2{enter}")
      await user.type(tagInput, "tag3{enter}")

      expect(screen.getByText("tag1")).toBeInTheDocument()
      expect(screen.getByText("tag2")).toBeInTheDocument()
      expect(screen.getByText("tag3")).toBeInTheDocument()
    })

    it("trims whitespace from tag names", async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      const tagInput = screen.getByPlaceholderText("Add a tag...")
      await user.type(tagInput, "  spacey tag  {enter}")

      // Tag should be trimmed
      expect(screen.getByText("spacey tag")).toBeInTheDocument()
    })

    it("displays default priority value", () => {
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      // Priority combobox should show default "Medium" value
      const comboboxes = screen.getAllByRole("combobox")
      expect(comboboxes[0]).toHaveTextContent(/medium/i)
    })

    it("displays default status value", () => {
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      // Status combobox should show default "To Do" value
      const comboboxes = screen.getAllByRole("combobox")
      expect(comboboxes[1]).toHaveTextContent(/to do/i)
    })
  })

  describe("Accessibility", () => {
    it("has proper form structure", () => {
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      // Form should be present
      expect(screen.getByRole("dialog")).toBeInTheDocument()

      // Important inputs should have labels
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it("renders form labels correctly", () => {
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByText("Title")).toBeInTheDocument()
      expect(screen.getByText("Description")).toBeInTheDocument()
      expect(screen.getByText("Priority")).toBeInTheDocument()
      expect(screen.getByText("Status")).toBeInTheDocument()
      expect(screen.getByText("Due Date")).toBeInTheDocument()
      expect(screen.getByText("Tags")).toBeInTheDocument()
    })

    it("displays dialog title and description", () => {
      render(
        <TaskForm
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
        />
      )

      // Dialog title in heading to avoid conflict with button text
      expect(screen.getByRole("heading", { name: "Create Task" })).toBeInTheDocument()
      expect(screen.getByText("Add a new task to your list.")).toBeInTheDocument()
    })
  })
})
