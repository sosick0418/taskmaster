"use client"

import { LayoutList, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewMode = "list" | "board"

interface ViewToggleProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="relative flex items-center rounded-lg border border-border bg-muted/50 p-1">
      <button
        onClick={() => onViewChange("list")}
        className={cn(
          "relative z-10 flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
          view === "list"
            ? "bg-violet-500/15 text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <LayoutList className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </button>

      <button
        onClick={() => onViewChange("board")}
        className={cn(
          "relative z-10 flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
          view === "board"
            ? "bg-violet-500/15 text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Board</span>
      </button>
    </div>
  )
}
