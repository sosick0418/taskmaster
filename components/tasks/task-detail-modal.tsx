"use client"

import { useState, useCallback, useTransition, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns"
import {
  Calendar,
  Clock,
  Tag,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ListTodo,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PriorityBadge } from "./priority-badge"
import { SubtaskList } from "./subtask-list"
import { CircularCheckbox } from "@/components/shared/animated-checkbox"
import { celebrateTaskComplete } from "@/components/shared/confetti"
import type { Task, SubTask } from "@/types/task"

interface TaskDetailModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onSubtasksChange?: (taskId: string, subtasks: SubTask[]) => void
}

const statusConfig = {
  TODO: { label: "To Do", color: "bg-slate-500", textColor: "text-slate-500" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-500", textColor: "text-blue-500" },
  DONE: { label: "Done", color: "bg-emerald-500", textColor: "text-emerald-500" },
}

function formatDueDate(date: Date): { text: string; isOverdue: boolean; fullDate: string } {
  const fullDate = format(date, "EEEE, MMMM d, yyyy")
  if (isToday(date)) {
    return { text: "Today", isOverdue: isPast(date), fullDate }
  }
  if (isTomorrow(date)) {
    return { text: "Tomorrow", isOverdue: false, fullDate }
  }
  if (isPast(date)) {
    return { text: `Overdue by ${formatDistanceToNow(date)}`, isOverdue: true, fullDate }
  }
  return { text: `Due ${formatDistanceToNow(date, { addSuffix: true })}`, isOverdue: false, fullDate }
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  onToggleComplete,
  onEdit,
  onDelete,
  onSubtasksChange,
}: TaskDetailModalProps) {
  const [localSubtasks, setLocalSubtasks] = useState<SubTask[]>([])

  // Sync local subtasks with task data
  useEffect(() => {
    if (task?.subtasks) {
      setLocalSubtasks(task.subtasks)
    }
  }, [task?.subtasks])

  if (!task) return null

  const dueInfo = task.dueDate ? formatDueDate(new Date(task.dueDate)) : null
  const status = statusConfig[task.status]
  const completedSubtasks = localSubtasks.filter((s) => s.isCompleted).length
  const totalSubtasks = localSubtasks.length

  const handleToggleComplete = () => {
    if (!task.isCompleted) {
      celebrateTaskComplete()
    }
    onToggleComplete(task.id)
  }

  const handleEdit = () => {
    onOpenChange(false)
    onEdit(task)
  }

  const handleDelete = () => {
    onOpenChange(false)
    onDelete(task.id)
  }

  const handleSubtasksChange = (subtasks: SubTask[]) => {
    setLocalSubtasks(subtasks)
    onSubtasksChange?.(task.id, subtasks)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="flex max-h-[85vh] flex-col gap-0 overflow-hidden border-border bg-background/95 p-0 backdrop-blur-2xl sm:max-w-xl dark:bg-black/95">
        {/* Header gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-cyan-500/50" />

        {/* Close button - absolute positioned */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <div className="flex items-start gap-3 pr-10">
            <div className="mt-0.5" data-checkbox>
              <CircularCheckbox
                checked={task.isCompleted}
                onChange={handleToggleComplete}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <DialogTitle
                className={cn(
                  "text-xl font-semibold leading-tight",
                  task.isCompleted && "text-muted-foreground line-through decoration-emerald-500/70"
                )}
              >
                {task.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                    status.color + "/20",
                    status.textColor
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", status.color)} />
                  {status.label}
                </span>
                <PriorityBadge priority={task.priority} />
                <span className="text-muted-foreground">|</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleEdit}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-red-500"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-6">
            {/* Description */}
            {task.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="text-sm leading-relaxed text-foreground">{task.description}</p>
              </div>
            )}

            {/* Meta Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Due Date */}
              {dueInfo && (
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </h4>
                  <div
                    className={cn(
                      "rounded-lg border p-3",
                      dueInfo.isOverdue
                        ? "border-red-500/30 bg-red-500/10"
                        : "border-border bg-muted/30"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-medium",
                        dueInfo.isOverdue ? "text-red-500" : "text-foreground"
                      )}
                    >
                      {dueInfo.text}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{dueInfo.fullDate}</p>
                  </div>
                </div>
              )}

              {/* Created */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Created
                </h4>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-sm font-medium text-foreground">
                    {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {format(new Date(task.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-violet-500/20 px-3 py-1 text-sm text-violet-600 dark:text-violet-300"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Subtasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ListTodo className="h-4 w-4" />
                  Subtasks
                </h4>
                {totalSubtasks > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {completedSubtasks} of {totalSubtasks} completed
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {totalSubtasks > 0 && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <SubtaskList
                  taskId={task.id}
                  subtasks={localSubtasks}
                  onSubtasksChange={handleSubtasksChange}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
