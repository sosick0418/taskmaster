import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { NotificationItem } from "@/components/notifications/notification-item"
import type { NotificationWithTask } from "@/types/notification"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, onClick, className, ...props }: React.PropsWithChildren<{
      onClick?: () => void
      className?: string
    }>) => (
      <div onClick={onClick} className={className} {...props}>{children}</div>
    ),
  },
}))

const mockNotification: NotificationWithTask = {
  id: "notif-1",
  userId: "user-1",
  type: "DUE_DATE_REMINDER",
  title: "Task due soon",
  message: "Your task 'Complete project' is due tomorrow",
  isRead: false,
  taskId: "task-1",
  task: { id: "task-1", title: "Complete project" },
  createdAt: new Date(),
}

const mockHandlers = {
  onMarkAsRead: vi.fn(),
  onDelete: vi.fn(),
}

describe("NotificationItem", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders notification title", () => {
    render(<NotificationItem notification={mockNotification} {...mockHandlers} />)
    expect(screen.getByText("Task due soon")).toBeInTheDocument()
  })

  it("renders notification message", () => {
    render(<NotificationItem notification={mockNotification} {...mockHandlers} />)
    expect(screen.getByText("Your task 'Complete project' is due tomorrow")).toBeInTheDocument()
  })

  it("renders View task link when task exists", () => {
    render(<NotificationItem notification={mockNotification} {...mockHandlers} />)
    expect(screen.getByText("View task")).toBeInTheDocument()
  })

  it("does not render View task link when task is null", () => {
    const noTaskNotif = { ...mockNotification, task: null }
    render(<NotificationItem notification={noTaskNotif} {...mockHandlers} />)
    expect(screen.queryByText("View task")).not.toBeInTheDocument()
  })

  it("calls onMarkAsRead when clicked for unread notification", () => {
    render(<NotificationItem notification={mockNotification} {...mockHandlers} />)
    const item = screen.getByText("Task due soon").closest("div[class*='cursor-pointer']")
    fireEvent.click(item!)
    expect(mockHandlers.onMarkAsRead).toHaveBeenCalledWith("notif-1")
  })

  it("does not call onMarkAsRead when clicked for already read notification", () => {
    const readNotif = { ...mockNotification, isRead: true }
    render(<NotificationItem notification={readNotif} {...mockHandlers} />)
    const item = screen.getByText("Task due soon").closest("div[class*='cursor-pointer']")
    fireEvent.click(item!)
    expect(mockHandlers.onMarkAsRead).not.toHaveBeenCalled()
  })

  it("calls onDelete when delete button is clicked", () => {
    render(<NotificationItem notification={mockNotification} {...mockHandlers} />)
    const deleteButton = screen.getByRole("button")
    fireEvent.click(deleteButton)
    expect(mockHandlers.onDelete).toHaveBeenCalledWith("notif-1")
  })

  it("renders unread indicator for unread notifications", () => {
    const { container } = render(
      <NotificationItem notification={mockNotification} {...mockHandlers} />
    )
    const indicator = container.querySelector(".bg-violet-500.rounded-full")
    expect(indicator).toBeInTheDocument()
  })

  it("does not render unread indicator for read notifications", () => {
    const readNotif = { ...mockNotification, isRead: true }
    const { container } = render(
      <NotificationItem notification={readNotif} {...mockHandlers} />
    )
    const indicator = container.querySelector(".bg-violet-500.rounded-full.h-2")
    expect(indicator).not.toBeInTheDocument()
  })

  it("renders with correct icon for DUE_DATE_REMINDER type", () => {
    render(<NotificationItem notification={mockNotification} {...mockHandlers} />)
    // Icon should be in a blue bg container
    const iconContainer = document.querySelector(".bg-blue-500\\/10")
    expect(iconContainer).toBeInTheDocument()
  })

  it("renders with correct icon for TASK_OVERDUE type", () => {
    const overdueNotif = { ...mockNotification, type: "TASK_OVERDUE" as const }
    render(<NotificationItem notification={overdueNotif} {...mockHandlers} />)
    const iconContainer = document.querySelector(".bg-red-500\\/10")
    expect(iconContainer).toBeInTheDocument()
  })

  it("renders with correct icon for TASK_COMPLETED type", () => {
    const completedNotif = { ...mockNotification, type: "TASK_COMPLETED" as const }
    render(<NotificationItem notification={completedNotif} {...mockHandlers} />)
    const iconContainer = document.querySelector(".bg-emerald-500\\/10")
    expect(iconContainer).toBeInTheDocument()
  })

  it("applies different styles for read vs unread notifications", () => {
    const { rerender, container } = render(
      <NotificationItem notification={mockNotification} {...mockHandlers} />
    )
    const unreadItem = container.firstChild as HTMLElement
    expect(unreadItem).toHaveClass("bg-muted/30")

    const readNotif = { ...mockNotification, isRead: true }
    rerender(<NotificationItem notification={readNotif} {...mockHandlers} />)
    const readItem = container.firstChild as HTMLElement
    expect(readItem).toHaveClass("bg-transparent")
  })
})
