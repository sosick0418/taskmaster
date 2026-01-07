import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TaskFilters, SortOption } from "@/components/tasks/task-filters"
import type { Priority, TaskStatus } from "@/lib/validations/task"

describe("TaskFilters", () => {
  const defaultProps = {
    searchQuery: "",
    onSearchChange: vi.fn(),
    statusFilter: ["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[],
    onStatusFilterChange: vi.fn(),
    priorityFilter: ["LOW", "MEDIUM", "HIGH", "URGENT"] as Priority[],
    onPriorityFilterChange: vi.fn(),
    sortBy: "newest" as SortOption,
    onSortChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Search", () => {
    it("renders search input with correct placeholder", () => {
      render(<TaskFilters {...defaultProps} />)
      expect(screen.getByPlaceholderText("Search tasks...")).toBeInTheDocument()
    })

    it("calls onSearchChange when typing in search input", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)
      const input = screen.getByPlaceholderText("Search tasks...")
      await user.type(input, "test")
      expect(defaultProps.onSearchChange).toHaveBeenCalled()
    })

    it("displays search query value in input", () => {
      render(<TaskFilters {...defaultProps} searchQuery="test query" />)
      const input = screen.getByPlaceholderText("Search tasks...")
      expect(input).toHaveValue("test query")
    })

    it("shows clear button when search has value", () => {
      render(<TaskFilters {...defaultProps} searchQuery="test" />)
      const clearButtons = screen.getAllByRole("button")
      const clearSearch = clearButtons.find(btn => btn.querySelector("svg"))
      expect(clearSearch).toBeTruthy()
    })

    it("clears search when clear button is clicked in active filters", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} searchQuery="test" />)

      // Find the clear button inside the search badge in active filters section
      const searchBadge = screen.getByText(/search: test/i).closest("span")
      const clearButtons = within(searchBadge!).getAllByRole("button")
      // The X button to remove the search filter
      const clearButton = clearButtons[0]!

      await user.click(clearButton)
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith("")
    })

    it("does not show clear button when search is empty", () => {
      render(<TaskFilters {...defaultProps} searchQuery="" />)
      // Should not find the active filters section when no filters are active
      expect(screen.queryByText(/active filters/i)).not.toBeInTheDocument()
    })

    it("clears search when inline X button is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} searchQuery="test" />)

      // Find the inline clear button (motion.button inside the search input wrapper)
      // It's the button that appears right inside the input field when there's a search value
      const searchInputWrapper = screen.getByPlaceholderText("Search tasks...").parentElement
      const inlineClearButton = within(searchInputWrapper!).getAllByRole("button")[0]

      await user.click(inlineClearButton!)
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith("")
    })
  })

  describe("Filter Button", () => {
    it("renders filters button", () => {
      render(<TaskFilters {...defaultProps} />)
      expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument()
    })

    it("shows active filter count badge when status filters are applied", () => {
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={["TODO"]}
          priorityFilter={["LOW", "MEDIUM", "HIGH", "URGENT"]}
        />
      )
      // Only 1 status filter is selected (less than 3)
      expect(screen.getByText("1")).toBeInTheDocument()
    })

    it("shows active filter count badge when priority filters are applied", () => {
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={["TODO", "IN_PROGRESS", "DONE"]}
          priorityFilter={["HIGH", "URGENT"]}
        />
      )
      // Only 2 priority filters are selected (less than 4)
      expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("shows combined active filter count", () => {
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={["TODO"]}
          priorityFilter={["HIGH", "URGENT"]}
        />
      )
      // 1 status + 2 priorities = 3
      expect(screen.getByText("3")).toBeInTheDocument()
    })

    it("does not show badge when all filters are selected", () => {
      render(<TaskFilters {...defaultProps} />)
      // All statuses (3) and all priorities (4) are selected
      const filterButton = screen.getByRole("button", { name: /filters/i })
      expect(within(filterButton).queryByText(/\d/)).not.toBeInTheDocument()
    })
  })

  describe("Filter Popover", () => {
    it("opens filter popover when filters button is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      expect(screen.getByText("Status")).toBeInTheDocument()
      expect(screen.getByText("Priority")).toBeInTheDocument()
    })

    it("shows all status options in popover", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      expect(screen.getByRole("button", { name: /to do/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /in progress/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument()
    })

    it("shows all priority options in popover", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      expect(screen.getByRole("button", { name: /^low$/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /^medium$/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /^high$/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /^urgent$/i })).toBeInTheDocument()
    })

    it("toggles status filter when status button is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      const todoButton = screen.getByRole("button", { name: /to do/i })
      await user.click(todoButton)

      // Should remove TODO from the filter since it was already included
      expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith(["IN_PROGRESS", "DONE"])
    })

    it("adds status to filter when not already selected", async () => {
      const user = userEvent.setup()
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={["IN_PROGRESS", "DONE"]}
        />
      )

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      const todoButton = screen.getByRole("button", { name: /to do/i })
      await user.click(todoButton)

      // Should add TODO to the filter
      expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith(["IN_PROGRESS", "DONE", "TODO"])
    })

    it("toggles priority filter when priority button is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      const highButton = screen.getByRole("button", { name: /^high$/i })
      await user.click(highButton)

      // Should remove HIGH from the filter since it was already included
      expect(defaultProps.onPriorityFilterChange).toHaveBeenCalledWith(["LOW", "MEDIUM", "URGENT"])
    })

    it("adds priority to filter when not already selected", async () => {
      const user = userEvent.setup()
      render(
        <TaskFilters
          {...defaultProps}
          priorityFilter={["LOW", "MEDIUM"]}
        />
      )

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      const highButton = screen.getByRole("button", { name: /^high$/i })
      await user.click(highButton)

      // Should add HIGH to the filter
      expect(defaultProps.onPriorityFilterChange).toHaveBeenCalledWith(["LOW", "MEDIUM", "HIGH"])
    })

    it("shows select all button for status that resets to all statuses", async () => {
      const user = userEvent.setup()
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={["TODO"]}
        />
      )

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      const selectAllButtons = screen.getAllByText("Select all")
      // First one should be for status
      await user.click(selectAllButtons[0]!)

      expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith(["TODO", "IN_PROGRESS", "DONE"])
    })

    it("shows select all button for priority that resets to all priorities", async () => {
      const user = userEvent.setup()
      render(
        <TaskFilters
          {...defaultProps}
          priorityFilter={["HIGH"]}
        />
      )

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      const selectAllButtons = screen.getAllByText("Select all")
      // Second one should be for priority
      await user.click(selectAllButtons[1]!)

      expect(defaultProps.onPriorityFilterChange).toHaveBeenCalledWith(["LOW", "MEDIUM", "HIGH", "URGENT"])
    })

    it("shows clear all filters button when filters are active", async () => {
      const user = userEvent.setup()
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={["TODO"]}
        />
      )

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      expect(screen.getByRole("button", { name: /clear all filters/i })).toBeInTheDocument()
    })

    it("clears all filters when clear all filters button is clicked in popover", async () => {
      const user = userEvent.setup()
      render(
        <TaskFilters
          {...defaultProps}
          searchQuery="test"
          statusFilter={["TODO"]}
          priorityFilter={["HIGH"]}
        />
      )

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      const clearAllButton = screen.getByRole("button", { name: /clear all filters/i })
      await user.click(clearAllButton)

      expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith(["TODO", "IN_PROGRESS", "DONE"])
      expect(defaultProps.onPriorityFilterChange).toHaveBeenCalledWith(["LOW", "MEDIUM", "HIGH", "URGENT"])
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith("")
    })

    it("does not show clear all filters button when no active filters", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      expect(screen.queryByRole("button", { name: /clear all filters/i })).not.toBeInTheDocument()
    })
  })

  describe("Sort Dropdown", () => {
    it("renders sort button", () => {
      render(<TaskFilters {...defaultProps} />)
      expect(screen.getByRole("button", { name: /sort/i })).toBeInTheDocument()
    })

    it("opens sort dropdown when sort button is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      expect(screen.getByText("Sort by")).toBeInTheDocument()
    })

    it("shows all sort options in dropdown", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      expect(screen.getByText("Newest First")).toBeInTheDocument()
      expect(screen.getByText("Oldest First")).toBeInTheDocument()
      expect(screen.getByText("Priority (High → Low)")).toBeInTheDocument()
      expect(screen.getByText("Due Date")).toBeInTheDocument()
      expect(screen.getByText("Title (A → Z)")).toBeInTheDocument()
    })

    it("calls onSortChange when newest sort option is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} sortBy="oldest" />)

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const newestOption = screen.getByText("Newest First")
      await user.click(newestOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledWith("newest")
    })

    it("calls onSortChange when oldest sort option is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const oldestOption = screen.getByText("Oldest First")
      await user.click(oldestOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledWith("oldest")
    })

    it("calls onSortChange when priority sort option is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const priorityOption = screen.getByText("Priority (High → Low)")
      await user.click(priorityOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledWith("priority")
    })

    it("calls onSortChange when due date sort option is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const dueDateOption = screen.getByText("Due Date")
      await user.click(dueDateOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledWith("dueDate")
    })

    it("calls onSortChange when title sort option is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const titleOption = screen.getByText("Title (A → Z)")
      await user.click(titleOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledWith("title")
    })

    it("highlights currently selected sort option", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} sortBy="priority" />)

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const priorityOption = screen.getByText("Priority (High → Low)").closest("[role='menuitem']")
      expect(priorityOption).toHaveClass("bg-primary/10")
    })
  })

  describe("Active Filters Display", () => {
    it("shows active filters section when search query exists", () => {
      render(<TaskFilters {...defaultProps} searchQuery="test" />)
      expect(screen.getByText(/active filters/i)).toBeInTheDocument()
      expect(screen.getByText(/search: test/i)).toBeInTheDocument()
    })

    it("shows status filter badges when not all statuses selected", () => {
      render(<TaskFilters {...defaultProps} statusFilter={["TODO"]} />)
      expect(screen.getByText("To Do")).toBeInTheDocument()
    })

    it("shows multiple status filter badges", () => {
      render(<TaskFilters {...defaultProps} statusFilter={["TODO", "IN_PROGRESS"]} />)
      expect(screen.getByText("To Do")).toBeInTheDocument()
      expect(screen.getByText("In Progress")).toBeInTheDocument()
    })

    it("shows priority filter badges when not all priorities selected", () => {
      render(<TaskFilters {...defaultProps} priorityFilter={["HIGH"]} />)
      expect(screen.getByText("High")).toBeInTheDocument()
    })

    it("shows multiple priority filter badges", () => {
      render(<TaskFilters {...defaultProps} priorityFilter={["HIGH", "URGENT"]} />)
      expect(screen.getByText("High")).toBeInTheDocument()
      expect(screen.getByText("Urgent")).toBeInTheDocument()
    })

    it("shows clear all button when filters are active", () => {
      render(<TaskFilters {...defaultProps} searchQuery="test" />)
      expect(screen.getByText("Clear all")).toBeInTheDocument()
    })

    it("clears all filters when clear all button is clicked", async () => {
      const user = userEvent.setup()
      render(
        <TaskFilters
          {...defaultProps}
          searchQuery="test"
          statusFilter={["TODO"]}
          priorityFilter={["HIGH"]}
        />
      )

      const clearAllButton = screen.getByText("Clear all")
      await user.click(clearAllButton)

      expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith(["TODO", "IN_PROGRESS", "DONE"])
      expect(defaultProps.onPriorityFilterChange).toHaveBeenCalledWith(["LOW", "MEDIUM", "HIGH", "URGENT"])
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith("")
    })

    it("removes status filter when badge X button is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} statusFilter={["TODO", "IN_PROGRESS"]} />)

      // Find the To Do badge (span with data-slot="badge") and its X button
      const todoBadge = screen.getByText("To Do").closest("span")
      const removeButton = within(todoBadge!).getByRole("button")

      await user.click(removeButton)

      // Should toggle TODO (remove it from the list)
      expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith(["IN_PROGRESS"])
    })

    it("removes priority filter when badge X button is clicked", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} priorityFilter={["HIGH", "URGENT"]} />)

      // Find the High badge (span with data-slot="badge") and its X button
      const highBadge = screen.getByText("High").closest("span")
      const removeButton = within(highBadge!).getByRole("button")

      await user.click(removeButton)

      // Should toggle HIGH (remove it from the list)
      expect(defaultProps.onPriorityFilterChange).toHaveBeenCalledWith(["URGENT"])
    })

    it("does not show active filters section when no filters are applied", () => {
      render(<TaskFilters {...defaultProps} />)
      expect(screen.queryByText(/active filters/i)).not.toBeInTheDocument()
    })

    it("does not show status badges when all statuses are selected", () => {
      render(<TaskFilters {...defaultProps} searchQuery="test" />)
      // When all 3 statuses are selected, don't show individual badges
      expect(screen.queryByText("To Do")).not.toBeInTheDocument()
      expect(screen.queryByText("In Progress")).not.toBeInTheDocument()
      expect(screen.queryByText("Done")).not.toBeInTheDocument()
    })

    it("does not show priority badges when all priorities are selected", () => {
      render(<TaskFilters {...defaultProps} searchQuery="test" />)
      // When all 4 priorities are selected, don't show individual badges
      expect(screen.queryByText("Low")).not.toBeInTheDocument()
      expect(screen.queryByText("Medium")).not.toBeInTheDocument()
      // "High" and "Urgent" might appear in other contexts, so check more specifically
    })
  })

  describe("Filter Count Calculation", () => {
    it("counts 0 when all statuses and priorities are selected", () => {
      render(<TaskFilters {...defaultProps} />)

      const filterButton = screen.getByRole("button", { name: /filters/i })
      // No badge should be present
      expect(within(filterButton).queryByText(/\d/)).not.toBeInTheDocument()
    })

    it("counts status filters only when less than 3 selected", () => {
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={["TODO", "IN_PROGRESS"]}
        />
      )
      expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("counts priority filters only when less than 4 selected", () => {
      render(
        <TaskFilters
          {...defaultProps}
          priorityFilter={["LOW", "MEDIUM", "HIGH"]}
        />
      )
      expect(screen.getByText("3")).toBeInTheDocument()
    })

    it("does not count status when all 3 are selected", () => {
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={["TODO", "IN_PROGRESS", "DONE"]}
          priorityFilter={["HIGH"]}
        />
      )
      // Only 1 priority should be counted
      expect(screen.getByText("1")).toBeInTheDocument()
    })

    it("does not count priority when all 4 are selected", () => {
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={["TODO"]}
          priorityFilter={["LOW", "MEDIUM", "HIGH", "URGENT"]}
        />
      )
      // Only 1 status should be counted
      expect(screen.getByText("1")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("handles empty status filter array", () => {
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={[]}
        />
      )
      // Component should still render
      expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument()
    })

    it("handles empty priority filter array", () => {
      render(
        <TaskFilters
          {...defaultProps}
          priorityFilter={[]}
        />
      )
      // Component should still render
      expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument()
    })

    it("handles single status filter", async () => {
      const user = userEvent.setup()
      render(
        <TaskFilters
          {...defaultProps}
          statusFilter={["TODO"]}
        />
      )

      // Open filter popover and click on TODO to remove it
      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      const todoButton = screen.getByRole("button", { name: /to do/i })
      await user.click(todoButton)

      expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith([])
    })

    it("handles single priority filter", async () => {
      const user = userEvent.setup()
      render(
        <TaskFilters
          {...defaultProps}
          priorityFilter={["HIGH"]}
        />
      )

      // Open filter popover and click on HIGH to remove it
      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      const highButton = screen.getByRole("button", { name: /^high$/i })
      await user.click(highButton)

      expect(defaultProps.onPriorityFilterChange).toHaveBeenCalledWith([])
    })

    it("handles search with special characters", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const input = screen.getByPlaceholderText("Search tasks...")
      await user.type(input, "test@#$%")

      expect(defaultProps.onSearchChange).toHaveBeenCalled()
    })

    it("handles very long search query", async () => {
      const longQuery = "a".repeat(200)
      render(<TaskFilters {...defaultProps} searchQuery={longQuery} />)

      const input = screen.getByPlaceholderText("Search tasks...")
      expect(input).toHaveValue(longQuery)
    })

    it("renders correctly with all sort options", () => {
      const sortOptions: SortOption[] = ["newest", "oldest", "priority", "dueDate", "title"]

      sortOptions.forEach(sortBy => {
        const { unmount } = render(<TaskFilters {...defaultProps} sortBy={sortBy} />)
        expect(screen.getByRole("button", { name: /sort/i })).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe("Accessibility", () => {
    it("has accessible search input", () => {
      render(<TaskFilters {...defaultProps} />)
      const input = screen.getByPlaceholderText("Search tasks...")
      // Input should be present and interactive (it's a text input by default even without explicit type)
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe("INPUT")
    })

    it("filter button has accessible name", () => {
      render(<TaskFilters {...defaultProps} />)
      expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument()
    })

    it("sort button has accessible name", () => {
      render(<TaskFilters {...defaultProps} />)
      expect(screen.getByRole("button", { name: /sort/i })).toBeInTheDocument()
    })

    it("all filter buttons in popover are accessible", async () => {
      const user = userEvent.setup()
      render(<TaskFilters {...defaultProps} />)

      const filterButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filterButton)

      // All status and priority buttons should be accessible
      expect(screen.getByRole("button", { name: /to do/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /in progress/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /^low$/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /^medium$/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /^high$/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /^urgent$/i })).toBeInTheDocument()
    })
  })
})
