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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Option } from "@/lib/core.interface";

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  classNameOption?: string;
  withValue?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Selecciona...",
  className,
  classNameOption,
  withValue = true,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selected =
    value === "all" || value === ""
      ? undefined
      : options.find((opt) => opt.value === value);

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

  // Resetear búsqueda cuando se cierra el popover
  React.useEffect(() => {
    if (!open) {
      setSearchValue("");
    }
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen && onBlur) {
          onBlur();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={cn(
            "flex h-9 md:w-fit w-full items-center justify-between rounded-md border px-3 text-sm",
            selected && "text-primary",
            className
          )}
        >
          <span className="!text-nowrap line-clamp-1">
            {selected
              ? typeof selected.label === "function"
                ? selected.label()
                : selected.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 !w-(--radix-popover-trigger-width)"
        onWheel={(e) => e.stopPropagation()}
        onWheelCapture={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            className="h-9 border-none focus:ring-0"
            placeholder="Buscar..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty className="py-4 text-center text-sm">
              No hay resultados.
            </CommandEmpty>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  if (value === option.value) {
                    onChange("");
                  } else {
                    onChange(option.value);
                  }
                  setOpen(false);
                }}
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
      </PopoverContent>
    </Popover>
  );
}
