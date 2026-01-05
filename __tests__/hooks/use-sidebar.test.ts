import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSidebar } from "@/hooks/use-sidebar"

describe("useSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem = vi.fn().mockReturnValue(null)
    localStorage.setItem = vi.fn()
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
    const { result } = renderHook(() => useSidebar(true))

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
    localStorage.getItem = vi.fn().mockReturnValue("true")

    const { result } = renderHook(() => useSidebar())

    // After useEffect runs
    expect(result.current.isLoaded).toBe(true)
  })
})
