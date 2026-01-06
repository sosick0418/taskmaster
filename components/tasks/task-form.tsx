"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { CalendarIcon, Loader2, X, Plus, Sparkles, ListTodo } from "lucide-react"
import { cn } from "@/lib/utils"
import { z } from "zod"
import type { Priority, TaskStatus } from "@/lib/validations/task"
import type { SubTask } from "@/types/task"
import { SubtaskList } from "./subtask-list"

// Local form schema with explicit types
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.date().optional(),
  tags: z.array(z.string()),
})

type FormData = z.infer<typeof formSchema>
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TaskFormData {
  id?: string
  title: string
  description?: string | null
  priority: Priority
  status: TaskStatus
  dueDate?: Date | null
  tags: { id: number; name: string }[]
  subtasks?: SubTask[]
}

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TaskFormData | null
  onSubmit: (data: FormData & { id?: string }) => Promise<void>
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: "LOW", label: "Low", color: "text-slate-400" },
  { value: "MEDIUM", label: "Medium", color: "text-blue-400" },
  { value: "HIGH", label: "High", color: "text-amber-400" },
  { value: "URGENT", label: "Urgent", color: "text-red-400" },
]

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
]

export function TaskForm({ open, onOpenChange, task, onSubmit }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])

  const isEditing = !!task?.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
      tags: [],
    },
  })

  const selectedDate = watch("dueDate")
  const selectedPriority = watch("priority")
  const selectedStatus = watch("status")

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      const taskTags = task.tags?.map((t) => t.name) ?? []
      reset({
        title: task.title ?? "",
        description: task.description ?? "",
        priority: task.priority ?? "MEDIUM",
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        tags: taskTags,
      })
      setTags(taskTags)
    } else {
      reset({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        tags: [],
      })
      setTags([])
    }
  }, [task, reset])

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed]
      setTags(newTags)
      setValue("tags", newTags)
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove)
    setTags(newTags)
    setValue("tags", newTags)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const onFormSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const submitData = task?.id ? { ...data, id: task.id } : data
      await onSubmit(submitData)
      onOpenChange(false)
      reset()
      setTags([])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-background/95 backdrop-blur-2xl sm:max-w-lg dark:bg-black/95">
        {/* Gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-cyan-500/50" />

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {isEditing ? "Edit Task" : "Create Task"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Update your task details below."
              : "Add a new task to your list."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground/70">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              className="border-border bg-muted/50 placeholder:text-muted-foreground/50 focus:border-violet-500/50 focus:ring-violet-500/20"
              {...register("title")}
            />
            {errors.title && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400"
              >
                {errors.title.message}
              </motion.p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground/70">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              className="min-h-[80px] resize-none border-border bg-muted/50 placeholder:text-muted-foreground/50 focus:border-violet-500/50 focus:ring-violet-500/20"
              {...register("description")}
            />
          </div>

          {/* Priority & Status row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-foreground/70">Priority</Label>
              <Select
                value={selectedPriority}
                onValueChange={(value) => setValue("priority", value as Priority)}
              >
                <SelectTrigger className="border-border bg-muted/50 focus:ring-violet-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover backdrop-blur-xl">
                  {priorityOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={cn("cursor-pointer focus:bg-muted", option.color)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-foreground/70">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue("status", value as TaskStatus)}
              >
                <SelectTrigger className="border-border bg-muted/50 focus:ring-violet-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover backdrop-blur-xl">
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer focus:bg-muted"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-foreground/70">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full cursor-pointer justify-start border-border bg-muted/50 text-left font-normal hover:bg-muted",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto border-border bg-popover p-0 backdrop-blur-xl"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setValue("dueDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-foreground/70">Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-border bg-muted/50 placeholder:text-muted-foreground/50 focus:border-violet-500/50 focus:ring-violet-500/20"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTag}
                className="shrink-0 cursor-pointer border-border bg-muted/50 hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <AnimatePresence>
              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {tags.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-600 dark:text-violet-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 cursor-pointer rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtasks - only show when editing */}
          {isEditing && task?.id && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground/70">
                <ListTodo className="h-4 w-4" />
                Subtasks
              </Label>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <SubtaskList
                  taskId={task.id}
                  subtasks={task.subtasks ?? []}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
