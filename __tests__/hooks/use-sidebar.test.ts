import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSidebar } from "@/hooks/use-sidebar"

describe("useSidebar", () => {
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
      window.dispatchEvent(new Event("sidebar-change"))
    })
  })

  afterEach(() => {
    storedValue = null
    localStorage.getItem = originalGetItem
    localStorage.setItem = originalSetItem
  })

  it("returns default collapsed state as false", () => {
    const { result } = renderHook(() => useSidebar())

    expect(result.current.isCollapsed).toBe(false)
  })

  it("returns custom default collapsed state", () => {
    const { result } = renderHook(() => useSidebar(true))

    expect(result.current.isCollapsed).toBe(true)
  })

  it("toggles collapsed state", () => {
    const { result } = renderHook(() => useSidebar())

    expect(result.current.isCollapsed).toBe(false)

    act(() => {
      result.current.toggle()
    })

    expect(result.current.isCollapsed).toBe(true)

    act(() => {
      result.current.toggle()
    })

    expect(result.current.isCollapsed).toBe(false)
  })

  it("saves state to localStorage when toggling", () => {
    const { result } = renderHook(() => useSidebar())

    act(() => {
      result.current.toggle()
    })

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "taskmaster-sidebar-collapsed",
      "true"
    )
  })

  it("collapses sidebar", () => {
    const { result } = renderHook(() => useSidebar(false))

    act(() => {
      result.current.collapse()
    })

    expect(result.current.isCollapsed).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "taskmaster-sidebar-collapsed",
      "true"
    )
  })

  it("expands sidebar", () => {
    storedValue = "true"
    const { result } = renderHook(() => useSidebar(true))

    expect(result.current.isCollapsed).toBe(true)

    act(() => {
      result.current.expand()
    })

    expect(result.current.isCollapsed).toBe(false)
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "taskmaster-sidebar-collapsed",
      "false"
    )
  })

  it("loads state from localStorage on mount", () => {
    storedValue = "true"

    const { result } = renderHook(() => useSidebar())

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.isCollapsed).toBe(true)
  })
})
