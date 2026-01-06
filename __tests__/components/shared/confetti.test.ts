import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useConfetti, celebrateTaskComplete } from "@/components/shared/confetti"

// Mock canvas-confetti
const mockConfetti = vi.fn()
vi.mock("canvas-confetti", () => ({
  default: (...args: unknown[]) => mockConfetti(...args),
}))

describe("useConfetti", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns fire, fireStars, and fireSides functions", () => {
    const { result } = renderHook(() => useConfetti())
    expect(result.current.fire).toBeInstanceOf(Function)
    expect(result.current.fireStars).toBeInstanceOf(Function)
    expect(result.current.fireSides).toBeInstanceOf(Function)
  })

  it("fire calls confetti with default options", () => {
    const { result } = renderHook(() => useConfetti())
    result.current.fire()
    expect(mockConfetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 100,
        spread: 70,
        startVelocity: 30,
        decay: 0.95,
        scalar: 1,
      })
    )
  })

  it("fire accepts custom options", () => {
    const { result } = renderHook(() => useConfetti())
    result.current.fire({ particleCount: 50, spread: 100 })
    expect(mockConfetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 50,
        spread: 100,
      })
    )
  })

  it("fireStars calls confetti multiple times", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useConfetti())
    result.current.fireStars()

    // Initial calls
    vi.advanceTimersByTime(0)
    expect(mockConfetti).toHaveBeenCalled()

    // After 100ms
    vi.advanceTimersByTime(100)
    expect(mockConfetti.mock.calls.length).toBeGreaterThan(2)

    // After 200ms
    vi.advanceTimersByTime(100)
    expect(mockConfetti.mock.calls.length).toBeGreaterThan(4)

    vi.useRealTimers()
  })

  it("fireSides creates confetti from both sides", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useConfetti())
    result.current.fireSides()

    // Run animation frames
    vi.advanceTimersByTime(500)

    // Should have called confetti with origin.x = 0 and origin.x = 1
    const calls = mockConfetti.mock.calls
    const leftSide = calls.some(
      (call) => (call[0] as { origin?: { x: number } })?.origin?.x === 0
    )
    const rightSide = calls.some(
      (call) => (call[0] as { origin?: { x: number } })?.origin?.x === 1
    )

    expect(leftSide).toBe(true)
    expect(rightSide).toBe(true)

    vi.useRealTimers()
  })
})

describe("celebrateTaskComplete", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls confetti multiple times with different settings", () => {
    celebrateTaskComplete()
    // Should fire multiple confetti bursts
    expect(mockConfetti.mock.calls.length).toBeGreaterThanOrEqual(5)
  })

  it("uses purple/cyan color palette", () => {
    celebrateTaskComplete()
    const call = mockConfetti.mock.calls[0]
    expect((call[0] as { colors?: string[] })?.colors).toEqual(
      expect.arrayContaining(["#a855f7", "#06b6d4"])
    )
  })

  it("fires from vertical position 0.7", () => {
    celebrateTaskComplete()
    const call = mockConfetti.mock.calls[0]
    expect((call[0] as { origin?: { y: number } })?.origin?.y).toBe(0.7)
  })
})
