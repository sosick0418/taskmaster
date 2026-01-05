"use client"

import { useState, useTransition, useOptimistic } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, CheckSquare } from "lucide-react"
import { toast } from "sonner"
import { TaskCard } from "./task-card"
import { TaskForm } from "./task-form"
import { Button } from "@/components/ui/button"
import {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
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
  }
  userName: string | undefined
}

export function TaskListView({ initialTasks, stats, userName }: TaskListViewProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isPending, startTransition] = useTransition()

  // Optimistic updates for better UX
  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    tasks,
    (state, action: { type: string; task?: Task; id?: string }) => {
      switch (action.type) {
        case "toggle":
          return state.map((t) =>
            t.id === action.id
              ? { ...t, isCompleted: !t.isCompleted, status: (!t.isCompleted ? "DONE" : "TODO") as TaskStatus }
              : t
          )
        case "delete":
          return state.filter((t) => t.id !== action.id)
        default:
          return state
      }
    }
  )

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
  }

  const handleToggleComplete = async (id: string) => {
    startTransition(async () => {
      addOptimisticTask({ type: "toggle", id })

      const result = await toggleTaskComplete(id)
      if (result.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  isCompleted: result.data.isCompleted,
                  status: result.data.isCompleted ? "DONE" : "TODO",
                }
              : t
          )
        )
        if (result.data.isCompleted) {
          toast.success("Task completed! Great job!")
        }
      } else {
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

  const statCards = [
    { label: "Total Tasks", value: stats.total, gradient: "from-violet-500 to-purple-600" },
    { label: "In Progress", value: stats.inProgress, gradient: "from-cyan-500 to-blue-600" },
    { label: "Completed", value: stats.completed, gradient: "from-fuchsia-500 to-pink-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back,{" "}
            <span className="gradient-text">{userName ?? "there"}</span>
          </h1>
          <p className="text-white/50">Here&apos;s what&apos;s on your plate today.</p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null)
            setIsFormOpen(true)
          }}
          className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <div
              className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${stat.gradient} opacity-50`}
            />
            <p className="text-sm font-medium text-white/50">{stat.label}</p>
            <p
              className={`mt-2 text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Task list */}
      {optimisticTasks.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {optimisticTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.01] py-20"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
            <CheckSquare className="h-8 w-8 text-white/40" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-white/80">No tasks yet</h3>
          <p className="mt-1 text-sm text-white/40">
            Create your first task to get started
          </p>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="mt-6 bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </motion.div>
      )}

      {/* Task form modal */}
      <TaskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        task={editingTask}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  )
}
