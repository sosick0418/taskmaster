"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "taskmaster-sidebar-collapsed"

export function useSidebar(defaultCollapsed = false) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsCollapsed(stored === "true")
    }
    setIsLoaded(true)
  }, [])

  // Save preference to localStorage when it changes
  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev
      localStorage.setItem(STORAGE_KEY, String(newValue))
      return newValue
    })
  }, [])

  const collapse = useCallback(() => {
    setIsCollapsed(true)
    localStorage.setItem(STORAGE_KEY, "true")
  }, [])

  const expand = useCallback(() => {
    setIsCollapsed(false)
    localStorage.setItem(STORAGE_KEY, "false")
  }, [])

  return {
    isCollapsed,
    toggle,
    collapse,
    expand,
    isLoaded,
  }
}
