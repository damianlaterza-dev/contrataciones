"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SelectComboboxProps<T> = {
  items: T[];
  value: T | null;
  onChange: (item: T | null) => void;
  getLabel: (item: T) => string;
  getKey: (item: T) => string | number;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  className?: string;
};

export function SelectCombobox<T>({
  items,
  value,
  onChange,
  getLabel,
  getKey,
  placeholder = "Seleccioná una opción",
  searchPlaceholder = "Buscar...",
  emptyText = "No se encontraron resultados.",
  disabled = false,
  "aria-invalid": ariaInvalid,
  className,
}: SelectComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (item: T) => {
    onChange(item);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive dark:border-input dark:bg-input/30",
            !value && "text-muted-foreground",
            className,
          )}>
          <span className="line-clamp-1 text-start">
            {value ? getLabel(value) : placeholder}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {/* {value && (
              <span
                role="button"
                aria-label="Limpiar selección"
                onClick={handleClear}
                className="rounded-sm opacity-50 hover:opacity-100">
                <X className="size-3.5" />
              </span>
            )} */}
            <ChevronDown
              className={cn(
                "size-4 opacity-50 transition-transform",
                open && "rotate-180",
              )}
            />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onWheel={(e) => e.stopPropagation()}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const key = getKey(item);
                const label = getLabel(item);
                const isSelected = value !== null && getKey(value) === key;
                return (
                  <CommandItem
                    key={key}
                    value={label}
                    onSelect={() => handleSelect(item)}>
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
