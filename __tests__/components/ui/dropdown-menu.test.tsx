import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"

describe("DropdownMenu", () => {
  describe("Basic Rendering", () => {
    it("renders DropdownMenu with trigger", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText("Open Menu")).toBeInTheDocument()
    })

    it("opens menu when trigger is clicked", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument()
      })
    })

    it("renders multiple menu items", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument()
        expect(screen.getByText("Item 2")).toBeInTheDocument()
        expect(screen.getByText("Item 3")).toBeInTheDocument()
      })
    })

    it("applies data-slot attributes correctly", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="trigger">Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="content">
            <DropdownMenuItem data-testid="item">Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByTestId("trigger")
      expect(trigger).toHaveAttribute("data-slot", "dropdown-menu-trigger")

      await user.click(trigger)

      await waitFor(() => {
        const content = screen.getByTestId("content")
        expect(content).toHaveAttribute("data-slot", "dropdown-menu-content")

        const item = screen.getByTestId("item")
        expect(item).toHaveAttribute("data-slot", "dropdown-menu-item")
      })
    })
  })

  describe("DropdownMenuItem", () => {
    it("handles onClick callback", async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleClick}>Click Me</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByText("Click Me")).toBeInTheDocument()
      })

      await user.click(screen.getByText("Click Me"))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("applies custom className", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="custom-class" data-testid="item">
              Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const item = screen.getByTestId("item")
        expect(item).toHaveClass("custom-class")
      })
    })

    it("renders with inset prop", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset data-testid="item">
              Inset Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const item = screen.getByTestId("item")
        expect(item).toHaveAttribute("data-inset", "true")
      })
    })

    it("renders with destructive variant", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem variant="destructive" data-testid="item">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const item = screen.getByTestId("item")
        expect(item).toHaveAttribute("data-variant", "destructive")
      })
    })

    it("renders with default variant", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="item">Default Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const item = screen.getByTestId("item")
        expect(item).toHaveAttribute("data-variant", "default")
      })
    })

    it("renders disabled item correctly", async () => {
      const handleSelect = vi.fn()
      const user = userEvent.setup()

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled onSelect={handleSelect} data-testid="disabled-item">
              Disabled Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const item = screen.getByTestId("disabled-item")
        expect(item).toHaveAttribute("data-disabled", "")
      })
    })
  })

  describe("DropdownMenuCheckboxItem", () => {
    it("renders checkbox item with checked state", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked data-testid="checkbox">
              Checked Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const checkbox = screen.getByTestId("checkbox")
        expect(checkbox).toHaveAttribute("data-slot", "dropdown-menu-checkbox-item")
        expect(checkbox).toHaveAttribute("data-state", "checked")
      })
    })

    it("renders checkbox item with unchecked state", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={false} data-testid="checkbox">
              Unchecked Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const checkbox = screen.getByTestId("checkbox")
        expect(checkbox).toHaveAttribute("data-state", "unchecked")
      })
    })

    it("calls onCheckedChange when toggled", async () => {
      const onCheckedChange = vi.fn()
      const user = userEvent.setup()

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={onCheckedChange}
            >
              Toggle Me
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByText("Toggle Me")).toBeInTheDocument()
      })

      await user.click(screen.getByText("Toggle Me"))
      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })

    it("applies custom className to checkbox item", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem className="custom-checkbox" data-testid="checkbox">
              Styled Checkbox
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const checkbox = screen.getByTestId("checkbox")
        expect(checkbox).toHaveClass("custom-checkbox")
      })
    })
  })

  describe("DropdownMenuRadioGroup and DropdownMenuRadioItem", () => {
    it("renders radio group with items", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1" data-testid="radio-group">
              <DropdownMenuRadioItem value="option1" data-testid="radio1">
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2" data-testid="radio2">
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const radioGroup = screen.getByTestId("radio-group")
        expect(radioGroup).toHaveAttribute("data-slot", "dropdown-menu-radio-group")

        const radio1 = screen.getByTestId("radio1")
        expect(radio1).toHaveAttribute("data-slot", "dropdown-menu-radio-item")
        expect(radio1).toHaveAttribute("data-state", "checked")

        const radio2 = screen.getByTestId("radio2")
        expect(radio2).toHaveAttribute("data-state", "unchecked")
      })
    })

    it("calls onValueChange when radio item is selected", async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1" onValueChange={onValueChange}>
              <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByText("Option 2")).toBeInTheDocument()
      })

      await user.click(screen.getByText("Option 2"))
      expect(onValueChange).toHaveBeenCalledWith("option2")
    })

    it("applies custom className to radio item", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1" className="custom-radio" data-testid="radio">
                Option 1
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const radio = screen.getByTestId("radio")
        expect(radio).toHaveClass("custom-radio")
      })
    })
  })

  describe("DropdownMenuLabel", () => {
    it("renders label correctly", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel data-testid="label">My Account</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const label = screen.getByTestId("label")
        expect(label).toHaveAttribute("data-slot", "dropdown-menu-label")
        expect(label).toHaveTextContent("My Account")
      })
    })

    it("renders label with inset prop", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset data-testid="label">
              Inset Label
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const label = screen.getByTestId("label")
        expect(label).toHaveAttribute("data-inset", "true")
      })
    })

    it("applies custom className to label", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="custom-label" data-testid="label">
              Custom Label
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const label = screen.getByTestId("label")
        expect(label).toHaveClass("custom-label")
      })
    })
  })

  describe("DropdownMenuSeparator", () => {
    it("renders separator correctly", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator data-testid="separator" />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const separator = screen.getByTestId("separator")
        expect(separator).toHaveAttribute("data-slot", "dropdown-menu-separator")
      })
    })

    it("applies custom className to separator", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSeparator className="custom-separator" data-testid="separator" />
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const separator = screen.getByTestId("separator")
        expect(separator).toHaveClass("custom-separator")
      })
    })
  })

  describe("DropdownMenuShortcut", () => {
    it("renders shortcut correctly", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Save
              <DropdownMenuShortcut data-testid="shortcut">Ctrl+S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const shortcut = screen.getByTestId("shortcut")
        expect(shortcut).toHaveAttribute("data-slot", "dropdown-menu-shortcut")
        expect(shortcut).toHaveTextContent("Ctrl+S")
      })
    })

    it("applies custom className to shortcut", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Copy
              <DropdownMenuShortcut className="custom-shortcut" data-testid="shortcut">
                Ctrl+C
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const shortcut = screen.getByTestId("shortcut")
        expect(shortcut).toHaveClass("custom-shortcut")
      })
    })
  })

  describe("DropdownMenuGroup", () => {
    it("renders group correctly", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup data-testid="group">
              <DropdownMenuItem>Item 1</DropdownMenuItem>
              <DropdownMenuItem>Item 2</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const group = screen.getByTestId("group")
        expect(group).toHaveAttribute("data-slot", "dropdown-menu-group")
      })
    })
  })

  describe("DropdownMenuContent", () => {
    it("applies custom sideOffset", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10} data-testid="content">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const content = screen.getByTestId("content")
        expect(content).toBeInTheDocument()
      })
    })

    it("applies custom className to content", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content" data-testid="content">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const content = screen.getByTestId("content")
        expect(content).toHaveClass("custom-content")
      })
    })
  })

  describe("Submenu", () => {
    it("renders submenu trigger correctly", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-testid="sub-trigger">
                More Options
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const subTrigger = screen.getByTestId("sub-trigger")
        expect(subTrigger).toHaveAttribute("data-slot", "dropdown-menu-sub-trigger")
        expect(subTrigger).toHaveTextContent("More Options")
      })
    })

    it("renders submenu trigger with inset prop", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger inset data-testid="sub-trigger">
                Inset Submenu
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const subTrigger = screen.getByTestId("sub-trigger")
        expect(subTrigger).toHaveAttribute("data-inset", "true")
      })
    })

    it("applies custom className to submenu trigger", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="custom-sub-trigger" data-testid="sub-trigger">
                Styled Submenu
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const subTrigger = screen.getByTestId("sub-trigger")
        expect(subTrigger).toHaveClass("custom-sub-trigger")
      })
    })

    it("opens submenu on hover", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
              <DropdownMenuSubContent data-testid="sub-content">
                <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByText("More Options")).toBeInTheDocument()
      })

      await user.hover(screen.getByText("More Options"))

      await waitFor(() => {
        expect(screen.getByText("Sub Item 1")).toBeInTheDocument()
      })
    })

    it("applies custom className to submenu content", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="custom-sub-content" data-testid="sub-content">
                <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByText("More Options")).toBeInTheDocument()
      })

      await user.hover(screen.getByText("More Options"))

      await waitFor(() => {
        const subContent = screen.getByTestId("sub-content")
        expect(subContent).toHaveClass("custom-sub-content")
      })
    })
  })

  describe("DropdownMenuPortal", () => {
    it("renders portal correctly", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuItem>Item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      )

      expect(screen.getByText("Open Menu")).toBeInTheDocument()
    })
  })

  describe("Keyboard Navigation", () => {
    it("opens menu with Enter key", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByText("Open Menu")
      trigger.focus()
      await user.keyboard("{Enter}")

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument()
      })
    })

    it("opens menu with Space key", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByText("Open Menu")
      trigger.focus()
      await user.keyboard(" ")

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument()
      })
    })

    it("closes menu with Escape key", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument()
      })

      await user.keyboard("{Escape}")

      await waitFor(() => {
        expect(screen.queryByText("Item 1")).not.toBeInTheDocument()
      })
    })

    it("navigates items with ArrowDown key", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="item1">Item 1</DropdownMenuItem>
            <DropdownMenuItem data-testid="item2">Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument()
      })

      await user.keyboard("{ArrowDown}")

      await waitFor(() => {
        const item1 = screen.getByTestId("item1")
        expect(item1).toHaveAttribute("data-highlighted", "")
      })
    })

    it("navigates items with ArrowUp key", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="item1">Item 1</DropdownMenuItem>
            <DropdownMenuItem data-testid="item2">Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument()
      })

      await user.keyboard("{ArrowUp}")

      await waitFor(() => {
        const item2 = screen.getByTestId("item2")
        expect(item2).toHaveAttribute("data-highlighted", "")
      })
    })
  })

  describe("Controlled Mode", () => {
    it("respects controlled open state", async () => {
      const { rerender } = render(
        <DropdownMenu open={false}>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.queryByText("Item 1")).not.toBeInTheDocument()

      rerender(
        <DropdownMenu open={true}>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument()
      })
    })

    it("calls onOpenChange callback", async () => {
      const onOpenChange = vi.fn()
      const user = userEvent.setup()

      render(
        <DropdownMenu onOpenChange={onOpenChange}>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })
  })

  describe("Complex Scenarios", () => {
    it("renders full menu with all components", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Profile
                <DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
                <DropdownMenuShortcut>Ctrl+,</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>
              Show Notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value="light">
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Help</DropdownMenuItem>
                <DropdownMenuItem>About</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByText("My Account")).toBeInTheDocument()
        expect(screen.getByText("Profile")).toBeInTheDocument()
        expect(screen.getByText("Settings")).toBeInTheDocument()
        expect(screen.getByText("Ctrl+P")).toBeInTheDocument()
        expect(screen.getByText("Show Notifications")).toBeInTheDocument()
        expect(screen.getByText("Light")).toBeInTheDocument()
        expect(screen.getByText("Dark")).toBeInTheDocument()
        expect(screen.getByText("More Options")).toBeInTheDocument()
        expect(screen.getByText("Logout")).toBeInTheDocument()
      })
    })

    it("handles menu with icons", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <svg data-testid="icon" />
              With Icon
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        expect(screen.getByTestId("icon")).toBeInTheDocument()
        expect(screen.getByText("With Icon")).toBeInTheDocument()
      })
    })
  })

  describe("Accessibility", () => {
    it("trigger has correct aria attributes", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="trigger">Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByTestId("trigger")
      expect(trigger).toHaveAttribute("aria-haspopup", "menu")
      expect(trigger).toHaveAttribute("aria-expanded", "false")

      await user.click(trigger)

      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true")
      })
    })

    it("content has role menu", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="content">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const content = screen.getByTestId("content")
        expect(content).toHaveAttribute("role", "menu")
      })
    })

    it("menu items have role menuitem", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="item">Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const item = screen.getByTestId("item")
        expect(item).toHaveAttribute("role", "menuitem")
      })
    })

    it("checkbox items have role menuitemcheckbox", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem data-testid="checkbox">
              Checkbox
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const checkbox = screen.getByTestId("checkbox")
        expect(checkbox).toHaveAttribute("role", "menuitemcheckbox")
      })
    })

    it("radio items have role menuitemradio", async () => {
      const user = userEvent.setup()
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1" data-testid="radio">
                Option
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByText("Open Menu"))

      await waitFor(() => {
        const radio = screen.getByTestId("radio")
        expect(radio).toHaveAttribute("role", "menuitemradio")
      })
    })
  })
})
