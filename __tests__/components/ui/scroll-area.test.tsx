import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

// Mock @radix-ui/react-scroll-area
vi.mock("@radix-ui/react-scroll-area", () => ({
  Root: vi.fn(({ children, className, ...props }) => (
    <div data-testid="scroll-area-root" className={className} {...props}>
      {children}
    </div>
  )),
  Viewport: vi.fn(({ children, className, ...props }) => (
    <div data-testid="scroll-area-viewport" className={className} {...props}>
      {children}
    </div>
  )),
  ScrollAreaScrollbar: vi.fn(({ children, className, orientation, ...props }) => (
    <div
      data-testid="scroll-area-scrollbar"
      data-orientation={orientation}
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  ScrollAreaThumb: vi.fn(({ className, ...props }) => (
    <div data-testid="scroll-area-thumb" className={className} {...props} />
  )),
  Corner: vi.fn((props) => <div data-testid="scroll-area-corner" {...props} />),
}))

describe("ScrollArea", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("rendering", () => {
    it("renders children correctly", () => {
      render(
        <ScrollArea>
          <div data-testid="child-content">Test Content</div>
        </ScrollArea>
      )

      expect(screen.getByTestId("child-content")).toBeInTheDocument()
      expect(screen.getByText("Test Content")).toBeInTheDocument()
    })

    it("renders scroll area root element", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const root = screen.getByTestId("scroll-area-root")
      expect(root).toBeInTheDocument()
    })

    it("renders viewport element", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const viewport = screen.getByTestId("scroll-area-viewport")
      expect(viewport).toBeInTheDocument()
    })

    it("renders scrollbar by default", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toBeInTheDocument()
    })

    it("renders corner element", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const corner = screen.getByTestId("scroll-area-corner")
      expect(corner).toBeInTheDocument()
    })

    it("renders thumb inside scrollbar", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const thumb = screen.getByTestId("scroll-area-thumb")
      expect(thumb).toBeInTheDocument()
    })
  })

  describe("data-slot attributes", () => {
    it("applies data-slot attribute to root", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const root = screen.getByTestId("scroll-area-root")
      expect(root).toHaveAttribute("data-slot", "scroll-area")
    })

    it("applies data-slot attribute to viewport", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const viewport = screen.getByTestId("scroll-area-viewport")
      expect(viewport).toHaveAttribute("data-slot", "scroll-area-viewport")
    })
  })

  describe("className handling", () => {
    it("applies default relative class to root", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const root = screen.getByTestId("scroll-area-root")
      expect(root).toHaveClass("relative")
    })

    it("merges custom className with default classes", () => {
      render(<ScrollArea className="custom-class h-full">Content</ScrollArea>)

      const root = screen.getByTestId("scroll-area-root")
      expect(root).toHaveClass("relative")
      expect(root).toHaveClass("custom-class")
      expect(root).toHaveClass("h-full")
    })

    it("allows className to override default styles via cn utility", () => {
      render(<ScrollArea className="absolute">Content</ScrollArea>)

      const root = screen.getByTestId("scroll-area-root")
      // cn() from tailwind-merge should handle conflicting classes
      expect(root.className).toContain("absolute")
    })
  })

  describe("viewport styling", () => {
    it("applies viewport classes for full size", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const viewport = screen.getByTestId("scroll-area-viewport")
      expect(viewport).toHaveClass("size-full")
    })

    it("applies rounded-inherit for border radius inheritance", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const viewport = screen.getByTestId("scroll-area-viewport")
      expect(viewport).toHaveClass("rounded-[inherit]")
    })

    it("applies focus-visible ring styles", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const viewport = screen.getByTestId("scroll-area-viewport")
      expect(viewport).toHaveClass("focus-visible:ring-ring/50")
      expect(viewport).toHaveClass("focus-visible:ring-[3px]")
      expect(viewport).toHaveClass("focus-visible:outline-1")
    })

    it("applies outline-none for default state", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const viewport = screen.getByTestId("scroll-area-viewport")
      expect(viewport).toHaveClass("outline-none")
    })

    it("applies transition for smooth state changes", () => {
      render(<ScrollArea>Content</ScrollArea>)

      const viewport = screen.getByTestId("scroll-area-viewport")
      expect(viewport).toHaveClass("transition-[color,box-shadow]")
    })
  })

  describe("props forwarding", () => {
    it("forwards additional props to root element", () => {
      render(
        <ScrollArea data-custom="value" aria-label="Scrollable area">
          Content
        </ScrollArea>
      )

      const root = screen.getByTestId("scroll-area-root")
      expect(root).toHaveAttribute("data-custom", "value")
      expect(root).toHaveAttribute("aria-label", "Scrollable area")
    })

    it("forwards id prop to root element", () => {
      render(<ScrollArea id="my-scroll-area">Content</ScrollArea>)

      const root = screen.getByTestId("scroll-area-root")
      expect(root).toHaveAttribute("id", "my-scroll-area")
    })
  })

  describe("with multiple children", () => {
    it("renders multiple children correctly", () => {
      render(
        <ScrollArea>
          <div data-testid="first">First</div>
          <div data-testid="second">Second</div>
          <div data-testid="third">Third</div>
        </ScrollArea>
      )

      expect(screen.getByTestId("first")).toBeInTheDocument()
      expect(screen.getByTestId("second")).toBeInTheDocument()
      expect(screen.getByTestId("third")).toBeInTheDocument()
    })

    it("renders nested scroll areas", () => {
      render(
        <ScrollArea data-testid="outer">
          <div>Outer Content</div>
          <ScrollArea data-testid="inner">
            <div>Inner Content</div>
          </ScrollArea>
        </ScrollArea>
      )

      expect(screen.getByText("Outer Content")).toBeInTheDocument()
      expect(screen.getByText("Inner Content")).toBeInTheDocument()
    })
  })

  describe("with complex content", () => {
    it("renders lists correctly", () => {
      render(
        <ScrollArea>
          <ul>
            {[1, 2, 3, 4, 5].map((item) => (
              <li key={item} data-testid={`item-${item}`}>
                Item {item}
              </li>
            ))}
          </ul>
        </ScrollArea>
      )

      expect(screen.getByTestId("item-1")).toBeInTheDocument()
      expect(screen.getByTestId("item-5")).toBeInTheDocument()
    })

    it("renders long content that would trigger scrolling", () => {
      const longContent = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`).join("\n")

      render(
        <ScrollArea>
          <pre>{longContent}</pre>
        </ScrollArea>
      )

      expect(screen.getByText(/Line 1/)).toBeInTheDocument()
      expect(screen.getByText(/Line 100/)).toBeInTheDocument()
    })
  })
})

describe("ScrollBar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("rendering", () => {
    it("renders scrollbar element", () => {
      render(<ScrollBar />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toBeInTheDocument()
    })

    it("renders thumb inside scrollbar", () => {
      render(<ScrollBar />)

      const thumb = screen.getByTestId("scroll-area-thumb")
      expect(thumb).toBeInTheDocument()
    })
  })

  describe("data-slot attribute", () => {
    it("applies data-slot to scrollbar", () => {
      render(<ScrollBar />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveAttribute("data-slot", "scroll-area-scrollbar")
    })

    it("applies data-slot to thumb", () => {
      render(<ScrollBar />)

      const thumb = screen.getByTestId("scroll-area-thumb")
      expect(thumb).toHaveAttribute("data-slot", "scroll-area-thumb")
    })
  })

  describe("orientation", () => {
    it("defaults to vertical orientation", () => {
      render(<ScrollBar />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveAttribute("data-orientation", "vertical")
    })

    it("applies vertical orientation classes by default", () => {
      render(<ScrollBar />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveClass("h-full")
      expect(scrollbar).toHaveClass("w-2.5")
      expect(scrollbar).toHaveClass("border-l")
      expect(scrollbar).toHaveClass("border-l-transparent")
    })

    it("accepts vertical orientation explicitly", () => {
      render(<ScrollBar orientation="vertical" />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveAttribute("data-orientation", "vertical")
      expect(scrollbar).toHaveClass("h-full")
      expect(scrollbar).toHaveClass("w-2.5")
    })

    it("accepts horizontal orientation", () => {
      render(<ScrollBar orientation="horizontal" />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveAttribute("data-orientation", "horizontal")
    })

    it("applies horizontal orientation classes", () => {
      render(<ScrollBar orientation="horizontal" />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveClass("h-2.5")
      expect(scrollbar).toHaveClass("flex-col")
      expect(scrollbar).toHaveClass("border-t")
      expect(scrollbar).toHaveClass("border-t-transparent")
    })

    it("does not apply vertical classes when horizontal", () => {
      render(<ScrollBar orientation="horizontal" />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).not.toHaveClass("h-full")
      expect(scrollbar).not.toHaveClass("w-2.5")
      expect(scrollbar).not.toHaveClass("border-l")
    })

    it("does not apply horizontal classes when vertical", () => {
      render(<ScrollBar orientation="vertical" />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).not.toHaveClass("flex-col")
      expect(scrollbar).not.toHaveClass("border-t")
    })
  })

  describe("base classes", () => {
    it("applies flex display", () => {
      render(<ScrollBar />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveClass("flex")
    })

    it("applies touch-none for proper touch handling", () => {
      render(<ScrollBar />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveClass("touch-none")
    })

    it("applies padding pixel", () => {
      render(<ScrollBar />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveClass("p-px")
    })

    it("applies select-none to prevent text selection", () => {
      render(<ScrollBar />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveClass("select-none")
    })

    it("applies transition-colors for smooth hover effects", () => {
      render(<ScrollBar />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveClass("transition-colors")
    })
  })

  describe("thumb styling", () => {
    it("applies background border color", () => {
      render(<ScrollBar />)

      const thumb = screen.getByTestId("scroll-area-thumb")
      expect(thumb).toHaveClass("bg-border")
    })

    it("applies relative positioning", () => {
      render(<ScrollBar />)

      const thumb = screen.getByTestId("scroll-area-thumb")
      expect(thumb).toHaveClass("relative")
    })

    it("applies flex-1 for proper sizing", () => {
      render(<ScrollBar />)

      const thumb = screen.getByTestId("scroll-area-thumb")
      expect(thumb).toHaveClass("flex-1")
    })

    it("applies rounded-full for pill shape", () => {
      render(<ScrollBar />)

      const thumb = screen.getByTestId("scroll-area-thumb")
      expect(thumb).toHaveClass("rounded-full")
    })
  })

  describe("className handling", () => {
    it("merges custom className with default classes", () => {
      render(<ScrollBar className="custom-scrollbar bg-red-500" />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveClass("flex")
      expect(scrollbar).toHaveClass("custom-scrollbar")
      expect(scrollbar).toHaveClass("bg-red-500")
    })

    it("preserves orientation classes when custom className is provided", () => {
      render(<ScrollBar className="opacity-50" orientation="horizontal" />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveClass("h-2.5")
      expect(scrollbar).toHaveClass("flex-col")
      expect(scrollbar).toHaveClass("opacity-50")
    })
  })

  describe("props forwarding", () => {
    it("forwards additional props to scrollbar element", () => {
      render(<ScrollBar data-custom="scrollbar" aria-hidden="true" />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveAttribute("data-custom", "scrollbar")
      expect(scrollbar).toHaveAttribute("aria-hidden", "true")
    })

    it("forwards id prop", () => {
      render(<ScrollBar id="my-scrollbar" />)

      const scrollbar = screen.getByTestId("scroll-area-scrollbar")
      expect(scrollbar).toHaveAttribute("id", "my-scrollbar")
    })
  })
})

describe("ScrollArea and ScrollBar integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders both horizontal and vertical scrollbars when needed", () => {
    render(
      <ScrollArea>
        <div style={{ width: "200%", height: "200%" }}>Large Content</div>
        <ScrollBar orientation="vertical" data-testid="vertical-bar" />
        <ScrollBar orientation="horizontal" data-testid="horizontal-bar" />
      </ScrollArea>
    )

    expect(screen.getByTestId("scroll-area-root")).toBeInTheDocument()
    expect(screen.getByText("Large Content")).toBeInTheDocument()
  })

  it("renders properly with styled container", () => {
    render(
      <div className="h-[300px] w-[300px]">
        <ScrollArea className="h-full w-full rounded-md border">
          <div className="p-4">
            {Array.from({ length: 50 }, (_, i) => (
              <div key={i} className="py-2">
                Item {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )

    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.getByText("Item 50")).toBeInTheDocument()
  })

  it("works with table content", () => {
    render(
      <ScrollArea className="h-[200px]">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Row 1</td>
              <td>Value 1</td>
            </tr>
          </tbody>
        </table>
      </ScrollArea>
    )

    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Row 1")).toBeInTheDocument()
    expect(screen.getByText("Value 1")).toBeInTheDocument()
  })
})

describe("ScrollArea accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("supports aria-label for accessibility", () => {
    render(
      <ScrollArea aria-label="Task list">
        <div>Tasks here</div>
      </ScrollArea>
    )

    const root = screen.getByTestId("scroll-area-root")
    expect(root).toHaveAttribute("aria-label", "Task list")
  })

  it("supports aria-labelledby", () => {
    render(
      <>
        <h2 id="scroll-heading">Scrollable Content</h2>
        <ScrollArea aria-labelledby="scroll-heading">
          <div>Content</div>
        </ScrollArea>
      </>
    )

    const root = screen.getByTestId("scroll-area-root")
    expect(root).toHaveAttribute("aria-labelledby", "scroll-heading")
  })

  it("supports role attribute", () => {
    render(
      <ScrollArea role="region">
        <div>Content</div>
      </ScrollArea>
    )

    const root = screen.getByTestId("scroll-area-root")
    expect(root).toHaveAttribute("role", "region")
  })

  it("supports tabIndex for keyboard navigation", () => {
    render(
      <ScrollArea tabIndex={0}>
        <div>Focusable content</div>
      </ScrollArea>
    )

    const root = screen.getByTestId("scroll-area-root")
    expect(root).toHaveAttribute("tabIndex", "0")
  })
})

describe("ScrollArea edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("handles empty children", () => {
    render(<ScrollArea />)

    const root = screen.getByTestId("scroll-area-root")
    expect(root).toBeInTheDocument()
  })

  it("handles null children", () => {
    render(<ScrollArea>{null}</ScrollArea>)

    const root = screen.getByTestId("scroll-area-root")
    expect(root).toBeInTheDocument()
  })

  it("handles undefined children", () => {
    render(<ScrollArea>{undefined}</ScrollArea>)

    const root = screen.getByTestId("scroll-area-root")
    expect(root).toBeInTheDocument()
  })

  it("handles boolean children (renders nothing)", () => {
    render(<ScrollArea>{false}</ScrollArea>)

    const root = screen.getByTestId("scroll-area-root")
    expect(root).toBeInTheDocument()
  })

  it("handles numeric children", () => {
    render(<ScrollArea>{42}</ScrollArea>)

    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("handles string children", () => {
    render(<ScrollArea>Simple text content</ScrollArea>)

    expect(screen.getByText("Simple text content")).toBeInTheDocument()
  })

  it("handles fragment children", () => {
    render(
      <ScrollArea>
        <>
          <div>Fragment child 1</div>
          <div>Fragment child 2</div>
        </>
      </ScrollArea>
    )

    expect(screen.getByText("Fragment child 1")).toBeInTheDocument()
    expect(screen.getByText("Fragment child 2")).toBeInTheDocument()
  })

  it("handles conditional rendering inside", () => {
    const showContent = true
    render(
      <ScrollArea>
        {showContent && <div>Conditional Content</div>}
      </ScrollArea>
    )

    expect(screen.getByText("Conditional Content")).toBeInTheDocument()
  })

  it("handles very long className string", () => {
    const longClassName = "class1 class2 class3 class4 class5 custom-scroll max-h-screen overflow-hidden"
    render(<ScrollArea className={longClassName}>Content</ScrollArea>)

    const root = screen.getByTestId("scroll-area-root")
    expect(root).toHaveClass("class1")
    expect(root).toHaveClass("custom-scroll")
  })
})

describe("ScrollBar edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders standalone without ScrollArea parent", () => {
    render(<ScrollBar />)

    const scrollbar = screen.getByTestId("scroll-area-scrollbar")
    expect(scrollbar).toBeInTheDocument()
  })

  it("handles empty className", () => {
    render(<ScrollBar className="" />)

    const scrollbar = screen.getByTestId("scroll-area-scrollbar")
    expect(scrollbar).toHaveClass("flex")
  })

  it("handles whitespace-only className", () => {
    render(<ScrollBar className="   " />)

    const scrollbar = screen.getByTestId("scroll-area-scrollbar")
    expect(scrollbar).toBeInTheDocument()
  })
})
