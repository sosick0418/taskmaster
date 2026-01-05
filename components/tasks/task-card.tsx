"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns"
import { Calendar, Pencil, Trash2, Check, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { PriorityBadge } from "./priority-badge"
import type { Priority } from "@/lib/validations/task"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  isDragging = false,
  dragHandleProps,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const dueInfo = task.dueDate ? formatDueDate(new Date(task.dueDate)) : null

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
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm",
        "transition-all duration-300",
        "hover:border-white/[0.12] hover:bg-white/[0.04]",
        isDragging && "shadow-2xl shadow-black/50 border-white/[0.15]",
        task.isCompleted && "opacity-60"
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
            className="mt-1 cursor-grab text-white/20 hover:text-white/40 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {/* Checkbox */}
        <div className="mt-0.5">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Checkbox
              checked={task.isCompleted}
              onCheckedChange={() => onToggleComplete(task.id)}
              className={cn(
                "h-5 w-5 rounded-md border-2 transition-all duration-200",
                task.isCompleted
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-white/20 hover:border-white/40"
              )}
            />
          </motion.div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={cn(
                  "font-medium leading-tight transition-all duration-200",
                  task.isCompleted && "text-white/50 line-through"
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={cn(
                    "mt-1 text-sm text-white/50 line-clamp-2",
                    task.isCompleted && "text-white/30"
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
            {/* Due date */}
            {dueInfo && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs",
                  dueInfo.isOverdue
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/[0.04] text-white/50"
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
                className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300"
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
                      className="h-8 w-8 text-white/40 hover:bg-white/[0.08] hover:text-white"
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
                      className="h-8 w-8 text-white/40 hover:bg-red-500/20 hover:text-red-400"
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

      {/* Completed overlay effect */}
      {task.isCompleted && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute left-4 right-4 top-1/2 h-px origin-left bg-gradient-to-r from-emerald-500/50 via-emerald-500/20 to-transparent"
        />
      )}
    </motion.div>
  )
}
