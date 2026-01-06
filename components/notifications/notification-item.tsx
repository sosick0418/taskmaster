"use client"

import { useCallback } from "react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import {
  Bell,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { NotificationWithTask, NotificationType } from "@/types/notification"

interface NotificationItemProps {
  notification: NotificationWithTask
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

const typeConfig: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bgColor: string }
> = {
  DUE_DATE_REMINDER: {
    icon: Calendar,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  TASK_OVERDUE: {
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  DAILY_DIGEST: {
    icon: Bell,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  TASK_COMPLETED: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  SYSTEM: {
    icon: Info,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const config = typeConfig[notification.type]
  const Icon = config.icon

  const handleClick = useCallback(() => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
  }, [notification.id, notification.isRead, onMarkAsRead])

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete(notification.id)
    },
    [notification.id, onDelete]
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      onClick={handleClick}
      className={cn(
        "group relative flex cursor-pointer gap-3 rounded-lg p-3 transition-colors",
        notification.isRead
          ? "bg-transparent hover:bg-muted/50"
          : "bg-muted/30 hover:bg-muted/50"
      )}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-violet-500" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          config.bgColor
        )}
      >
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            notification.isRead ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs text-muted-foreground/70">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>
          {notification.task && (
            <a
              href={`/tasks`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-violet-500 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View task
            </a>
          )}
        </div>
      </div>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleDelete}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}
