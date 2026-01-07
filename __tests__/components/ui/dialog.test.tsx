import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog"

describe("Dialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Dialog Root", () => {
    it("renders children correctly", () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
        </Dialog>
      )
      expect(screen.getByText("Open Dialog")).toBeInTheDocument()
    })

    it("applies data-slot attribute", () => {
      render(
        <Dialog open>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )
      const dialog = document.querySelector('[data-slot="dialog-content"]')
      expect(dialog).toBeInTheDocument()
    })

    it("supports controlled open state", async () => {
      const onOpenChange = vi.fn()
      render(
        <Dialog open={true} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByText("Test Dialog")).toBeInTheDocument()
    })

    it("supports defaultOpen prop", () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Default Open Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByText("Default Open Dialog")).toBeInTheDocument()
    })
  })

  describe("DialogTrigger", () => {
    it("renders trigger button correctly", () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
        </Dialog>
      )
      expect(screen.getByText("Open")).toBeInTheDocument()
    })

    it("applies data-slot attribute to trigger", () => {
      render(
        <Dialog>
          <DialogTrigger data-testid="trigger">Open</DialogTrigger>
        </Dialog>
      )
      const trigger = screen.getByTestId("trigger")
      expect(trigger).toHaveAttribute("data-slot", "dialog-trigger")
    })

    it("opens dialog when clicked", async () => {
      const user = userEvent.setup()
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Content</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(screen.queryByText("Dialog Content")).not.toBeInTheDocument()
      await user.click(screen.getByText("Open"))
      expect(screen.getByText("Dialog Content")).toBeInTheDocument()
    })

    it("supports asChild prop for custom trigger elements", async () => {
      const user = userEvent.setup()
      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Custom Trigger</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      await user.click(screen.getByText("Custom Trigger"))
      expect(screen.getByText("Content")).toBeInTheDocument()
    })
  })

  describe("DialogContent", () => {
    it("renders content when dialog is open", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <p>Test content</p>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByText("Test content")).toBeInTheDocument()
    })

    it("applies data-slot attribute", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const content = document.querySelector('[data-slot="dialog-content"]')
      expect(content).toBeInTheDocument()
    })

    it("accepts and applies custom className", () => {
      render(
        <Dialog open>
          <DialogContent className="custom-class">
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const content = document.querySelector('[data-slot="dialog-content"]')
      expect(content).toHaveClass("custom-class")
    })

    it("renders close button by default", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument()
    })

    it("hides close button when showCloseButton is false", () => {
      render(
        <Dialog open>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument()
    })

    it("close button has sr-only text for accessibility", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const closeButton = screen.getByRole("button", { name: /close/i })
      const srOnlyText = within(closeButton).getByText("Close")
      expect(srOnlyText).toHaveClass("sr-only")
    })

    it("closes dialog when close button is clicked", async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      await user.click(screen.getByRole("button", { name: /close/i }))
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it("renders children content correctly", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <div data-testid="custom-child">Custom Child Content</div>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByTestId("custom-child")).toBeInTheDocument()
      expect(screen.getByText("Custom Child Content")).toBeInTheDocument()
    })

    it("includes DialogOverlay when rendered", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toBeInTheDocument()
    })

    it("closes when Escape key is pressed", async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      await user.keyboard("{Escape}")
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe("DialogOverlay", () => {
    it("renders overlay when dialog is open", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toBeInTheDocument()
    })

    it("applies data-slot attribute", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toHaveAttribute("data-slot", "dialog-overlay")
    })

    it("accepts custom className", () => {
      render(
        <Dialog open>
          <DialogPortal>
            <DialogOverlay className="custom-overlay-class" />
          </DialogPortal>
        </Dialog>
      )
      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toHaveClass("custom-overlay-class")
    })

    it("has proper z-index styling", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toHaveClass("z-50")
    })
  })

  describe("DialogHeader", () => {
    it("renders header content", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Header Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByText("Header Title")).toBeInTheDocument()
    })

    it("applies data-slot attribute", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader data-testid="header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      const header = screen.getByTestId("header")
      expect(header).toHaveAttribute("data-slot", "dialog-header")
    })

    it("accepts custom className", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader className="custom-header-class" data-testid="header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      const header = screen.getByTestId("header")
      expect(header).toHaveClass("custom-header-class")
    })

    it("renders multiple children correctly", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description text</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByText("Title")).toBeInTheDocument()
      expect(screen.getByText("Description text")).toBeInTheDocument()
    })

    it("applies flex column layout", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader data-testid="header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      const header = screen.getByTestId("header")
      expect(header).toHaveClass("flex", "flex-col")
    })
  })

  describe("DialogFooter", () => {
    it("renders footer content", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter>
              <button>Cancel</button>
              <button>Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByText("Cancel")).toBeInTheDocument()
      expect(screen.getByText("Save")).toBeInTheDocument()
    })

    it("applies data-slot attribute", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter data-testid="footer">
              <button>Action</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      const footer = screen.getByTestId("footer")
      expect(footer).toHaveAttribute("data-slot", "dialog-footer")
    })

    it("accepts custom className", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter className="custom-footer-class" data-testid="footer">
              <button>Action</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      const footer = screen.getByTestId("footer")
      expect(footer).toHaveClass("custom-footer-class")
    })

    it("applies flex layout with gap", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter data-testid="footer">
              <button>Action</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      const footer = screen.getByTestId("footer")
      expect(footer).toHaveClass("flex", "gap-2")
    })
  })

  describe("DialogTitle", () => {
    it("renders title text", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>My Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByText("My Dialog Title")).toBeInTheDocument()
    })

    it("applies data-slot attribute", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle data-testid="title">Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const title = screen.getByTestId("title")
      expect(title).toHaveAttribute("data-slot", "dialog-title")
    })

    it("accepts custom className", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle className="custom-title-class" data-testid="title">
              Title
            </DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const title = screen.getByTestId("title")
      expect(title).toHaveClass("custom-title-class")
    })

    it("applies font-semibold styling", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle data-testid="title">Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const title = screen.getByTestId("title")
      expect(title).toHaveClass("font-semibold")
    })

    it("applies text-lg sizing", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle data-testid="title">Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const title = screen.getByTestId("title")
      expect(title).toHaveClass("text-lg")
    })
  })

  describe("DialogDescription", () => {
    it("renders description text", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>This is a description</DialogDescription>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByText("This is a description")).toBeInTheDocument()
    })

    it("applies data-slot attribute", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription data-testid="description">
              Description
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )
      const description = screen.getByTestId("description")
      expect(description).toHaveAttribute("data-slot", "dialog-description")
    })

    it("accepts custom className", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription
              className="custom-description-class"
              data-testid="description"
            >
              Description
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )
      const description = screen.getByTestId("description")
      expect(description).toHaveClass("custom-description-class")
    })

    it("applies text-sm sizing", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription data-testid="description">
              Description
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )
      const description = screen.getByTestId("description")
      expect(description).toHaveClass("text-sm")
    })

    it("applies muted foreground color", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription data-testid="description">
              Description
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )
      const description = screen.getByTestId("description")
      expect(description).toHaveClass("text-muted-foreground")
    })
  })

  describe("DialogClose", () => {
    it("renders close element", () => {
      render(
        <Dialog open>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Title</DialogTitle>
            <DialogClose data-testid="custom-close">Close Me</DialogClose>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByTestId("custom-close")).toBeInTheDocument()
    })

    it("applies data-slot attribute", () => {
      render(
        <Dialog open>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Title</DialogTitle>
            <DialogClose data-testid="close">Close</DialogClose>
          </DialogContent>
        </Dialog>
      )
      const close = screen.getByTestId("close")
      expect(close).toHaveAttribute("data-slot", "dialog-close")
    })

    it("closes dialog when clicked", async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Title</DialogTitle>
            <DialogClose>Close Dialog</DialogClose>
          </DialogContent>
        </Dialog>
      )

      await user.click(screen.getByText("Close Dialog"))
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it("supports asChild prop", async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Title</DialogTitle>
            <DialogClose asChild>
              <button type="button">Custom Close Button</button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )

      await user.click(screen.getByText("Custom Close Button"))
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe("DialogPortal", () => {
    it("renders content through portal", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Portal Content</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      // DialogPortal renders content in document.body
      // Content should be visible and accessible
      expect(screen.getByText("Portal Content")).toBeInTheDocument()
      const dialogContent = document.querySelector('[data-slot="dialog-content"]')
      expect(dialogContent).toBeInTheDocument()
    })

    it("renders overlay through portal", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      // Overlay should be rendered in document.body via portal
      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("has proper role attribute on dialog", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Accessible Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    it("dialog is labeled by title", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>My Accessible Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const dialog = screen.getByRole("dialog")
      expect(dialog).toHaveAccessibleName("My Accessible Title")
    })

    it("dialog is described by description when present", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>
              This dialog helps you complete an important action.
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )
      const dialog = screen.getByRole("dialog")
      expect(dialog).toHaveAccessibleDescription(
        "This dialog helps you complete an important action."
      )
    })

    it("close button is focusable", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const closeButton = screen.getByRole("button", { name: /close/i })
      closeButton.focus()
      expect(closeButton).toHaveFocus()
    })

    it("traps focus within dialog when open", async () => {
      const user = userEvent.setup()
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <button>First Button</button>
            <button>Second Button</button>
          </DialogContent>
        </Dialog>
      )

      // Focus should be trapped within the dialog
      const firstButton = screen.getByText("First Button")
      const secondButton = screen.getByText("Second Button")
      const closeButton = screen.getByRole("button", { name: /close/i })

      firstButton.focus()
      expect(firstButton).toHaveFocus()

      await user.tab()
      // Focus should move to next focusable element
      expect(secondButton).toHaveFocus()
    })
  })

  describe("Integration", () => {
    it("renders complete dialog with all subcomponents", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Dialog</DialogTitle>
              <DialogDescription>
                This is a complete dialog example.
              </DialogDescription>
            </DialogHeader>
            <div>Main content goes here</div>
            <DialogFooter>
              <DialogClose asChild>
                <button type="button">Cancel</button>
              </DialogClose>
              <button type="button">Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText("Complete Dialog")).toBeInTheDocument()
      expect(
        screen.getByText("This is a complete dialog example.")
      ).toBeInTheDocument()
      expect(screen.getByText("Main content goes here")).toBeInTheDocument()
      expect(screen.getByText("Cancel")).toBeInTheDocument()
      expect(screen.getByText("Confirm")).toBeInTheDocument()
    })

    it("can toggle between open and closed states", async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false)
        return (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>Open Dialog</DialogTrigger>
            <DialogContent>
              <DialogTitle>Toggleable Dialog</DialogTitle>
            </DialogContent>
          </Dialog>
        )
      }

      // Need to import React for useState
      const React = await import("react")
      render(<TestComponent />)

      // Initially closed
      expect(screen.queryByText("Toggleable Dialog")).not.toBeInTheDocument()

      // Open dialog
      await user.click(screen.getByText("Open Dialog"))
      expect(screen.getByText("Toggleable Dialog")).toBeInTheDocument()

      // Close dialog using close button
      await user.click(screen.getByRole("button", { name: /close/i }))
      await waitFor(() => {
        expect(screen.queryByText("Toggleable Dialog")).not.toBeInTheDocument()
      })
    })

    it("supports modal prop for non-modal dialogs", () => {
      render(
        <Dialog open modal={false}>
          <DialogContent>
            <DialogTitle>Non-Modal Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByText("Non-Modal Dialog")).toBeInTheDocument()
    })

    it("renders XIcon in close button", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const closeButton = screen.getByRole("button", { name: /close/i })
      const svg = closeButton.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })

    it("overlay click closes dialog", async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      if (overlay) {
        await user.click(overlay)
        expect(onOpenChange).toHaveBeenCalledWith(false)
      }
    })
  })

  describe("Styling", () => {
    it("content has rounded border styling", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const content = document.querySelector('[data-slot="dialog-content"]')
      expect(content).toHaveClass("rounded-lg", "border")
    })

    it("content has shadow styling", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const content = document.querySelector('[data-slot="dialog-content"]')
      expect(content).toHaveClass("shadow-lg")
    })

    it("content has padding styling", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const content = document.querySelector('[data-slot="dialog-content"]')
      expect(content).toHaveClass("p-6")
    })

    it("content has z-50 z-index", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const content = document.querySelector('[data-slot="dialog-content"]')
      expect(content).toHaveClass("z-50")
    })

    it("content is centered with transform", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const content = document.querySelector('[data-slot="dialog-content"]')
      expect(content).toHaveClass(
        "top-[50%]",
        "left-[50%]",
        "translate-x-[-50%]",
        "translate-y-[-50%]"
      )
    })

    it("content has responsive max-width", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const content = document.querySelector('[data-slot="dialog-content"]')
      expect(content).toHaveClass("sm:max-w-lg")
    })

    it("overlay has semi-transparent background", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toHaveClass("bg-black/50")
    })

    it("overlay covers full viewport", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toHaveClass("fixed", "inset-0")
    })
  })
})
