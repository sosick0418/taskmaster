import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useViewPreference } from "@/hooks/use-view-preference"

describe("useViewPreference", () => {
  let storedValue: string | null = null
  const originalGetItem = localStorage.getItem
  const originalSetItem = localStorage.setItem

  beforeEach(() => {
    vi.clearAllMocks()
    storedValue = null
    localStorage.getItem = vi.fn(() => storedValue)
    localStorage.setItem = vi.fn((key: string, value: string) => {
      storedValue = value
      // Dispatch event to trigger useSyncExternalStore re-render
      window.dispatchEvent(new Event("view-preference-change"))
    })
  })

  afterEach(() => {
    storedValue = null
    localStorage.getItem = originalGetItem
    localStorage.setItem = originalSetItem
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
    storedValue = "board"
    const { result } = renderHook(() => useViewPreference("board"))

    expect(result.current.view).toBe("board")

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
    storedValue = "board"

    const { result } = renderHook(() => useViewPreference())

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.view).toBe("board")
  })

  it("ignores invalid localStorage values", () => {
    storedValue = "invalid"

    const { result } = renderHook(() => useViewPreference())

    // Should keep default value when localStorage has invalid value
    expect(result.current.view).toBe("list")
  })
})
