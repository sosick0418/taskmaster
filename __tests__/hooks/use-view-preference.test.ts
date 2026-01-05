import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useViewPreference } from "@/hooks/use-view-preference"

describe("useViewPreference", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem = vi.fn().mockReturnValue(null)
    localStorage.setItem = vi.fn()
  })

  it("returns default view as list", () => {
    const { result } = renderHook(() => useViewPreference())

    expect(result.current.view).toBe("list")
  })

  it("returns custom default view", () => {
    const { result } = renderHook(() => useViewPreference("board"))

    expect(result.current.view).toBe("board")
  })

  it("changes view to board", () => {
    const { result } = renderHook(() => useViewPreference())

    act(() => {
      result.current.setView("board")
    })

    expect(result.current.view).toBe("board")
  })

  it("changes view to list", () => {
    const { result } = renderHook(() => useViewPreference("board"))

    act(() => {
      result.current.setView("list")
    })

    expect(result.current.view).toBe("list")
  })

  it("saves view preference to localStorage", () => {
    const { result } = renderHook(() => useViewPreference())

    act(() => {
      result.current.setView("board")
    })

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "taskmaster-view-preference",
      "board"
    )
  })

  it("loads view preference from localStorage on mount", () => {
    localStorage.getItem = vi.fn().mockReturnValue("board")

    const { result } = renderHook(() => useViewPreference())

    expect(result.current.isLoaded).toBe(true)
  })

  it("ignores invalid localStorage values", () => {
    localStorage.getItem = vi.fn().mockReturnValue("invalid")

    const { result } = renderHook(() => useViewPreference())

    // Should keep default value when localStorage has invalid value
    expect(result.current.view).toBe("list")
  })
})
