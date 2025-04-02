import React, { useState, useEffect, useRef } from "react";

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  children,
  className = "",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || "");
  const [label, setLabel] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Handle controlled component
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Extract children to find the label for the selected value
  useEffect(() => {
    // Use React.Children to iterate over the children
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectContent) {
        React.Children.forEach(child.props.children, (contentChild) => {
          if (
            React.isValidElement(contentChild) &&
            contentChild.type === SelectItem &&
            contentChild.props.value === selectedValue
          ) {
            setLabel(contentChild.props.children as string);
          }
        });
      }
    });
  }, [children, selectedValue]);

  const handleSelectItem = (value: string) => {
    setSelectedValue(value);
    if (onValueChange) {
      onValueChange(value);
    }
    setIsOpen(false);
  };

  // Provide context to children
  const contextValue = {
    open: isOpen,
    setOpen: setIsOpen,
    value: selectedValue,
    onSelect: handleSelectItem,
    disabled,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={ref} className={`relative ${className}`}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement);
          }
          return child;
        })}
      </div>
    </SelectContext.Provider>
  );
}

// Context for Select components
interface SelectContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  onSelect: (value: string) => void;
  disabled: boolean;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select compound components must be used within the Select component');
  }
  return context;
}

// SelectTrigger component
interface SelectTriggerProps {
  className?: string;
  children?: React.ReactNode;
}

export function SelectTrigger({ className = "", children }: SelectTriggerProps) {
  const { open, setOpen, disabled } = useSelectContext();

  return (
    <button
      type="button"
      onClick={() => !disabled && setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={disabled}
      aria-expanded={open}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`ml-2 h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );
}

// SelectValue component
interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder = "Select an option" }: SelectValueProps) {
  const { value } = useSelectContext();
  
  // Find the selected item's label in the child SelectItems
  return (
    <span className={`text-sm ${!value ? 'text-muted-foreground' : ''}`}>
      {value ? value : placeholder}
    </span>
  );
}

// SelectContent component
interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className = "" }: SelectContentProps) {
  const { open } = useSelectContext();

  if (!open) return null;
  
  return (
    <div className="relative z-50">
      <div className="fixed inset-0" onClick={() => {}}></div>
      <div
        className={`absolute left-0 z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

// SelectItem component
interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function SelectItem({ value, children, className = "" }: SelectItemProps) {
  const { onSelect, value: selectedValue } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <div
      onClick={() => onSelect(value)}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
        isSelected ? "bg-accent" : ""
      } ${className}`}
    >
      {isSelected && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-2 h-4 w-4"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
      {children}
    </div>
  );
}