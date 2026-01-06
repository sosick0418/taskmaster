"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns"
import { Calendar, Pencil, Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { PriorityBadge } from "./priority-badge"
import { SubtaskProgress } from "./subtask-progress"
import type { Priority } from "@/lib/validations/task"
import { Button } from "@/components/ui/button"
import { CircularCheckbox } from "@/components/shared/animated-checkbox"
import { celebrateTaskComplete } from "@/components/shared/confetti"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Task } from "@/types/task"

interface TaskCardProps {
  task: Task
  onToggleComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onClick?: (task: Task) => void
  isDragging?: boolean
  dragHandleProps?: Record<string, unknown>
}

const priorityGradients = {
  LOW: "from-slate-500/20 via-transparent",
  MEDIUM: "from-blue-500/20 via-transparent",
  HIGH: "from-amber-500/20 via-transparent",
  URGENT: "from-red-500/20 via-transparent",
} as const

function formatDueDate(date: Date): { text: string; isOverdue: boolean } {
  if (isToday(date)) {
    return { text: "Today", isOverdue: isPast(date) }
  }
  if (isTomorrow(date)) {
    return { text: "Tomorrow", isOverdue: false }
  }
  if (isPast(date)) {
    return { text: formatDistanceToNow(date, { addSuffix: true }), isOverdue: true }
  }
  return { text: formatDistanceToNow(date, { addSuffix: true }), isOverdue: false }
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
  isDragging = false,
  dragHandleProps,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't trigger if clicking on buttons, checkbox, or drag handle
      const target = e.target as HTMLElement
      if (
        target.closest("button") ||
        target.closest("[data-checkbox]") ||
        target.closest("[data-drag-handle]")
      ) {
        return
      }
      onClick?.(task)
    },
    [onClick, task]
  )

  const dueInfo = task.dueDate ? formatDueDate(new Date(task.dueDate)) : null

  const handleToggleComplete = useCallback(() => {
    // Fire confetti only when completing (not uncompleting)
    if (!task.isCompleted) {
      celebrateTaskComplete()
    }
    onToggleComplete(task.id)
  }, [task.isCompleted, task.id, onToggleComplete])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
        rotate: isDragging ? 1 : 0,
      }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm",
        "transition-all duration-300",
        "hover:border-border/80 hover:bg-card/80",
        isDragging && "shadow-2xl shadow-black/20 dark:shadow-black/50 border-primary/30",
        task.isCompleted && "opacity-60",
        onClick && "cursor-pointer"
      )}
    >
      {/* Priority gradient accent */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r",
          priorityGradients[task.priority]
        )}
      />

      <div className="flex items-start gap-3 p-4">
        {/* Drag handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            data-drag-handle
            className="mt-1 cursor-grab text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {/* Animated Checkbox */}
        <div className="mt-0.5" data-checkbox>
          <CircularCheckbox
            checked={task.isCompleted}
            onChange={handleToggleComplete}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={cn(
                  "font-medium leading-tight text-foreground transition-all duration-200",
                  task.isCompleted && "text-muted-foreground"
                )}
              >
                <span className={cn(
                  "relative inline",
                  task.isCompleted && "line-through decoration-emerald-500/70 decoration-2"
                )}>
                  {task.title}
                </span>
              </h3>
              {task.description && (
                <p
                  className={cn(
                    "mt-1 text-sm text-muted-foreground line-clamp-2",
                    task.isCompleted && "text-muted-foreground/60"
                  )}
                >
                  {task.description}
                </p>
              )}
            </div>

            {/* Priority badge */}
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Subtask progress */}
            {task.subtasks && task.subtasks.length > 0 && (
              <SubtaskProgress subtasks={task.subtasks} />
            )}

            {/* Due date */}
            {dueInfo && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs",
                  dueInfo.isOverdue
                    ? "bg-red-500/20 text-red-600 dark:text-red-300"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Calendar className="h-3 w-3" />
                {dueInfo.text}
              </div>
            )}

            {/* Tags */}
            {task.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs text-violet-600 dark:text-violet-300"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {isHovered && !task.isCompleted && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-1"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => onEdit(task)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer text-muted-foreground hover:bg-red-500/20 hover:text-red-500"
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  )
}
