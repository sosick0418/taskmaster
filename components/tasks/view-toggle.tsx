"use client"

import { motion } from "framer-motion"
import { LayoutList, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewMode = "list" | "board"

interface ViewToggleProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="relative flex items-center rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
      {/* Sliding background indicator */}
      <motion.div
        layoutId="view-toggle-indicator"
        className="absolute inset-y-1 w-[calc(50%-2px)] rounded-md bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-white/[0.08]"
        animate={{
          x: view === "list" ? 2 : "calc(100% + 2px)",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />

      <button
        onClick={() => onViewChange("list")}
        className={cn(
          "relative z-10 flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          view === "list" ? "text-white" : "text-white/40 hover:text-white/60"
        )}
      >
        <LayoutList className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </button>

      <button
        onClick={() => onViewChange("board")}
        className={cn(
          "relative z-10 flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          view === "board" ? "text-white" : "text-white/40 hover:text-white/60"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Board</span>
      </button>
    </div>
  )
}
