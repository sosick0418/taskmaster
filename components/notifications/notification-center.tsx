"use client"

import { useState, useCallback, useTransition } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bell, CheckCheck, Trash2, Settings } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { NotificationItem } from "./notification-item"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/actions/notifications"
import type { NotificationWithTask } from "@/types/notification"

interface NotificationCenterProps {
  initialNotifications: NotificationWithTask[]
  onClose: () => void
}

export function NotificationCenter({
  initialNotifications,
  onClose,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isPending, startTransition] = useTransition()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )

    startTransition(async () => {
      const result = await markAsRead(id)
      if (!result.success) {
        // Rollback on error
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
        )
      }
    })
  }, [])

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

    startTransition(async () => {
      const result = await markAllAsRead()
      if (!result.success) {
        toast.error(result.error)
      }
    })
  }, [])

  const handleDelete = useCallback((id: string) => {
    const deleted = notifications.find((n) => n.id === id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))

    startTransition(async () => {
      const result = await deleteNotification(id)
      if (!result.success) {
        // Rollback on error
        if (deleted) {
          setNotifications((prev) => [...prev, deleted].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ))
        }
        toast.error(result.error)
      }
    })
  }, [notifications])

  const handleClearAll = useCallback(() => {
    const backup = notifications
    setNotifications([])

    startTransition(async () => {
      const result = await clearAllNotifications()
      if (!result.success) {
        setNotifications(backup)
        toast.error(result.error)
      } else {
        toast.success("All notifications cleared")
      }
    })
  }, [notifications])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute right-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-xl border border-border bg-card shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-violet-500 px-2 py-0.5 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
          <Link href="/settings" onClick={onClose}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Notification list */}
      <ScrollArea className="max-h-[400px]">
        <div className="p-2">
          <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  No notifications
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  You&apos;re all caught up!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-border px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={isPending}
            className="w-full text-xs text-muted-foreground hover:text-red-500"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Clear all notifications
          </Button>
        </div>
      )}
    </motion.div>
  )
}
