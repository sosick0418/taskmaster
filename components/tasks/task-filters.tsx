"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  ChevronDown,
  Circle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Flame,
  SlidersHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Priority, TaskStatus } from "@/lib/validations/task"

export type SortOption = "newest" | "oldest" | "priority" | "dueDate" | "title"

interface TaskFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: TaskStatus[]
  onStatusFilterChange: (statuses: TaskStatus[]) => void
  priorityFilter: Priority[]
  onPriorityFilterChange: (priorities: Priority[]) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
}

const statusOptions: { value: TaskStatus; label: string; icon: typeof Circle; color: string }[] = [
  { value: "TODO", label: "To Do", icon: Circle, color: "text-slate-400" },
  { value: "IN_PROGRESS", label: "In Progress", icon: Clock, color: "text-blue-400" },
  { value: "DONE", label: "Done", icon: CheckCircle2, color: "text-emerald-400" },
]

const priorityOptions: { value: Priority; label: string; icon: typeof AlertTriangle; color: string }[] = [
  { value: "LOW", label: "Low", icon: Circle, color: "text-slate-400" },
  { value: "MEDIUM", label: "Medium", icon: AlertTriangle, color: "text-blue-400" },
  { value: "HIGH", label: "High", icon: AlertCircle, color: "text-amber-400" },
  { value: "URGENT", label: "Urgent", icon: Flame, color: "text-red-400" },
]

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "priority", label: "Priority (High → Low)" },
  { value: "dueDate", label: "Due Date" },
  { value: "title", label: "Title (A → Z)" },
]

export function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortChange,
}: TaskFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const activeFilterCount =
    (statusFilter.length < 3 ? statusFilter.length : 0) +
    (priorityFilter.length < 4 ? priorityFilter.length : 0)

  const toggleStatus = (status: TaskStatus) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter((s) => s !== status))
    } else {
      onStatusFilterChange([...statusFilter, status])
    }
  }

  const togglePriority = (priority: Priority) => {
    if (priorityFilter.includes(priority)) {
      onPriorityFilterChange(priorityFilter.filter((p) => p !== priority))
    } else {
      onPriorityFilterChange([...priorityFilter, priority])
    }
  }

  const clearFilters = () => {
    onStatusFilterChange(["TODO", "IN_PROGRESS", "DONE"])
    onPriorityFilterChange(["LOW", "MEDIUM", "HIGH", "URGENT"])
    onSearchChange("")
  }

  return (
    <div className="space-y-3">
      {/* Search and Filter Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-border bg-muted/50 placeholder:text-muted-foreground focus:border-violet-500/50 focus:ring-violet-500/20"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "cursor-pointer gap-2 border-border bg-muted/50 hover:bg-muted",
                  activeFilterCount > 0 && "border-violet-500/30 bg-violet-500/10"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full bg-violet-500 p-0 text-[10px] text-white"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-72 border-border bg-popover p-4 backdrop-blur-xl"
            >
              <div className="space-y-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground/70">Status</span>
                    <button
                      onClick={() => onStatusFilterChange(["TODO", "IN_PROGRESS", "DONE"])}
                      className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                    >
                      Select all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => {
                      const Icon = option.icon
                      const isSelected = statusFilter.includes(option.value)
                      return (
                        <button
                          key={option.value}
                          onClick={() => toggleStatus(option.value)}
                          className={cn(
                            "flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                            isSelected
                              ? "border-primary/30 bg-primary/10 text-foreground"
                              : "border-border bg-transparent text-muted-foreground hover:border-border/80 hover:text-foreground"
                          )}
                        >
                          <Icon className={cn("h-3 w-3", isSelected && option.color)} />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground/70">Priority</span>
                    <button
                      onClick={() => onPriorityFilterChange(["LOW", "MEDIUM", "HIGH", "URGENT"])}
                      className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                    >
                      Select all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {priorityOptions.map((option) => {
                      const Icon = option.icon
                      const isSelected = priorityFilter.includes(option.value)
                      return (
                        <button
                          key={option.value}
                          onClick={() => togglePriority(option.value)}
                          className={cn(
                            "flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                            isSelected
                              ? "border-primary/30 bg-primary/10 text-foreground"
                              : "border-border bg-transparent text-muted-foreground hover:border-border/80 hover:text-foreground"
                          )}
                        >
                          <Icon className={cn("h-3 w-3", isSelected && option.color)} />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Clear Button */}
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-2 border-border bg-muted/50 hover:bg-muted"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-border bg-popover backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-muted-foreground">Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={cn(
                    "cursor-pointer focus:bg-muted",
                    sortBy === option.value && "bg-primary/10 text-violet-600 dark:text-violet-400"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {(activeFilterCount > 0 || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">Active filters:</span>

            {searchQuery && (
              <Badge
                variant="secondary"
                className="gap-1 bg-muted text-foreground/70 hover:bg-muted/80"
              >
                Search: {searchQuery}
                <button
                  onClick={() => onSearchChange("")}
                  className="ml-1 cursor-pointer rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {statusFilter.length < 3 &&
              statusFilter.map((status) => {
                const option = statusOptions.find((o) => o.value === status)
                return (
                  <Badge
                    key={status}
                    variant="secondary"
                    className="gap-1 bg-muted text-foreground/70 hover:bg-muted/80"
                  >
                    {option?.label}
                    <button
                      onClick={() => toggleStatus(status)}
                      className="ml-1 cursor-pointer rounded-full hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}

            {priorityFilter.length < 4 &&
              priorityFilter.map((priority) => {
                const option = priorityOptions.find((o) => o.value === priority)
                return (
                  <Badge
                    key={priority}
                    variant="secondary"
                    className="gap-1 bg-muted text-foreground/70 hover:bg-muted/80"
                  >
                    {option?.label}
                    <button
                      onClick={() => togglePriority(priority)}
                      className="ml-1 cursor-pointer rounded-full hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}

            <button
              onClick={clearFilters}
              className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
