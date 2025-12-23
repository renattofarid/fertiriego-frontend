import { useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Control } from "react-hook-form";

interface SelectSearchFormProps<T> {
  name: string;
  label: string;
  placeholder?: string;
  control: Control<any>;
  disabled?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  minSearchLength?: number;
  debounceMs?: number;
  // Funciones para manejar la búsqueda y formato
  items: T[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  getItemId: (item: T) => number;
  formatLabel: (item: T) => string;
  formatDescription?: (item: T) => string;
}

export function SelectSearchForm<T>({
  name,
  label,
  placeholder = "Seleccionar...",
  control,
  disabled,
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados",
  minSearchLength = 2,
  debounceMs = 300,
  items,
  isSearching,
  onSearch,
  getItemId,
  formatLabel,
  formatDescription,
}: SelectSearchFormProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length >= minSearchLength) {
        onSearch(search);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, onSearch, minSearchLength, debounceMs]);

  // Cargar items iniciales al abrir
  useEffect(() => {
    if (open && items.length === 0 && !isSearching) {
      onSearch("");
    }
  }, [open, items.length, isSearching, onSearch]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected = items.find(
          (item) => getItemId(item).toString() === field.value
        );

        return (
          <FormItem className="flex flex-col justify-start">
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between min-h-7 flex",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <span className="!text-nowrap line-clamp-1">
                      {selected ? formatLabel(selected) : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent className="p-0 !w-(--radix-popover-trigger-width)">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={searchPlaceholder}
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList className="max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="py-6 text-center text-sm">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : items.length === 0 ? (
                      <CommandEmpty>
                        {search.length < minSearchLength
                          ? `Escribe al menos ${minSearchLength} caracteres`
                          : emptyMessage}
                      </CommandEmpty>
                    ) : (
                      items.map((item) => (
                        <CommandItem
                          key={getItemId(item)}
                          onSelect={() => {
                            field.onChange(getItemId(item).toString());
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              getItemId(item).toString() === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="truncate">
                              {formatLabel(item)}
                            </span>
                            {formatDescription && (
                              <span className="text-[10px] text-muted-foreground">
                                {formatDescription(item)}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
