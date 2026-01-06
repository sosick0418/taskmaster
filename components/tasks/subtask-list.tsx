"use client"

import { useState, useCallback, useTransition, useOptimistic } from "react"
import { AnimatePresence } from "framer-motion"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { SubtaskItem } from "./subtask-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  createSubtask,
  updateSubtask,
  toggleSubtaskComplete,
  deleteSubtask,
  reorderSubtasks,
} from "@/actions/subtasks"
import type { SubTask } from "@/types/task"

interface SubtaskListProps {
  taskId: string
  subtasks: SubTask[]
  onSubtasksChange?: (subtasks: SubTask[]) => void
}

function SortableSubtaskItem({
  subtask,
  onToggleComplete,
  onDelete,
  onUpdate,
}: {
  subtask: SubTask
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, title: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <SubtaskItem
        subtask={subtask}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onUpdate={onUpdate}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  )
}

export function SubtaskList({ taskId, subtasks: initialSubtasks, onSubtasksChange }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState(initialSubtasks)
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [isPending, startTransition] = useTransition()

  const [optimisticSubtasks, addOptimisticSubtask] = useOptimistic(
    subtasks,
    (state, action: { type: string; id?: string; subtask?: SubTask; newOrder?: SubTask[] }) => {
      switch (action.type) {
        case "add":
          return action.subtask ? [...state, action.subtask] : state
        case "toggle":
          return state.map((s) =>
            s.id === action.id ? { ...s, isCompleted: !s.isCompleted } : s
          )
        case "delete":
          return state.filter((s) => s.id !== action.id)
        case "reorder":
          return action.newOrder ?? state
        default:
          return state
      }
    }
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = optimisticSubtasks.findIndex((s) => s.id === active.id)
      const newIndex = optimisticSubtasks.findIndex((s) => s.id === over.id)

      const newOrder = arrayMove(optimisticSubtasks, oldIndex, newIndex).map(
        (s, index) => ({ ...s, order: index })
      )

      startTransition(async () => {
        addOptimisticSubtask({ type: "reorder", newOrder })
        setSubtasks(newOrder)
        onSubtasksChange?.(newOrder)

        const result = await reorderSubtasks({
          subtasks: newOrder.map((s) => ({ id: s.id, order: s.order })),
        })

        if (!result.success) {
          toast.error(result.error)
          setSubtasks(optimisticSubtasks)
        }
      })
    },
    [optimisticSubtasks, addOptimisticSubtask, onSubtasksChange]
  )

  const handleAdd = useCallback(async () => {
    const title = newTitle.trim()
    if (!title) return

    const tempId = `temp-${Date.now()}`
    const tempSubtask: SubTask = {
      id: tempId,
      title,
      isCompleted: false,
      order: subtasks.length,
      taskId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    startTransition(async () => {
      addOptimisticSubtask({ type: "add", subtask: tempSubtask })

      const result = await createSubtask({ title, taskId })
      if (result.success) {
        const newSubtask = { ...tempSubtask, id: result.data.id }
        setSubtasks((prev) => [...prev.filter((s) => s.id !== tempId), newSubtask])
        onSubtasksChange?.([...subtasks, newSubtask])
        setNewTitle("")
        setIsAdding(false)
        toast.success("Subtask added")
      } else {
        toast.error(result.error)
        setSubtasks((prev) => prev.filter((s) => s.id !== tempId))
      }
    })
  }, [newTitle, subtasks, taskId, addOptimisticSubtask, onSubtasksChange])

  const handleToggleComplete = useCallback(
    async (id: string) => {
      const subtask = subtasks.find((s) => s.id === id)
      if (!subtask) return

      // Immediate local update
      setSubtasks((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
      )

      startTransition(async () => {
        const result = await toggleSubtaskComplete(id)
        if (!result.success) {
          // Rollback on error
          setSubtasks((prev) =>
            prev.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
          )
          toast.error(result.error)
        } else {
          const updated = subtasks.map((s) =>
            s.id === id ? { ...s, isCompleted: !s.isCompleted } : s
          )
          onSubtasksChange?.(updated)
        }
      })
    },
    [subtasks, onSubtasksChange]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      const deletedSubtask = subtasks.find((s) => s.id === id)

      // Immediate local update
      setSubtasks((prev) => prev.filter((s) => s.id !== id))

      startTransition(async () => {
        addOptimisticSubtask({ type: "delete", id })

        const result = await deleteSubtask(id)
        if (result.success) {
          const updated = subtasks.filter((s) => s.id !== id)
          onSubtasksChange?.(updated)
          toast.success("Subtask deleted")
        } else {
          // Rollback on error
          if (deletedSubtask) {
            setSubtasks((prev) => [...prev, deletedSubtask].sort((a, b) => a.order - b.order))
          }
          toast.error(result.error)
        }
      })
    },
    [subtasks, addOptimisticSubtask, onSubtasksChange]
  )

  const handleUpdate = useCallback(
    async (id: string, title: string) => {
      const originalSubtask = subtasks.find((s) => s.id === id)
      if (!originalSubtask) return

      // Immediate local update
      setSubtasks((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title } : s))
      )

      startTransition(async () => {
        const result = await updateSubtask({ id, title })
        if (result.success) {
          const updated = subtasks.map((s) => (s.id === id ? { ...s, title } : s))
          onSubtasksChange?.(updated)
        } else {
          // Rollback on error
          setSubtasks((prev) =>
            prev.map((s) => (s.id === id ? { ...s, title: originalSubtask.title } : s))
          )
          toast.error(result.error)
        }
      })
    },
    [subtasks, onSubtasksChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleAdd()
      } else if (e.key === "Escape") {
        setIsAdding(false)
        setNewTitle("")
      }
    },
    [handleAdd]
  )

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={optimisticSubtasks.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {optimisticSubtasks.map((subtask) => (
              <SortableSubtaskItem
                key={subtask.id}
                subtask={subtask}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {/* Add subtask input */}
      {isAdding ? (
        <div className="flex items-center gap-2 px-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTitle.trim()) {
                setIsAdding(false)
              }
            }}
            placeholder="Add subtask..."
            className="h-8 flex-1 text-sm"
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAdd}
            disabled={!newTitle.trim() || isPending}
            className="h-8"
          >
            Add
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add subtask
        </Button>
      )}
    </div>
  )
}
