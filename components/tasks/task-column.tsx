"use client"

import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { motion } from "framer-motion"
import { Plus, Circle, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SortableTaskCard } from "./sortable-task-card"
import { Button } from "@/components/ui/button"
import type { Task } from "@/types/task"
import type { TaskStatus } from "@/lib/validations/task"

interface TaskColumnProps {
  id: TaskStatus
  title: string
  tasks: Task[]
  onToggleComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onAddTask: (status: TaskStatus) => void
  onClick?: (task: Task) => void
}

const columnConfig: Record<
  TaskStatus,
  {
    icon: typeof Circle
    gradient: string
    bgGradient: string
    borderColor: string
  }
> = {
  TODO: {
    icon: Circle,
    gradient: "from-slate-400 to-slate-500",
    bgGradient: "from-slate-500/10 to-transparent",
    borderColor: "border-slate-500/20",
  },
  IN_PROGRESS: {
    icon: Clock,
    gradient: "from-blue-400 to-cyan-500",
    bgGradient: "from-blue-500/10 to-transparent",
    borderColor: "border-blue-500/20",
  },
  DONE: {
    icon: CheckCircle2,
    gradient: "from-emerald-400 to-green-500",
    bgGradient: "from-emerald-500/10 to-transparent",
    borderColor: "border-emerald-500/20",
  },
}

export function TaskColumn({
  id,
  title,
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddTask,
  onClick,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      status: id,
    },
  })

  const config = columnConfig[id]
  const Icon = config.icon
  const taskIds = tasks.map((task) => task.id)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-card/50 backdrop-blur-sm transition-all duration-300",
        config.borderColor,
        isOver && "border-primary/30 bg-card/80 ring-1 ring-primary/20"
      )}
    >
      {/* Column Header */}
      <div className="relative overflow-hidden rounded-t-2xl border-b border-border p-4">
        {/* Background gradient */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50",
            config.bgGradient
          )}
        />

        {/* Header content */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br",
                config.gradient
              )}
            >
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{tasks.length} tasks</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAddTask(id)}
            className="h-8 w-8 cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-3">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  {...(onClick && { onClick })}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center"
              >
                <Icon className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No tasks</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddTask(id)}
                  className="mt-2 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add task
                </Button>
              </motion.div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
