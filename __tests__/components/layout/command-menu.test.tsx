import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CommandMenu } from "@/components/layout/command-menu"

// Mock next/navigation
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock next-themes
const mockSetTheme = vi.fn()
vi.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: "light",
  }),
}))

// Mock UI components
vi.mock("@/components/ui/command", () => ({
  CommandDialog: ({ children, open }: React.PropsWithChildren<{ open: boolean }>) =>
    open ? <div data-testid="command-dialog">{children}</div> : null,
  CommandEmpty: ({ children }: React.PropsWithChildren) => (
    <div data-testid="command-empty">{children}</div>
  ),
  CommandGroup: ({ children, heading }: React.PropsWithChildren<{ heading: string }>) => (
    <div data-testid={`command-group-${heading}`}>
      <span>{heading}</span>
      {children}
    </div>
  ),
  CommandInput: ({ placeholder }: { placeholder: string }) => (
    <input data-testid="command-input" placeholder={placeholder} />
  ),
  CommandItem: ({
    children,
    onSelect,
  }: React.PropsWithChildren<{ onSelect: () => void }>) => (
    <button data-testid="command-item" onClick={onSelect}>
      {children}
    </button>
  ),
  CommandList: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CommandSeparator: () => <hr />,
}))

describe("CommandMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders nothing when closed", () => {
    const { container } = render(
      <CommandMenu open={false} onOpenChange={vi.fn()} />
    )
    expect(container.querySelector("[data-testid='command-dialog']")).not.toBeInTheDocument()
  })

  it("renders dialog when open", () => {
    render(<CommandMenu open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByTestId("command-dialog")).toBeInTheDocument()
  })

  it("renders search input", () => {
    render(<CommandMenu open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByTestId("command-input")).toBeInTheDocument()
  })

  it("renders Quick Actions group", () => {
    render(<CommandMenu open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByTestId("command-group-Quick Actions")).toBeInTheDocument()
  })

  it("renders Navigation group", () => {
    render(<CommandMenu open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByTestId("command-group-Navigation")).toBeInTheDocument()
  })

  it("renders Theme group", () => {
    render(<CommandMenu open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByTestId("command-group-Theme")).toBeInTheDocument()
  })

  it("renders Create new task item", () => {
    render(<CommandMenu open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText("Create new task")).toBeInTheDocument()
  })

  it("renders navigation items", () => {
    render(<CommandMenu open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Tasks")).toBeInTheDocument()
    expect(screen.getByText("Settings")).toBeInTheDocument()
  })

  it("renders theme items", () => {
    render(<CommandMenu open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText("Light mode")).toBeInTheDocument()
    expect(screen.getByText("Dark mode")).toBeInTheDocument()
  })

  it("toggles menu on Cmd+K keyboard shortcut", () => {
    const onOpenChange = vi.fn()
    render(<CommandMenu open={false} onOpenChange={onOpenChange} />)

    fireEvent.keyDown(document, { key: "k", metaKey: true })
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it("toggles menu on Ctrl+K keyboard shortcut", () => {
    const onOpenChange = vi.fn()
    render(<CommandMenu open={false} onOpenChange={onOpenChange} />)

    fireEvent.keyDown(document, { key: "k", ctrlKey: true })
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it("navigates to tasks with new param when Create new task is clicked", () => {
    const onOpenChange = vi.fn()
    render(<CommandMenu open={true} onOpenChange={onOpenChange} />)

    const items = screen.getAllByTestId("command-item")
    fireEvent.click(items[0]!) // Create new task
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mockPush).toHaveBeenCalledWith("/tasks?new=true")
  })

  it("navigates to settings when Settings is clicked", () => {
    const onOpenChange = vi.fn()
    render(<CommandMenu open={true} onOpenChange={onOpenChange} />)

    const settingsItem = screen.getByText("Settings").closest("button")
    fireEvent.click(settingsItem!)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mockPush).toHaveBeenCalledWith("/settings")
  })

  it("sets light theme when Light mode is clicked", () => {
    const onOpenChange = vi.fn()
    render(<CommandMenu open={true} onOpenChange={onOpenChange} />)

    const lightModeItem = screen.getByText("Light mode").closest("button")
    fireEvent.click(lightModeItem!)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })

  it("sets dark theme when Dark mode is clicked", () => {
    const onOpenChange = vi.fn()
    render(<CommandMenu open={true} onOpenChange={onOpenChange} />)

    const darkModeItem = screen.getByText("Dark mode").closest("button")
    fireEvent.click(darkModeItem!)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })
})
