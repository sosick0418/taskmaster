"use client"

import { useState, useEffect, useCallback } from "react"

type ViewType = "list" | "board"

const STORAGE_KEY = "taskmaster-view-preference"

export function useViewPreference(defaultView: ViewType = "list") {
  const [view, setView] = useState<ViewType>(defaultView)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "list" || stored === "board") {
      setView(stored)
    }
    setIsLoaded(true)
  }, [])

  // Save preference to localStorage when it changes
  const changeView = useCallback((newView: ViewType) => {
    setView(newView)
    localStorage.setItem(STORAGE_KEY, newView)
  }, [])

  return {
    view,
    setView: changeView,
    isLoaded,
  }
}
