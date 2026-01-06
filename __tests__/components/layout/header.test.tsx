import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Header } from "@/components/layout/header"

// Mock child components
vi.mock("@/components/notifications/notification-bell", () => ({
  NotificationBell: () => <button data-testid="notification-bell">Notifications</button>,
}))

vi.mock("@/components/auth/user-button", () => ({
  UserButton: () => <button data-testid="user-button">User</button>,
}))

vi.mock("@/components/layout/theme-toggle", () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Toggle Theme</button>,
}))

describe("Header", () => {
  it("renders the search bar", () => {
    render(<Header />)

    expect(screen.getByText("Search tasks...")).toBeInTheDocument()
  })

  it("renders keyboard shortcut hint", () => {
    render(<Header />)

    expect(screen.getByText("K")).toBeInTheDocument()
  })

  it("calls onSearchOpen when search bar is clicked", () => {
    const onSearchOpen = vi.fn()
    render(<Header onSearchOpen={onSearchOpen} />)

    const searchButton = screen.getByRole("button", { name: /search tasks/i })
    fireEvent.click(searchButton)

    expect(onSearchOpen).toHaveBeenCalledTimes(1)
  })

  it("renders notification bell", () => {
    render(<Header />)

    expect(screen.getByTestId("notification-bell")).toBeInTheDocument()
  })

  it("renders theme toggle button", () => {
    render(<Header />)

    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument()
  })

  it("renders user button", () => {
    render(<Header />)

    expect(screen.getByTestId("user-button")).toBeInTheDocument()
  })
})
