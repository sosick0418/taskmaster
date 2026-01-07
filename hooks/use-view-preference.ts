"use client"

import { useCallback, useSyncExternalStore } from "react"

type ViewType = "list" | "board"

const STORAGE_KEY = "taskmaster-view-preference"
const VIEW_CHANGE_EVENT = "view-preference-change"

function notifyChange() {
  window.dispatchEvent(new Event(VIEW_CHANGE_EVENT))
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(VIEW_CHANGE_EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(VIEW_CHANGE_EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

function getSnapshot(defaultView: ViewType): ViewType {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "list" || stored === "board") {
    return stored
  }
  return defaultView
}

function getServerSnapshot(defaultView: ViewType): ViewType {
  return defaultView
}

export function useViewPreference(defaultView: ViewType = "list") {
  const view = useSyncExternalStore(
    subscribe,
    () => getSnapshot(defaultView),
    () => getServerSnapshot(defaultView)
  )

  const changeView = useCallback((newView: ViewType) => {
    localStorage.setItem(STORAGE_KEY, newView)
    notifyChange()
  }, [])

  // isLoaded is always true on client since useSyncExternalStore handles hydration
  const isLoaded = typeof window !== "undefined"

  return {
    view,
    setView: changeView,
    isLoaded,
  }
}
