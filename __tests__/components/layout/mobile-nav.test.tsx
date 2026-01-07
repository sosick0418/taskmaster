import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MobileNav } from "@/components/layout/mobile-nav"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/tasks",
}))

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock UI components
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({
    children,
    open,
    onOpenChange,
  }: React.PropsWithChildren<{ open: boolean; onOpenChange: (open: boolean) => void }>) => (
    <div data-testid="sheet" data-open={open}>
      {children}
    </div>
  ),
  SheetTrigger: ({ children, asChild }: React.PropsWithChildren<{ asChild?: boolean }>) => (
    <div data-testid="sheet-trigger">{children}</div>
  ),
  SheetContent: ({ children }: React.PropsWithChildren) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SheetTitle: ({ children }: React.PropsWithChildren) => <h2>{children}</h2>,
}))

describe("MobileNav", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders hamburger menu button", () => {
    render(<MobileNav />)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("renders screen reader text for menu button", () => {
    render(<MobileNav />)
    expect(screen.getByText("Open menu")).toBeInTheDocument()
  })

  it("renders sheet component", () => {
    render(<MobileNav />)
    expect(screen.getByTestId("sheet")).toBeInTheDocument()
  })

  it("renders app logo with Taskmaster text", () => {
    render(<MobileNav />)
    expect(screen.getByText("Task")).toBeInTheDocument()
    expect(screen.getByText("master")).toBeInTheDocument()
  })

  it("renders Tasks navigation item", () => {
    render(<MobileNav />)
    expect(screen.getByText("Tasks")).toBeInTheDocument()
  })

  it("renders Analytics navigation item", () => {
    render(<MobileNav />)
    expect(screen.getByText("Analytics")).toBeInTheDocument()
  })

  it("renders Settings navigation item", () => {
    render(<MobileNav />)
    expect(screen.getByText("Settings")).toBeInTheDocument()
  })

  it("renders navigation links with correct hrefs", () => {
    render(<MobileNav />)
    const tasksLink = screen.getByText("Tasks").closest("a")
    const analyticsLink = screen.getByText("Analytics").closest("a")
    const settingsLink = screen.getByText("Settings").closest("a")

    expect(tasksLink).toHaveAttribute("href", "/tasks")
    expect(analyticsLink).toHaveAttribute("href", "/analytics")
    expect(settingsLink).toHaveAttribute("href", "/settings")
  })

  it("highlights active navigation item based on pathname", () => {
    render(<MobileNav />)
    const tasksLink = screen.getByText("Tasks").closest("a")
    // Tasks should be active since pathname is /tasks
    expect(tasksLink).toHaveClass("bg-primary/10")
  })

  it("does not highlight inactive navigation items", () => {
    render(<MobileNav />)
    const settingsLink = screen.getByText("Settings").closest("a")
    expect(settingsLink).not.toHaveClass("bg-primary/10")
  })

  it("has md:hidden class on trigger button for responsive design", () => {
    render(<MobileNav />)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("md:hidden")
  })
})
