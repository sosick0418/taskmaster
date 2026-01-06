"use client"

import { motion } from "framer-motion"
import { CheckCircle2, ListTodo } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SubTask } from "@/types/task"

interface SubtaskProgressProps {
  subtasks: SubTask[]
  className?: string
  showIcon?: boolean
  size?: "sm" | "md"
}

export function SubtaskProgress({
  subtasks,
  className,
  showIcon = true,
  size = "sm",
}: SubtaskProgressProps) {
  if (subtasks.length === 0) return null

  const completed = subtasks.filter((s) => s.isCompleted).length
  const total = subtasks.length
  const percentage = Math.round((completed / total) * 100)
  const isAllCompleted = completed === total

  const sizeClasses = {
    sm: {
      container: "gap-1.5 text-xs",
      icon: "h-3 w-3",
      bar: "h-1 w-12",
    },
    md: {
      container: "gap-2 text-sm",
      icon: "h-4 w-4",
      bar: "h-1.5 w-16",
    },
  }

  return (
    <div
      className={cn(
        "flex items-center",
        sizeClasses[size].container,
        isAllCompleted ? "text-emerald-500" : "text-muted-foreground",
        className
      )}
    >
      {showIcon && (
        <motion.div
          initial={false}
          animate={isAllCompleted ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {isAllCompleted ? (
            <CheckCircle2 className={sizeClasses[size].icon} />
          ) : (
            <ListTodo className={sizeClasses[size].icon} />
          )}
        </motion.div>
      )}

      {/* Progress text */}
      <span className="font-medium">
        {completed}/{total}
      </span>

      {/* Progress bar */}
      <div
        className={cn(
          "overflow-hidden rounded-full bg-muted",
          sizeClasses[size].bar
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            isAllCompleted
              ? "bg-gradient-to-r from-emerald-500 to-green-500"
              : "bg-gradient-to-r from-violet-500 to-cyan-500"
          )}
        />
      </div>
    </div>
  )
}
