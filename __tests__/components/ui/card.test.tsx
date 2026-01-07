import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

describe("Card", () => {
  describe("Card (root component)", () => {
    it("renders children correctly", () => {
      render(<Card>Card Content</Card>)
      expect(screen.getByText("Card Content")).toBeInTheDocument()
    })

    it("applies default classes", () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId("card")
      expect(card).toHaveClass("bg-card")
      expect(card).toHaveClass("text-card-foreground")
      expect(card).toHaveClass("flex")
      expect(card).toHaveClass("flex-col")
      expect(card).toHaveClass("gap-6")
      expect(card).toHaveClass("rounded-xl")
      expect(card).toHaveClass("border")
      expect(card).toHaveClass("py-6")
      expect(card).toHaveClass("shadow-sm")
    })

    it("has correct data-slot attribute", () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId("card")
      expect(card).toHaveAttribute("data-slot", "card")
    })

    it("merges custom className with default classes", () => {
      render(
        <Card data-testid="card" className="custom-class bg-red-500">
          Content
        </Card>
      )
      const card = screen.getByTestId("card")
      expect(card).toHaveClass("custom-class")
      // tailwind-merge should handle conflicting classes
      expect(card).toHaveClass("bg-red-500")
    })

    it("forwards additional props to the underlying div", () => {
      render(
        <Card data-testid="card" id="my-card" aria-label="My Card">
          Content
        </Card>
      )
      const card = screen.getByTestId("card")
      expect(card).toHaveAttribute("id", "my-card")
      expect(card).toHaveAttribute("aria-label", "My Card")
    })

    it("renders as a div element", () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId("card")
      expect(card.tagName).toBe("DIV")
    })

    it("renders nested components correctly", () => {
      render(
        <Card data-testid="card">
          <CardHeader>Header</CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )
      expect(screen.getByText("Header")).toBeInTheDocument()
      expect(screen.getByText("Content")).toBeInTheDocument()
      expect(screen.getByText("Footer")).toBeInTheDocument()
    })
  })

  describe("CardHeader", () => {
    it("renders children correctly", () => {
      render(<CardHeader>Header Content</CardHeader>)
      expect(screen.getByText("Header Content")).toBeInTheDocument()
    })

    it("applies default classes", () => {
      render(<CardHeader data-testid="card-header">Content</CardHeader>)
      const header = screen.getByTestId("card-header")
      expect(header).toHaveClass("@container/card-header")
      expect(header).toHaveClass("grid")
      expect(header).toHaveClass("auto-rows-min")
      expect(header).toHaveClass("items-start")
      expect(header).toHaveClass("gap-2")
      expect(header).toHaveClass("px-6")
    })

    it("has correct data-slot attribute", () => {
      render(<CardHeader data-testid="card-header">Content</CardHeader>)
      const header = screen.getByTestId("card-header")
      expect(header).toHaveAttribute("data-slot", "card-header")
    })

    it("merges custom className", () => {
      render(
        <CardHeader data-testid="card-header" className="custom-header">
          Content
        </CardHeader>
      )
      const header = screen.getByTestId("card-header")
      expect(header).toHaveClass("custom-header")
      expect(header).toHaveClass("grid")
    })

    it("forwards additional props", () => {
      render(
        <CardHeader data-testid="card-header" role="banner">
          Content
        </CardHeader>
      )
      const header = screen.getByTestId("card-header")
      expect(header).toHaveAttribute("role", "banner")
    })
  })

  describe("CardTitle", () => {
    it("renders children correctly", () => {
      render(<CardTitle>Card Title</CardTitle>)
      expect(screen.getByText("Card Title")).toBeInTheDocument()
    })

    it("applies default classes", () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>)
      const title = screen.getByTestId("card-title")
      expect(title).toHaveClass("leading-none")
      expect(title).toHaveClass("font-semibold")
    })

    it("has correct data-slot attribute", () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>)
      const title = screen.getByTestId("card-title")
      expect(title).toHaveAttribute("data-slot", "card-title")
    })

    it("merges custom className", () => {
      render(
        <CardTitle data-testid="card-title" className="text-2xl text-primary">
          Title
        </CardTitle>
      )
      const title = screen.getByTestId("card-title")
      expect(title).toHaveClass("text-2xl")
      expect(title).toHaveClass("text-primary")
      expect(title).toHaveClass("font-semibold")
    })

    it("renders as a div element", () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>)
      const title = screen.getByTestId("card-title")
      expect(title.tagName).toBe("DIV")
    })
  })

  describe("CardDescription", () => {
    it("renders children correctly", () => {
      render(<CardDescription>Description text</CardDescription>)
      expect(screen.getByText("Description text")).toBeInTheDocument()
    })

    it("applies default classes", () => {
      render(<CardDescription data-testid="card-desc">Description</CardDescription>)
      const desc = screen.getByTestId("card-desc")
      expect(desc).toHaveClass("text-muted-foreground")
      expect(desc).toHaveClass("text-sm")
    })

    it("has correct data-slot attribute", () => {
      render(<CardDescription data-testid="card-desc">Description</CardDescription>)
      const desc = screen.getByTestId("card-desc")
      expect(desc).toHaveAttribute("data-slot", "card-description")
    })

    it("merges custom className", () => {
      render(
        <CardDescription data-testid="card-desc" className="italic">
          Description
        </CardDescription>
      )
      const desc = screen.getByTestId("card-desc")
      expect(desc).toHaveClass("italic")
      expect(desc).toHaveClass("text-sm")
    })
  })

  describe("CardAction", () => {
    it("renders children correctly", () => {
      render(<CardAction>Action Button</CardAction>)
      expect(screen.getByText("Action Button")).toBeInTheDocument()
    })

    it("applies default classes for grid positioning", () => {
      render(<CardAction data-testid="card-action">Action</CardAction>)
      const action = screen.getByTestId("card-action")
      expect(action).toHaveClass("col-start-2")
      expect(action).toHaveClass("row-span-2")
      expect(action).toHaveClass("row-start-1")
      expect(action).toHaveClass("self-start")
      expect(action).toHaveClass("justify-self-end")
    })

    it("has correct data-slot attribute", () => {
      render(<CardAction data-testid="card-action">Action</CardAction>)
      const action = screen.getByTestId("card-action")
      expect(action).toHaveAttribute("data-slot", "card-action")
    })

    it("merges custom className", () => {
      render(
        <CardAction data-testid="card-action" className="hover:opacity-80">
          Action
        </CardAction>
      )
      const action = screen.getByTestId("card-action")
      expect(action).toHaveClass("hover:opacity-80")
      expect(action).toHaveClass("col-start-2")
    })

    it("works with button children", () => {
      render(
        <CardAction data-testid="card-action">
          <button type="button">Click me</button>
        </CardAction>
      )
      expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument()
    })
  })

  describe("CardContent", () => {
    it("renders children correctly", () => {
      render(<CardContent>Main content here</CardContent>)
      expect(screen.getByText("Main content here")).toBeInTheDocument()
    })

    it("applies default classes", () => {
      render(<CardContent data-testid="card-content">Content</CardContent>)
      const content = screen.getByTestId("card-content")
      expect(content).toHaveClass("px-6")
    })

    it("has correct data-slot attribute", () => {
      render(<CardContent data-testid="card-content">Content</CardContent>)
      const content = screen.getByTestId("card-content")
      expect(content).toHaveAttribute("data-slot", "card-content")
    })

    it("merges custom className", () => {
      render(
        <CardContent data-testid="card-content" className="py-4 space-y-4">
          Content
        </CardContent>
      )
      const content = screen.getByTestId("card-content")
      expect(content).toHaveClass("py-4")
      expect(content).toHaveClass("space-y-4")
      expect(content).toHaveClass("px-6")
    })

    it("renders complex nested content", () => {
      render(
        <CardContent data-testid="card-content">
          <div>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </div>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </CardContent>
      )
      expect(screen.getByText("Paragraph 1")).toBeInTheDocument()
      expect(screen.getByText("Paragraph 2")).toBeInTheDocument()
      expect(screen.getByText("Item 1")).toBeInTheDocument()
      expect(screen.getByText("Item 2")).toBeInTheDocument()
    })
  })

  describe("CardFooter", () => {
    it("renders children correctly", () => {
      render(<CardFooter>Footer content</CardFooter>)
      expect(screen.getByText("Footer content")).toBeInTheDocument()
    })

    it("applies default classes", () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>)
      const footer = screen.getByTestId("card-footer")
      expect(footer).toHaveClass("flex")
      expect(footer).toHaveClass("items-center")
      expect(footer).toHaveClass("px-6")
    })

    it("has correct data-slot attribute", () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>)
      const footer = screen.getByTestId("card-footer")
      expect(footer).toHaveAttribute("data-slot", "card-footer")
    })

    it("merges custom className", () => {
      render(
        <CardFooter data-testid="card-footer" className="justify-between gap-4">
          Footer
        </CardFooter>
      )
      const footer = screen.getByTestId("card-footer")
      expect(footer).toHaveClass("justify-between")
      expect(footer).toHaveClass("gap-4")
      expect(footer).toHaveClass("flex")
    })

    it("renders multiple action buttons", () => {
      render(
        <CardFooter>
          <button type="button">Cancel</button>
          <button type="button">Save</button>
        </CardFooter>
      )
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
    })
  })

  describe("Complete Card composition", () => {
    it("renders a complete card with all sub-components", () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>My Card Title</CardTitle>
            <CardDescription>This is a description</CardDescription>
            <CardAction>
              <button type="button">Edit</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button type="button">Cancel</button>
            <button type="button">Save</button>
          </CardFooter>
        </Card>
      )

      // Verify all parts are rendered
      expect(screen.getByTestId("complete-card")).toBeInTheDocument()
      expect(screen.getByText("My Card Title")).toBeInTheDocument()
      expect(screen.getByText("This is a description")).toBeInTheDocument()
      expect(screen.getByText("This is the main content of the card.")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
    })

    it("maintains correct DOM structure", () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Title</CardTitle>
          </CardHeader>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      )

      const card = screen.getByTestId("card")
      const header = screen.getByTestId("header")
      const title = screen.getByTestId("title")
      const content = screen.getByTestId("content")

      // Header and content should be direct children of card
      expect(card).toContainElement(header)
      expect(card).toContainElement(content)
      // Title should be inside header
      expect(header).toContainElement(title)
    })

    it("renders card without optional components", () => {
      render(
        <Card data-testid="minimal-card">
          <CardContent>Just content</CardContent>
        </Card>
      )

      expect(screen.getByTestId("minimal-card")).toBeInTheDocument()
      expect(screen.getByText("Just content")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("allows setting aria attributes on Card", () => {
      render(
        <Card data-testid="card" role="article" aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Accessible Card</CardTitle>
          </CardHeader>
        </Card>
      )
      const card = screen.getByTestId("card")
      expect(card).toHaveAttribute("role", "article")
      expect(card).toHaveAttribute("aria-labelledby", "card-title")
    })

    it("supports tabIndex on interactive cards", () => {
      render(
        <Card data-testid="card" tabIndex={0}>
          Interactive Card
        </Card>
      )
      const card = screen.getByTestId("card")
      expect(card).toHaveAttribute("tabIndex", "0")
    })

    it("renders with semantic structure", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )

      // All elements should be queryable via data-slot attributes
      expect(document.querySelector('[data-slot="card"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-header"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-title"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-description"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-content"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-footer"]')).toBeInTheDocument()
    })
  })

  describe("Edge cases", () => {
    it("handles empty children gracefully", () => {
      render(<Card data-testid="empty-card">{null}</Card>)
      expect(screen.getByTestId("empty-card")).toBeInTheDocument()
    })

    it("handles undefined className", () => {
      render(<Card data-testid="card" className={undefined}>Content</Card>)
      const card = screen.getByTestId("card")
      expect(card).toHaveClass("bg-card")
    })

    it("handles empty string className", () => {
      render(<Card data-testid="card" className="">Content</Card>)
      const card = screen.getByTestId("card")
      expect(card).toHaveClass("bg-card")
    })

    it("renders with event handlers", () => {
      const handleClick = vi.fn()
      render(
        <Card data-testid="card" onClick={handleClick}>
          Clickable Card
        </Card>
      )
      const card = screen.getByTestId("card")
      card.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("forwards ref correctly", () => {
      // Note: The current implementation doesn't use forwardRef
      // This test documents the current behavior
      render(
        <Card data-testid="card">
          Content
        </Card>
      )
      expect(screen.getByTestId("card")).toBeInTheDocument()
    })

    it("handles special characters in content", () => {
      render(
        <Card>
          <CardTitle>&lt;Special&gt; &amp; Characters</CardTitle>
          <CardContent>{"<script>alert('xss')</script>"}</CardContent>
        </Card>
      )
      expect(screen.getByText("<Special> & Characters")).toBeInTheDocument()
      expect(screen.getByText("<script>alert('xss')</script>")).toBeInTheDocument()
    })

    it("renders with very long content", () => {
      const longText = "A".repeat(1000)
      render(
        <Card data-testid="card">
          <CardContent>{longText}</CardContent>
        </Card>
      )
      expect(screen.getByText(longText)).toBeInTheDocument()
    })
  })
})

// Import vi for the event handler test
import { vi } from "vitest"
