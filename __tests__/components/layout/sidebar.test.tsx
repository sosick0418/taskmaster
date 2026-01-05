import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Sidebar } from "@/components/layout/sidebar"

describe("Sidebar", () => {
  const defaultProps = {
    isCollapsed: false,
    onToggle: vi.fn(),
  }

  it("renders the logo and brand name when expanded", () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText("Task")).toBeInTheDocument()
    expect(screen.getByText("master")).toBeInTheDocument()
  })

  it("hides brand name when collapsed", () => {
    render(<Sidebar {...defaultProps} isCollapsed={true} />)

    // Brand text should not be visible when collapsed
    expect(screen.queryByText("Taskmaster")).not.toBeInTheDocument()
  })

  it("renders all navigation items", () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Tasks")).toBeInTheDocument()
    expect(screen.getByText("Settings")).toBeInTheDocument()
  })

  it("shows collapse button", () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText("Collapse")).toBeInTheDocument()
  })

  it("calls onToggle when collapse button is clicked", () => {
    const onToggle = vi.fn()
    render(<Sidebar {...defaultProps} onToggle={onToggle} />)

    const collapseButton = screen.getByRole("button", { name: /collapse/i })
    fireEvent.click(collapseButton)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it("renders navigation links with correct hrefs", () => {
    render(<Sidebar {...defaultProps} />)

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i })
    const tasksLink = screen.getByRole("link", { name: /tasks/i })
    const settingsLink = screen.getByRole("link", { name: /settings/i })

    expect(dashboardLink).toHaveAttribute("href", "/tasks")
    expect(tasksLink).toHaveAttribute("href", "/tasks")
    expect(settingsLink).toHaveAttribute("href", "/settings")
  })
})
