import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Header } from "@/components/layout/header"

describe("Header", () => {
  const defaultProps = {
    view: "list" as const,
    onViewChange: vi.fn(),
    onSearchOpen: vi.fn(),
  }

  it("renders the search bar", () => {
    render(<Header {...defaultProps} />)

    expect(screen.getByText("Search tasks...")).toBeInTheDocument()
  })

  it("renders keyboard shortcut hint", () => {
    render(<Header {...defaultProps} />)

    expect(screen.getByText("K")).toBeInTheDocument()
  })

  it("calls onSearchOpen when search bar is clicked", () => {
    const onSearchOpen = vi.fn()
    render(<Header {...defaultProps} onSearchOpen={onSearchOpen} />)

    const searchButton = screen.getByRole("button", { name: /search tasks/i })
    fireEvent.click(searchButton)

    expect(onSearchOpen).toHaveBeenCalledTimes(1)
  })

  it("renders view toggle buttons", () => {
    render(<Header {...defaultProps} />)

    expect(screen.getByRole("button", { name: /list view/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /board view/i })).toBeInTheDocument()
  })

  it("highlights list view when view is list", () => {
    render(<Header {...defaultProps} view="list" />)

    const listButton = screen.getByRole("button", { name: /list view/i })
    expect(listButton).toHaveClass("bg-white/[0.1]")
  })

  it("highlights board view when view is board", () => {
    render(<Header {...defaultProps} view="board" />)

    const boardButton = screen.getByRole("button", { name: /board view/i })
    expect(boardButton).toHaveClass("bg-white/[0.1]")
  })

  it("calls onViewChange with 'list' when list button is clicked", () => {
    const onViewChange = vi.fn()
    render(<Header {...defaultProps} view="board" onViewChange={onViewChange} />)

    const listButton = screen.getByRole("button", { name: /list view/i })
    fireEvent.click(listButton)

    expect(onViewChange).toHaveBeenCalledWith("list")
  })

  it("calls onViewChange with 'board' when board button is clicked", () => {
    const onViewChange = vi.fn()
    render(<Header {...defaultProps} view="list" onViewChange={onViewChange} />)

    const boardButton = screen.getByRole("button", { name: /board view/i })
    fireEvent.click(boardButton)

    expect(onViewChange).toHaveBeenCalledWith("board")
  })

  it("renders theme toggle button", () => {
    render(<Header {...defaultProps} />)

    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument()
  })
})
