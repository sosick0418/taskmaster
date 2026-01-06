import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CompletionChart } from "@/components/analytics/completion-chart"
import type { DailyStats, WeeklyStats, MonthlyStats } from "@/types/analytics"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock recharts
vi.mock("recharts", () => ({
  LineChart: ({ children }: React.PropsWithChildren) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: React.PropsWithChildren) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Legend: () => <div data-testid="legend" />,
}))

const mockDaily: DailyStats[] = [
  { date: "Jan 1", completed: 5, created: 3 },
  { date: "Jan 2", completed: 7, created: 4 },
  { date: "Jan 3", completed: 3, created: 6 },
]

const mockWeekly: WeeklyStats[] = [
  { week: "Week 1", completed: 25, created: 20, completionRate: 80 },
  { week: "Week 2", completed: 30, created: 28, completionRate: 85 },
]

const mockMonthly: MonthlyStats[] = [
  { month: "Jan", completed: 100, created: 90, completionRate: 90 },
  { month: "Feb", completed: 120, created: 110, completionRate: 92 },
]

describe("CompletionChart", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders chart title", () => {
    render(<CompletionChart daily={mockDaily} weekly={mockWeekly} monthly={mockMonthly} />)
    expect(screen.getByText("Task Activity")).toBeInTheDocument()
  })

  it("renders chart subtitle", () => {
    render(<CompletionChart daily={mockDaily} weekly={mockWeekly} monthly={mockMonthly} />)
    expect(screen.getByText("Created vs Completed")).toBeInTheDocument()
  })

  it("renders time range buttons", () => {
    render(<CompletionChart daily={mockDaily} weekly={mockWeekly} monthly={mockMonthly} />)
    expect(screen.getByText("Daily")).toBeInTheDocument()
    expect(screen.getByText("Weekly")).toBeInTheDocument()
    expect(screen.getByText("Monthly")).toBeInTheDocument()
  })

  it("starts with Daily as default time range", () => {
    render(<CompletionChart daily={mockDaily} weekly={mockWeekly} monthly={mockMonthly} />)
    const dailyButton = screen.getByText("Daily")
    expect(dailyButton).toHaveClass("bg-background")
  })

  it("changes time range when Weekly is clicked", () => {
    render(<CompletionChart daily={mockDaily} weekly={mockWeekly} monthly={mockMonthly} />)
    const weeklyButton = screen.getByText("Weekly")
    fireEvent.click(weeklyButton)
    expect(weeklyButton).toHaveClass("bg-background")
  })

  it("changes time range when Monthly is clicked", () => {
    render(<CompletionChart daily={mockDaily} weekly={mockWeekly} monthly={mockMonthly} />)
    const monthlyButton = screen.getByText("Monthly")
    fireEvent.click(monthlyButton)
    expect(monthlyButton).toHaveClass("bg-background")
  })

  it("renders chart components", () => {
    render(<CompletionChart daily={mockDaily} weekly={mockWeekly} monthly={mockMonthly} />)
    expect(screen.getByTestId("line-chart")).toBeInTheDocument()
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument()
  })

  it("renders with card styling", () => {
    const { container } = render(
      <CompletionChart daily={mockDaily} weekly={mockWeekly} monthly={mockMonthly} />
    )
    expect(container.firstChild).toHaveClass("rounded-2xl", "border")
  })
})
