"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Priority } from "@/lib/validations/task"

const priorityConfig = {
  LOW: {
    label: "Low",
    className: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    glowColor: "shadow-slate-500/20",
    dotColor: "bg-slate-400",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    glowColor: "shadow-blue-500/25",
    dotColor: "bg-blue-400",
  },
  HIGH: {
    label: "High",
    className: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    glowColor: "shadow-amber-500/25",
    dotColor: "bg-amber-400",
  },
  URGENT: {
    label: "Urgent",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
    glowColor: "shadow-red-500/30",
    dotColor: "bg-red-400",
  },
} as const

interface PriorityBadgeProps {
  priority: Priority
  size?: "sm" | "md"
  showDot?: boolean
}

export function PriorityBadge({ priority, size = "sm", showDot = true }: PriorityBadgeProps) {
  const config = priorityConfig[priority]

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        "shadow-lg backdrop-blur-sm transition-all duration-200",
        config.className,
        config.glowColor,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      )}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full animate-pulse",
            config.dotColor,
            size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
          )}
        />
      )}
      {config.label}
    </motion.span>
  )
}
