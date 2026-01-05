"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/[0.05]",
        className
      )}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ translateX: ["100%", "-100%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}

export function TaskCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm"
    >
      <div className="flex items-start gap-4">
        {/* Checkbox skeleton */}
        <Skeleton className="h-5 w-5 rounded-md" />

        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <Skeleton className="h-5 w-3/4" />

          {/* Description skeleton */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />

          {/* Tags and meta skeleton */}
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-10 w-16" />
    </div>
  )
}

export function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  )
}

export function KanbanColumnSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
      {/* Column header skeleton */}
      <div className="border-b border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="flex-1 space-y-3 p-3">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  )
}

export function KanbanBoardSkeleton() {
  return (
    <div className="grid h-[calc(100vh-24rem)] grid-cols-1 gap-4 md:grid-cols-3">
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
    </div>
  )
}
