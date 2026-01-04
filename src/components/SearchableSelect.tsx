"use client";

import * as React from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Option } from "@/lib/core.interface";

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  classNameOption?: string;
  classNameDiv?: string;
  withValue?: boolean;
  label?: string;
  disabled?: boolean;
  buttonSize?: "icon" | "sm" | "lg" | "default" | "xs" | "icon-sm" | "icon-lg";
}

export function SearchableSelect({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Selecciona...",
  className,
  classNameOption,
  classNameDiv,
  withValue = true,
  label,
  disabled = false,
  buttonSize = "sm",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const isMobile = useIsMobile();

  const selected =
    value === "all" ? undefined : options.find((opt) => opt.value === value);

  // Filtrar opciones basado en el texto de búsqueda
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;

    return options.filter((option) => {
      // Obtener el label como string
      let labelText = "";
      if (typeof option.label === "function") {
        const labelResult = option.label();
        labelText = labelResult ? String(labelResult) : "";
      } else if (option.label != null) {
        labelText = String(option.label);
      }

      // Convertir value a string para búsqueda
      const valueText = String(option.value);

      const searchLower = searchValue.toLowerCase();

      return (
        labelText.toLowerCase().includes(searchLower) ||
        valueText.toLowerCase().includes(searchLower) ||
        (option.description &&
          option.description.toLowerCase().includes(searchLower))
      );
    });
  }, [options, searchValue]);

  // Resetear búsqueda cuando se cierra el popover/drawer
  React.useEffect(() => {
    if (!open) {
      setSearchValue("");
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    if (value === optionValue) {
      onChange("");
    } else {
      onChange(optionValue);
    }
    setOpen(false);
  };

  const commandContent = (
    <Command shouldFilter={false} className="md:max-h-72 overflow-hidden">
      <CommandInput
        className="border-none focus:ring-0"
        placeholder="Buscar..."
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList className="md:max-h-60 overflow-y-auto">
        <CommandEmpty className="py-4 text-center text-sm">
          No hay resultados.
        </CommandEmpty>
        {filteredOptions.map((option) => (
          <CommandItem
            key={option.value}
            value={option.value}
            onSelect={() => handleSelect(option.value)}
            className="flex items-center cursor-pointer"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4 shrink-0",
                value === option.value ? "opacity-100" : "opacity-0"
              )}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className={cn("truncate", classNameOption)}>
                {typeof option.label === "function"
                  ? option.label()
                  : option.label}
              </span>
              {option.description && (
                <span className="text-[10px] text-muted-foreground truncate">
                  {withValue && `${option.value} - `} {option.description}
                </span>
              )}
            </div>
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );

  const triggerButton = (
    <Button
      variant="outline"
      type="button"
      size={buttonSize}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-between rounded-md border px-3 text-xs md:text-sm overflow-hidden",
        selected && "bg-muted text-muted-foreground",
        className
      )}
    >
      <span className="truncate min-w-0 flex-1 text-left block">
        {selected
          ? typeof selected.label === "function"
            ? selected.label()
            : selected.label
          : placeholder}
      </span>
      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
    </Button>
  );

  return (
    <div className={cn("flex flex-col gap-2 min-w-0", classNameDiv)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      {isMobile ? (
        <Drawer
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen && onBlur) {
              onBlur();
            }
          }}
        >
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent className="px-4 pb-4 max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>{label || "Seleccionar opción"}</DrawerTitle>
              <DrawerDescription className="hidden" />
            </DrawerHeader>
            <div className="overflow-hidden">{commandContent}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen && onBlur) {
              onBlur();
            }
          }}
        >
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            className="p-0 min-w-(--radix-popover-trigger-width)!"
            onWheel={(e) => e.stopPropagation()}
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {commandContent}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
