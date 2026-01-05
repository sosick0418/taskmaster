import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ThemeToggle } from "@/components/layout/theme-toggle"

// Re-mock useTheme for this specific test file
vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => ({
    theme: "dark",
    setTheme: vi.fn(),
    resolvedTheme: "dark",
  })),
}))

import { useTheme } from "next-themes"

describe("ThemeToggle", () => {
  it("renders the toggle button", () => {
    render(<ThemeToggle />)

    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument()
  })

  it("calls setTheme with 'light' when in dark mode", () => {
    const setTheme = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: "dark",
      setTheme,
      resolvedTheme: "dark",
      themes: ["light", "dark"],
      systemTheme: "dark",
      forcedTheme: undefined,
    })

    render(<ThemeToggle />)

    const button = screen.getByRole("button", { name: /toggle theme/i })
    fireEvent.click(button)

    expect(setTheme).toHaveBeenCalledWith("light")
  })

  it("calls setTheme with 'dark' when in light mode", () => {
    const setTheme = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme,
      resolvedTheme: "light",
      themes: ["light", "dark"],
      systemTheme: "light",
      forcedTheme: undefined,
    })

    render(<ThemeToggle />)

    const button = screen.getByRole("button", { name: /toggle theme/i })
    fireEvent.click(button)

    expect(setTheme).toHaveBeenCalledWith("dark")
  })

  it("has accessible screen reader text", () => {
    render(<ThemeToggle />)

    expect(screen.getByText("Toggle theme")).toBeInTheDocument()
  })
})
