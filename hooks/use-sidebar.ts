"use client"

import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "taskmaster-sidebar-collapsed"
const SIDEBAR_CHANGE_EVENT = "sidebar-change"

// Helper to notify subscribers when localStorage changes
function notifyChange() {
  window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT))
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(SIDEBAR_CHANGE_EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

function getSnapshot(defaultCollapsed: boolean): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored !== null ? stored === "true" : defaultCollapsed
}

function getServerSnapshot(defaultCollapsed: boolean): boolean {
  return defaultCollapsed
}

export function useSidebar(defaultCollapsed = false) {
  const isCollapsed = useSyncExternalStore(
    subscribe,
    () => getSnapshot(defaultCollapsed),
    () => getServerSnapshot(defaultCollapsed)
  )

  const toggle = useCallback(() => {
    const current = getSnapshot(defaultCollapsed)
    localStorage.setItem(STORAGE_KEY, String(!current))
    notifyChange()
  }, [defaultCollapsed])

  const collapse = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true")
    notifyChange()
  }, [])

  const expand = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "false")
    notifyChange()
  }, [])

  // isLoaded is always true on client since useSyncExternalStore handles hydration
  const isLoaded = typeof window !== "undefined"

  return {
    isCollapsed,
    toggle,
    collapse,
    expand,
    isLoaded,
  }
}
