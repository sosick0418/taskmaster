"use client"

import { useState, useTransition, useOptimistic, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, CheckSquare } from "lucide-react"
import { toast } from "sonner"
import { TaskCard } from "./task-card"
import { TaskForm } from "./task-form"
import { TaskDetailModal } from "./task-detail-modal"
import { TaskFilters, type SortOption } from "./task-filters"
import { ViewToggle, type ViewMode } from "./view-toggle"
import { TaskBoard } from "./task-board"
import type { SubTask } from "@/types/task"
import { Button } from "@/components/ui/button"
import {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  reorderTasks,
} from "@/actions/tasks"
import type { Priority, TaskStatus } from "@/lib/validations/task"
import type { Task } from "@/types/task"

interface TaskFormData {
  title: string
  description?: string | undefined
  status: TaskStatus
  priority: Priority
  dueDate?: Date | undefined
  tags: string[]
  id?: string | undefined
}

interface TaskListViewProps {
  initialTasks: Task[]
  stats: {
    total: number
    inProgress: number
    completed: number
    todo: number
    tasks: {
      total: number
      completed: number
      inProgress: number
    }
    subtasks: {
      total: number
      completed: number
    }
  }
  userName: string | undefined
}

const priorityOrder: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

export function TaskListView({ initialTasks, stats, userName }: TaskListViewProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("TODO")
  const [isPending, startTransition] = useTransition()

  // Detail modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Filter and view state
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>(["TODO", "IN_PROGRESS", "DONE"])
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>(["LOW", "MEDIUM", "HIGH", "URGENT"])
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  // Optimistic updates for better UX
  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    tasks,
    (state, action: { type: string; task?: Task; id?: string; status?: TaskStatus; order?: number }) => {
      switch (action.type) {
        case "toggle":
          return state.map((t) =>
            t.id === action.id
              ? { ...t, isCompleted: !t.isCompleted, status: (!t.isCompleted ? "DONE" : "TODO") as TaskStatus }
              : t
          )
        case "delete":
          return state.filter((t) => t.id !== action.id)
        case "move":
          return state.map((t) =>
            t.id === action.id
              ? { ...t, status: action.status!, order: action.order!, isCompleted: action.status === "DONE" }
              : t
          )
        default:
          return state
      }
    }
  )

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = optimisticTasks

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags.some((tag) => tag.name.toLowerCase().includes(query))
      )
    }

    // Apply status filter (only for list view)
    if (viewMode === "list") {
      result = result.filter((task) => statusFilter.includes(task.status))
    }

    // Apply priority filter
    result = result.filter((task) => priorityFilter.includes(task.priority))

    // Apply sorting (only for list view)
    if (viewMode === "list") {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return b.order - a.order
          case "oldest":
            return a.order - b.order
          case "priority":
            return priorityOrder[a.priority] - priorityOrder[b.priority]
          case "dueDate":
            if (!a.dueDate && !b.dueDate) return 0
            if (!a.dueDate) return 1
            if (!b.dueDate) return -1
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          case "title":
            return a.title.localeCompare(b.title)
          default:
            return 0
        }
      })
    }

    return result
  }, [optimisticTasks, searchQuery, statusFilter, priorityFilter, sortBy, viewMode])

  const handleCreateOrUpdate = async (data: TaskFormData) => {
    const { id: taskId, ...restData } = data
    if (taskId) {
      // Update
      const result = await updateTask({ id: taskId, ...restData })
      if (result.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  title: restData.title,
                  description: restData.description ?? null,
                  status: restData.status,
                  priority: restData.priority,
                  dueDate: restData.dueDate ?? null,
                  tags: restData.tags.map((name, i) => ({ id: i, name })),
                }
              : t
          )
        )
        toast.success("Task updated successfully")
      } else {
        toast.error(result.error)
      }
    } else {
      // Create
      const result = await createTask(restData)
      if (result.success) {
        // Refetch tasks to get the new one with proper ID
        window.location.reload()
        toast.success("Task created successfully")
      } else {
        toast.error(result.error)
      }
    }
    setEditingTask(null)
    setDefaultStatus("TODO")
  }

  const handleToggleComplete = async (id: string) => {
    // Find the task to check current state before optimistic update
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const willBeCompleted = !task.isCompleted

    // Update base state immediately (before transition) to prevent flicker
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isCompleted: willBeCompleted,
              status: willBeCompleted ? "DONE" : "TODO",
            }
          : t
      )
    )

    // Show success toast immediately for better UX
    if (willBeCompleted) {
      toast.success("Task completed! Great job!")
    }

    // Sync with server in background
    startTransition(async () => {
      const result = await toggleTaskComplete(id)
      if (!result.success) {
        // Rollback on error
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  isCompleted: !willBeCompleted,
                  status: !willBeCompleted ? "DONE" : "TODO",
                }
              : t
          )
        )
        toast.error(result.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      addOptimisticTask({ type: "delete", id })

      const result = await deleteTask(id)
      if (result.success) {
        setTasks((prev) => prev.filter((t) => t.id !== id))
        toast.success("Task deleted")
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDetailOpen(true)
  }

  const handleSubtasksChange = useCallback((taskId: string, subtasks: SubTask[]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks } : t))
    )
    // Also update selectedTask if it's open
    setSelectedTask((prev) =>
      prev?.id === taskId ? { ...prev, subtasks } : prev
    )
  }, [])

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status)
    setEditingTask(null)
    setIsFormOpen(true)
  }

  const handleTaskMove = useCallback(async (taskId: string, newStatus: TaskStatus, newOrder: number) => {
    // Optimistic update
    startTransition(async () => {
      addOptimisticTask({ type: "move", id: taskId, status: newStatus, order: newOrder })

      // Update local state
      setTasks((prev) => {
        const task = prev.find((t) => t.id === taskId)
        if (!task) return prev

        // Get tasks in the target status column
        const tasksInColumn = prev
          .filter((t) => t.status === newStatus && t.id !== taskId)
          .sort((a, b) => a.order - b.order)

        // Insert the moved task at the new position
        tasksInColumn.splice(newOrder, 0, { ...task, status: newStatus })

        // Update orders for all tasks in the column
        const updatedTasks = tasksInColumn.map((t, index) => ({
          ...t,
          order: index,
        }))

        // Replace tasks in the column with updated ones
        return prev.map((t) => {
          if (t.id === taskId) {
            return { ...t, status: newStatus, order: newOrder, isCompleted: newStatus === "DONE" }
          }
          const updated = updatedTasks.find((ut) => ut.id === t.id)
          return updated || t
        })
      })

      // Persist to server
      const result = await reorderTasks({
        tasks: [{ id: taskId, order: newOrder, status: newStatus }],
      })

      if (!result.success) {
        toast.error(result.error)
        // Revert on error - reload page
        window.location.reload()
      }
    })
  }, [addOptimisticTask, startTransition])

  const statCards = [
    {
      label: "Tasks",
      value: `${stats.tasks.completed}/${stats.tasks.total}`,
      subLabel: `${stats.tasks.inProgress} in progress, ${stats.todo} to do`,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      label: "Subtasks",
      value: `${stats.subtasks.completed}/${stats.subtasks.total}`,
      subLabel: stats.subtasks.total > 0
        ? `${Math.round((stats.subtasks.completed / stats.subtasks.total) * 100)}% complete`
        : "No subtasks yet",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      label: "Completed",
      value: stats.completed,
      subLabel: `${stats.tasks.completed} tasks + ${stats.subtasks.completed} subtasks`,
      gradient: "from-fuchsia-500 to-pink-600",
    },
  ]

  const showingCount = filteredTasks.length
  const totalCount = optimisticTasks.length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back,{" "}
            <span className="gradient-text">{userName ?? "there"}</span>
          </h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s on your plate today.</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <Button
            onClick={() => handleAddTask("TODO")}
            className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-card/80"
          >
            <div
              className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${stat.gradient} opacity-50`}
            />
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p
              className={`mt-2 text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">{stat.subLabel}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters - only show in list view */}
      {viewMode === "list" && (
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}

      {/* Results count - only show in list view with filters */}
      {viewMode === "list" && (searchQuery || statusFilter.length < 3 || priorityFilter.length < 4) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          Showing {showingCount} of {totalCount} tasks
        </motion.p>
      )}

      {/* Board View */}
      {viewMode === "board" ? (
        <TaskBoard
          tasks={filteredTasks}
          onTaskMove={handleTaskMove}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddTask={handleAddTask}
          onClick={handleTaskClick}
        />
      ) : (
        /* List View */
        <>
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClick={handleTaskClick}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : optimisticTasks.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-16"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <CheckSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground/70">No matching tasks</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter(["TODO", "IN_PROGRESS", "DONE"])
                  setPriorityFilter(["LOW", "MEDIUM", "HIGH", "URGENT"])
                }}
                className="mt-4 text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
                <CheckSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground/80">No tasks yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first task to get started
              </p>
              <Button
                onClick={() => handleAddTask("TODO")}
                className="mt-6 bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* Task form modal */}
      <TaskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        task={editingTask ? editingTask : { status: defaultStatus } as any}
        onSubmit={handleCreateOrUpdate}
      />

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSubtasksChange={handleSubtasksChange}
      />
    </div>
  )
}
