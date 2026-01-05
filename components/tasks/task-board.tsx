"use client"

import { useState, useMemo, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { TaskColumn } from "./task-column"
import { TaskCard } from "./task-card"
import type { Task } from "@/types/task"
import type { TaskStatus } from "@/lib/validations/task"

interface TaskBoardProps {
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: TaskStatus, newOrder: number) => void
  onToggleComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onAddTask: (status: TaskStatus) => void
}

const columns: { id: TaskStatus; title: string }[] = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
]

export function TaskBoard({
  tasks,
  onTaskMove,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddTask,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    }

    tasks.forEach((task) => {
      grouped[task.status].push(task)
    })

    // Sort by order within each group
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort((a, b) => a.order - b.order)
    })

    return grouped
  }, [tasks])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }, [tasks])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the active task
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Check if we're dragging over a column
    const isOverColumn = columns.some((col) => col.id === overId)
    if (isOverColumn) {
      const newStatus = overId as TaskStatus
      if (activeTask.status !== newStatus) {
        // Task is being dragged to a different column
        const tasksInNewColumn = tasksByStatus[newStatus]
        const newOrder = tasksInNewColumn.length
        onTaskMove(activeId, newStatus, newOrder)
      }
    }
  }, [tasks, tasksByStatus, onTaskMove])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = tasks.find((t) => t.id === activeId)
    const overTask = tasks.find((t) => t.id === overId)

    if (!activeTask) return

    // If dropping on another task in the same column, reorder
    if (overTask && activeTask.status === overTask.status) {
      const columnTasks = tasksByStatus[activeTask.status]
      const activeIndex = columnTasks.findIndex((t) => t.id === activeId)
      const overIndex = columnTasks.findIndex((t) => t.id === overId)

      if (activeIndex !== overIndex) {
        const newOrder = overIndex
        onTaskMove(activeId, activeTask.status, newOrder)
      }
    }
    // If dropping on a column, move to end of that column
    else if (columns.some((col) => col.id === overId)) {
      const newStatus = overId as TaskStatus
      const tasksInNewColumn = tasksByStatus[newStatus]
      const newOrder = tasksInNewColumn.length
      onTaskMove(activeId, newStatus, newOrder)
    }
  }, [tasks, tasksByStatus, onTaskMove])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid h-[calc(100vh-24rem)] grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasksByStatus[column.id]}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 scale-105">
            <TaskCard
              task={activeTask}
              onToggleComplete={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
