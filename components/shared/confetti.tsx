"use client"

import { useCallback } from "react"
import confetti from "canvas-confetti"

interface ConfettiOptions {
  particleCount?: number
  spread?: number
  startVelocity?: number
  decay?: number
  scalar?: number
}

export function useConfetti() {
  const fire = useCallback((options: ConfettiOptions = {}) => {
    const defaults = {
      particleCount: 100,
      spread: 70,
      startVelocity: 30,
      decay: 0.95,
      scalar: 1,
      origin: { y: 0.6 },
      colors: ["#a855f7", "#06b6d4", "#ec4899", "#8b5cf6", "#22d3d3"],
      ticks: 200,
      gravity: 1.2,
      ...options,
    }

    confetti(defaults)
  }, [])

  const fireStars = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#a855f7", "#06b6d4", "#ec4899"],
    }

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      })

      confetti({
        ...defaults,
        particleCount: 20,
        scalar: 0.75,
        shapes: ["circle"],
      })
    }

    setTimeout(shoot, 0)
    setTimeout(shoot, 100)
    setTimeout(shoot, 200)
  }, [])

  const fireSides = useCallback(() => {
    const end = Date.now() + 500

    const colors = ["#a855f7", "#06b6d4", "#ec4899"]

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  return { fire, fireStars, fireSides }
}

// Simple confetti burst for task completion
export function celebrateTaskComplete() {
  const count = 200
  const defaults = {
    origin: { y: 0.7 },
    colors: ["#a855f7", "#06b6d4", "#ec4899", "#8b5cf6"],
  }

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })

  fire(0.2, {
    spread: 60,
  })

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}
