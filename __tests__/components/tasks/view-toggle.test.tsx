import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ViewToggle } from "@/components/tasks/view-toggle"

describe("ViewToggle", () => {
  const mockOnViewChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders list and board buttons", () => {
    render(<ViewToggle view="list" onViewChange={mockOnViewChange} />)
    expect(screen.getByRole("button", { name: /list/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /board/i })).toBeInTheDocument()
  })

  it("highlights list button when view is list", () => {
    render(<ViewToggle view="list" onViewChange={mockOnViewChange} />)
    const listButton = screen.getByRole("button", { name: /list/i })
    expect(listButton).toHaveClass("bg-violet-500/15", "text-foreground")
  })

  it("highlights board button when view is board", () => {
    render(<ViewToggle view="board" onViewChange={mockOnViewChange} />)
    const boardButton = screen.getByRole("button", { name: /board/i })
    expect(boardButton).toHaveClass("bg-violet-500/15", "text-foreground")
  })

  it("calls onViewChange with list when list button clicked", () => {
    render(<ViewToggle view="board" onViewChange={mockOnViewChange} />)
    fireEvent.click(screen.getByRole("button", { name: /list/i }))
    expect(mockOnViewChange).toHaveBeenCalledWith("list")
  })

  it("calls onViewChange with board when board button clicked", () => {
    render(<ViewToggle view="list" onViewChange={mockOnViewChange} />)
    fireEvent.click(screen.getByRole("button", { name: /board/i }))
    expect(mockOnViewChange).toHaveBeenCalledWith("board")
  })
})
