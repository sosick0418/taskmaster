"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { Bell, Clock, Calendar, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateNotificationPreferences } from "@/actions/notifications"
import type { NotificationPreference } from "@/types/notification"

interface NotificationSettingsProps {
  initialPreferences: NotificationPreference
}

export function NotificationSettings({
  initialPreferences,
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (key: keyof NotificationPreference, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)

    startTransition(async () => {
      const result = await updateNotificationPreferences({ [key]: value })
      if (!result.success) {
        setPreferences(preferences)
        toast.error(result.error)
      } else {
        toast.success("Settings updated")
      }
    })
  }

  const handleReminderDaysChange = (value: string) => {
    const days = parseInt(value, 10)
    const newPrefs = { ...preferences, reminderDaysBefore: days }
    setPreferences(newPrefs)

    startTransition(async () => {
      const result = await updateNotificationPreferences({
        reminderDaysBefore: days,
      })
      if (!result.success) {
        setPreferences(preferences)
        toast.error(result.error)
      } else {
        toast.success("Settings updated")
      }
    })
  }

  const handleDigestTimeChange = (value: string) => {
    const newPrefs = { ...preferences, digestTime: value }
    setPreferences(newPrefs)

    startTransition(async () => {
      const result = await updateNotificationPreferences({ digestTime: value })
      if (!result.success) {
        setPreferences(preferences)
        toast.error(result.error)
      } else {
        toast.success("Settings updated")
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* In-app Notifications */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
            <Bell className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <Label htmlFor="inAppEnabled" className="text-base font-medium">
              In-app Notifications
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Receive notifications within the application
            </p>
          </div>
        </div>
        <Switch
          id="inAppEnabled"
          checked={preferences.inAppEnabled}
          onCheckedChange={(checked) => handleToggle("inAppEnabled", checked)}
          disabled={isPending}
        />
      </div>

      {/* Due Date Reminders */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <Label htmlFor="dueDateReminder" className="text-base font-medium">
              Due Date Reminders
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Get reminded before tasks are due
            </p>
          </div>
        </div>
        <Switch
          id="dueDateReminder"
          checked={preferences.dueDateReminder}
          onCheckedChange={(checked) => handleToggle("dueDateReminder", checked)}
          disabled={isPending || !preferences.inAppEnabled}
        />
      </div>

      {/* Reminder Days Before */}
      {preferences.dueDateReminder && preferences.inAppEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="ml-[52px]"
        >
          <div className="flex items-center gap-3">
            <Label htmlFor="reminderDays" className="text-sm text-muted-foreground">
              Remind me
            </Label>
            <Select
              value={preferences.reminderDaysBefore.toString()}
              onValueChange={handleReminderDaysChange}
              disabled={isPending}
            >
              <SelectTrigger id="reminderDays" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day before</SelectItem>
                <SelectItem value="2">2 days before</SelectItem>
                <SelectItem value="3">3 days before</SelectItem>
                <SelectItem value="5">5 days before</SelectItem>
                <SelectItem value="7">1 week before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {/* Daily Digest */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <Sparkles className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <Label htmlFor="dailyDigest" className="text-base font-medium">
              Daily Digest
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Receive a daily summary of your tasks
            </p>
          </div>
        </div>
        <Switch
          id="dailyDigest"
          checked={preferences.dailyDigest}
          onCheckedChange={(checked) => handleToggle("dailyDigest", checked)}
          disabled={isPending || !preferences.inAppEnabled}
        />
      </div>

      {/* Digest Time */}
      {preferences.dailyDigest && preferences.inAppEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="ml-[52px]"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="digestTime" className="text-sm text-muted-foreground">
              Send at
            </Label>
            <Select
              value={preferences.digestTime ?? "09:00"}
              onValueChange={handleDigestTimeChange}
              disabled={isPending}
            >
              <SelectTrigger id="digestTime" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="06:00">6:00 AM</SelectItem>
                <SelectItem value="07:00">7:00 AM</SelectItem>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="12:00">12:00 PM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
                <SelectItem value="20:00">8:00 PM</SelectItem>
                <SelectItem value="21:00">9:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
