import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AnimatedCheckbox, CircularCheckbox } from "@/components/shared/animated-checkbox"

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    button: ({
      children,
      onClick,
      disabled,
      className,
      ...props
    }: React.PropsWithChildren<{
      onClick?: () => void
      disabled?: boolean
      className?: string
    }>) => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        data-testid="motion-button"
        {...props}
      >
        {children}
      </button>
    ),
    path: (props: Record<string, unknown>) => <path {...props} />,
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    svg: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <svg {...props}>{children}</svg>
    ),
  },
}))

describe("AnimatedCheckbox", () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders checkbox button", () => {
    render(<AnimatedCheckbox checked={false} onChange={mockOnChange} />)
    expect(screen.getByTestId("motion-button")).toBeInTheDocument()
  })

  it("calls onChange when clicked", () => {
    render(<AnimatedCheckbox checked={false} onChange={mockOnChange} />)
    fireEvent.click(screen.getByTestId("motion-button"))
    expect(mockOnChange).toHaveBeenCalled()
  })

  it("does not call onChange when disabled", () => {
    render(<AnimatedCheckbox checked={false} onChange={mockOnChange} disabled />)
    const button = screen.getByTestId("motion-button")
    fireEvent.click(button)
    // Disabled button should not fire click
    expect(button).toBeDisabled()
  })

  it("applies checked styles when checked", () => {
    render(<AnimatedCheckbox checked={true} onChange={mockOnChange} />)
    const button = screen.getByTestId("motion-button")
    expect(button).toHaveClass("border-violet-500")
  })

  it("applies unchecked styles when not checked", () => {
    render(<AnimatedCheckbox checked={false} onChange={mockOnChange} />)
    const button = screen.getByTestId("motion-button")
    expect(button).toHaveClass("border-muted-foreground/40")
  })

  it("applies disabled styles when disabled", () => {
    render(<AnimatedCheckbox checked={false} onChange={mockOnChange} disabled />)
    const button = screen.getByTestId("motion-button")
    expect(button).toHaveClass("cursor-not-allowed", "opacity-50")
  })

  it("applies custom className", () => {
    render(
      <AnimatedCheckbox checked={false} onChange={mockOnChange} className="custom-class" />
    )
    const button = screen.getByTestId("motion-button")
    expect(button).toHaveClass("custom-class")
  })
})

describe("CircularCheckbox", () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders checkbox button", () => {
    render(<CircularCheckbox checked={false} onChange={mockOnChange} />)
    expect(screen.getByTestId("motion-button")).toBeInTheDocument()
  })

  it("calls onChange when clicked", () => {
    render(<CircularCheckbox checked={false} onChange={mockOnChange} />)
    fireEvent.click(screen.getByTestId("motion-button"))
    expect(mockOnChange).toHaveBeenCalled()
  })

  it("does not call onChange when disabled", () => {
    render(<CircularCheckbox checked={false} onChange={mockOnChange} disabled />)
    const button = screen.getByTestId("motion-button")
    expect(button).toBeDisabled()
  })

  it("applies checked styles when checked", () => {
    render(<CircularCheckbox checked={true} onChange={mockOnChange} />)
    const button = screen.getByTestId("motion-button")
    expect(button).toHaveClass("border-transparent")
  })

  it("applies unchecked styles when not checked", () => {
    render(<CircularCheckbox checked={false} onChange={mockOnChange} />)
    const button = screen.getByTestId("motion-button")
    expect(button).toHaveClass("border-muted-foreground/30")
  })

  it("applies sm size by default when size is sm", () => {
    render(<CircularCheckbox checked={false} onChange={mockOnChange} size="sm" />)
    const button = screen.getByTestId("motion-button")
    expect(button).toHaveClass("h-4", "w-4")
  })

  it("applies md size when size is md", () => {
    render(<CircularCheckbox checked={false} onChange={mockOnChange} size="md" />)
    const button = screen.getByTestId("motion-button")
    expect(button).toHaveClass("h-6", "w-6")
  })

  it("applies disabled styles when disabled", () => {
    render(<CircularCheckbox checked={false} onChange={mockOnChange} disabled />)
    const button = screen.getByTestId("motion-button")
    expect(button).toHaveClass("cursor-not-allowed", "opacity-50")
  })

  it("applies custom className", () => {
    render(
      <CircularCheckbox checked={false} onChange={mockOnChange} className="custom-class" />
    )
    const button = screen.getByTestId("motion-button")
    expect(button).toHaveClass("custom-class")
  })
})
