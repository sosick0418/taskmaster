import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  Skeleton,
  TaskCardSkeleton,
  TaskListSkeleton,
  StatCardSkeleton,
  StatsGridSkeleton,
  KanbanColumnSkeleton,
  KanbanBoardSkeleton,
} from "@/components/shared/loading-skeleton"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}))

describe("Skeleton", () => {
  it("renders with base classes", () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass("rounded-md", "bg-white/[0.05]")
  })

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="h-10 w-full" />)
    expect(container.firstChild).toHaveClass("h-10", "w-full")
  })
})

describe("TaskCardSkeleton", () => {
  it("renders skeleton structure", () => {
    const { container } = render(<TaskCardSkeleton />)
    // Should have multiple skeleton elements for title, description, etc.
    const skeletons = container.querySelectorAll(".rounded-md")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("renders with card-like styling", () => {
    const { container } = render(<TaskCardSkeleton />)
    expect(container.firstChild).toHaveClass("rounded-2xl", "border")
  })
})

describe("TaskListSkeleton", () => {
  it("renders default 3 task card skeletons", () => {
    const { container } = render(<TaskListSkeleton />)
    const cards = container.querySelectorAll(".rounded-2xl.border")
    expect(cards.length).toBe(3)
  })

  it("renders custom count of task card skeletons", () => {
    const { container } = render(<TaskListSkeleton count={5} />)
    const cards = container.querySelectorAll(".rounded-2xl.border")
    expect(cards.length).toBe(5)
  })

  it("renders with spacing between cards", () => {
    const { container } = render(<TaskListSkeleton />)
    expect(container.firstChild).toHaveClass("space-y-3")
  })
})

describe("StatCardSkeleton", () => {
  it("renders with card styling", () => {
    const { container } = render(<StatCardSkeleton />)
    expect(container.firstChild).toHaveClass("rounded-2xl", "border", "p-6")
  })

  it("renders label and value skeletons", () => {
    const { container } = render(<StatCardSkeleton />)
    const skeletons = container.querySelectorAll(".rounded-md")
    expect(skeletons.length).toBe(2)
  })
})

describe("StatsGridSkeleton", () => {
  it("renders 3 stat card skeletons", () => {
    const { container } = render(<StatsGridSkeleton />)
    const cards = container.querySelectorAll(".rounded-2xl.border")
    expect(cards.length).toBe(3)
  })

  it("renders with grid layout", () => {
    const { container } = render(<StatsGridSkeleton />)
    expect(container.firstChild).toHaveClass("grid", "gap-4")
  })
})

describe("KanbanColumnSkeleton", () => {
  it("renders with column styling", () => {
    const { container } = render(<KanbanColumnSkeleton />)
    expect(container.firstChild).toHaveClass("flex", "flex-col", "rounded-2xl")
  })

  it("renders header skeleton", () => {
    const { container } = render(<KanbanColumnSkeleton />)
    const header = container.querySelector(".border-b")
    expect(header).toBeInTheDocument()
  })

  it("renders task card skeletons inside column", () => {
    const { container } = render(<KanbanColumnSkeleton />)
    // Should have task cards inside
    const taskCards = container.querySelectorAll(".flex-1 .rounded-2xl.border")
    expect(taskCards.length).toBe(2)
  })
})

describe("KanbanBoardSkeleton", () => {
  it("renders 3 column skeletons", () => {
    const { container } = render(<KanbanBoardSkeleton />)
    // Each column has flex + flex-col + rounded-2xl classes
    const columns = container.querySelectorAll(":scope > div > .flex.flex-col.rounded-2xl")
    expect(columns.length).toBe(3)
  })

  it("renders with grid layout for 3 columns on md screens", () => {
    const { container } = render(<KanbanBoardSkeleton />)
    expect(container.firstChild).toHaveClass("grid", "md:grid-cols-3")
  })
})
