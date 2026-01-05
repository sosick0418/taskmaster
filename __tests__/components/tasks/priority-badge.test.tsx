import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PriorityBadge } from "@/components/tasks/priority-badge"

describe("PriorityBadge", () => {
  it("renders LOW priority with correct label", () => {
    render(<PriorityBadge priority="LOW" />)
    expect(screen.getByText("Low")).toBeInTheDocument()
  })

  it("renders MEDIUM priority with correct label", () => {
    render(<PriorityBadge priority="MEDIUM" />)
    expect(screen.getByText("Medium")).toBeInTheDocument()
  })

  it("renders HIGH priority with correct label", () => {
    render(<PriorityBadge priority="HIGH" />)
    expect(screen.getByText("High")).toBeInTheDocument()
  })

  it("renders URGENT priority with correct label", () => {
    render(<PriorityBadge priority="URGENT" />)
    expect(screen.getByText("Urgent")).toBeInTheDocument()
  })

  it("applies correct styling classes for each priority", () => {
    const { rerender, container } = render(<PriorityBadge priority="LOW" />)
    expect(container.firstChild).toHaveClass("text-slate-300")

    rerender(<PriorityBadge priority="MEDIUM" />)
    expect(container.firstChild).toHaveClass("text-blue-300")

    rerender(<PriorityBadge priority="HIGH" />)
    expect(container.firstChild).toHaveClass("text-amber-300")

    rerender(<PriorityBadge priority="URGENT" />)
    expect(container.firstChild).toHaveClass("text-red-300")
  })
})
