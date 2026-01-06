"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { GripVertical, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { CircularCheckbox } from "@/components/shared/animated-checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SubTask } from "@/types/task"

interface SubtaskItemProps {
  subtask: SubTask
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, title: string) => void
  dragHandleProps?: Record<string, unknown>
  isDragging?: boolean
}

export function SubtaskItem({
  subtask,
  onToggleComplete,
  onDelete,
  onUpdate,
  dragHandleProps,
  isDragging = false,
}: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(subtask.title)
  const [isHovered, setIsHovered] = useState(false)

  const handleToggle = useCallback(() => {
    onToggleComplete(subtask.id)
  }, [subtask.id, onToggleComplete])

  const handleDelete = useCallback(() => {
    onDelete(subtask.id)
  }, [subtask.id, onDelete])

  const handleDoubleClick = useCallback(() => {
    if (!subtask.isCompleted) {
      setIsEditing(true)
      setEditValue(subtask.title)
    }
  }, [subtask.isCompleted, subtask.title])

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== subtask.title) {
      onUpdate(subtask.id, trimmed)
    }
    setIsEditing(false)
  }, [editValue, subtask.id, subtask.title, onUpdate])

  const handleCancel = useCallback(() => {
    setEditValue(subtask.title)
    setIsEditing(false)
  }, [subtask.title])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave()
      } else if (e.key === "Escape") {
        handleCancel()
      }
    },
    [handleSave, handleCancel]
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: isDragging ? 1.02 : 1,
      }}
      exit={{ opacity: 0, x: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
        "hover:bg-muted/50",
        isDragging && "bg-muted shadow-md"
      )}
    >
      {/* Drag handle */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="cursor-grab text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Checkbox */}
      <CircularCheckbox
        checked={subtask.isCompleted}
        onChange={handleToggle}
        size="sm"
      />

      {/* Content */}
      {isEditing ? (
        <div className="flex flex-1 items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-7 flex-1 text-sm"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className={cn(
            "flex-1 cursor-default text-sm transition-colors",
            subtask.isCompleted
              ? "text-muted-foreground line-through decoration-emerald-500/70"
              : "text-foreground"
          )}
        >
          {subtask.title}
        </span>
      )}

      {/* Delete button */}
      {isHovered && !isEditing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:bg-red-500/20 hover:text-red-500"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
