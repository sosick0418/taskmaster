import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatsOverview } from "@/components/analytics/stats-overview"
import type { ProductivityStats } from "@/types/analytics"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

const mockStats: ProductivityStats = {
  currentStreak: 5,
  longestStreak: 10,
  thisWeekCompleted: 12,
  lastWeekCompleted: 8,
  weekOverWeekChange: 50,
  averageCompletionTime: 24,
  mostProductiveDay: "Monday",
  subtasks: {
    total: 20,
    completed: 15,
    thisWeekCompleted: 8,
  },
}

describe("StatsOverview", () => {
  it("renders all stat cards", () => {
    render(<StatsOverview stats={mockStats} />)
    expect(screen.getByText("This Week")).toBeInTheDocument()
    expect(screen.getByText("Subtasks")).toBeInTheDocument()
    expect(screen.getByText("Current Streak")).toBeInTheDocument()
    expect(screen.getByText("Avg. Completion Time")).toBeInTheDocument()
    expect(screen.getByText("Most Productive")).toBeInTheDocument()
  })

  it("displays this week total (tasks + subtasks)", () => {
    render(<StatsOverview stats={mockStats} />)
    // 12 tasks + 8 subtasks = 20
    expect(screen.getByText("20")).toBeInTheDocument()
  })

  it("displays subtasks progress", () => {
    render(<StatsOverview stats={mockStats} />)
    expect(screen.getByText("15/20")).toBeInTheDocument()
    expect(screen.getByText("75% done")).toBeInTheDocument()
  })

  it("displays current streak", () => {
    render(<StatsOverview stats={mockStats} />)
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("days")).toBeInTheDocument()
  })

  it("displays average completion time", () => {
    render(<StatsOverview stats={mockStats} />)
    expect(screen.getByText("24")).toBeInTheDocument()
    expect(screen.getByText("hours")).toBeInTheDocument()
  })

  it("displays most productive day", () => {
    render(<StatsOverview stats={mockStats} />)
    expect(screen.getByText("Monday")).toBeInTheDocument()
  })

  it("displays positive week over week change", () => {
    render(<StatsOverview stats={mockStats} />)
    expect(screen.getByText("+50%")).toBeInTheDocument()
    expect(screen.getByText("vs last week")).toBeInTheDocument()
  })

  it("displays negative week over week change", () => {
    const negativeStats = { ...mockStats, weekOverWeekChange: -25 }
    render(<StatsOverview stats={negativeStats} />)
    expect(screen.getByText("-25%")).toBeInTheDocument()
  })

  it("handles missing average completion time", () => {
    const noAvgTime = { ...mockStats, averageCompletionTime: null }
    render(<StatsOverview stats={noAvgTime} />)
    const dashElements = screen.getAllByText("-")
    expect(dashElements.length).toBeGreaterThan(0)
  })

  it("handles missing most productive day", () => {
    const noProductiveDay = { ...mockStats, mostProductiveDay: null }
    render(<StatsOverview stats={noProductiveDay} />)
    const dashElements = screen.getAllByText("-")
    expect(dashElements.length).toBeGreaterThan(0)
  })

  it("handles no subtasks", () => {
    const noSubtasks = {
      ...mockStats,
      subtasks: { total: 0, completed: 0, thisWeekCompleted: 0 },
    }
    render(<StatsOverview stats={noSubtasks} />)
    expect(screen.getByText("0/0")).toBeInTheDocument()
    expect(screen.getByText("no subtasks")).toBeInTheDocument()
  })

  it("renders with grid layout", () => {
    const { container } = render(<StatsOverview stats={mockStats} />)
    expect(container.firstChild).toHaveClass("grid")
  })
})
