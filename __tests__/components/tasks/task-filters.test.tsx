import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TaskFilters } from "@/components/tasks/task-filters"

describe("TaskFilters", () => {
  const defaultProps = {
    searchQuery: "",
    onSearchChange: vi.fn(),
    statusFilter: ["TODO", "IN_PROGRESS", "DONE"] as const,
    onStatusFilterChange: vi.fn(),
    priorityFilter: ["LOW", "MEDIUM", "HIGH", "URGENT"] as const,
    onPriorityFilterChange: vi.fn(),
    sortBy: "newest" as const,
    onSortChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Search", () => {
    it("renders search input", () => {
      render(<TaskFilters {...defaultProps} />)
      expect(screen.getByPlaceholderText("Search tasks...")).toBeInTheDocument()
    })

    it("calls onSearchChange when typing", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)
      const input = screen.getByPlaceholderText("Search tasks...")
      await user.type(input, "test")
      expect(defaultProps.onSearchChange).toHaveBeenCalled()
    })

    it("displays search query value", () => {
      render(<TaskFilters {...defaultProps} searchQuery="test query" />)
      const input = screen.getByPlaceholderText("Search tasks...")
      expect(input).toHaveValue("test query")
    })

    it("shows clear button when search has value", () => {
      render(<TaskFilters {...defaultProps} searchQuery="test" />)
      // The X button for clearing search
      const clearButtons = screen.getAllByRole("button")
      const clearSearch = clearButtons.find(btn => btn.querySelector("svg"))
      expect(clearSearch).toBeTruthy()
    })
  })

  describe("Filter Button", () => {
    it("renders filters button", () => {
      render(<TaskFilters {...defaultProps} />)
      expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument()
    })

    it("shows active filter count badge when filters are applied", () => {
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={["TODO"]}
          priorityFilter={["HIGH", "URGENT"]}
        />
      )
      // Filter count: 1 status + 2 priorities = 3
      expect(screen.getByText("3")).toBeInTheDocument()
    })
  })

  describe("Sort", () => {
    it("renders sort button", () => {
      render(<TaskFilters {...defaultProps} />)
      expect(screen.getByRole("button", { name: /sort/i })).toBeInTheDocument()
    })
  })

  describe("Active Filters Display", () => {
    it("shows active filters when search query exists", () => {
      render(<TaskFilters {...defaultProps} searchQuery="test" />)
      expect(screen.getByText(/active filters/i)).toBeInTheDocument()
      expect(screen.getByText(/search: test/i)).toBeInTheDocument()
    })

    it("shows status filter badges when not all selected", () => {
      render(<TaskFilters {...defaultProps} statusFilter={["TODO"]} />)
      expect(screen.getByText("To Do")).toBeInTheDocument()
    })

    it("shows priority filter badges when not all selected", () => {
      render(<TaskFilters {...defaultProps} priorityFilter={["HIGH"]} />)
      expect(screen.getByText("High")).toBeInTheDocument()
    })

    it("shows clear all button when filters are active", () => {
      render(<TaskFilters {...defaultProps} searchQuery="test" />)
      expect(screen.getByText("Clear all")).toBeInTheDocument()
    })
  })
})
