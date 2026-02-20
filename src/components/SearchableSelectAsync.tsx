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
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Option } from "@/lib/core.interface";

interface SearchableSelectAsyncProps {
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
  useQueryHook: (params: {
    search?: string;
    page?: number;
    per_page?: number;
    [key: string]: any;
  }) => {
    data?: { data: any[]; meta?: { last_page?: number } };
    isLoading: boolean;
    isFetching?: boolean;
  };
  mapOptionFn: (item: any) => Option;
  perPage?: number;
  debounceMs?: number;
  defaultOption?: Option;
  additionalParams?: Record<string, any>;
  onValueChange?: (value: string, item?: any) => void;
  preloadItemId?: string;
}

export function SearchableSelectAsync({
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
  buttonSize = "default",
  useQueryHook,
  mapOptionFn,
  perPage = 10,
  debounceMs = 500,
  defaultOption,
  additionalParams = {},
  onValueChange,
  preloadItemId,
}: SearchableSelectAsyncProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [allOptions, setAllOptions] = React.useState<Option[]>(
    defaultOption ? [defaultOption] : [],
  );
  const [allRawItems, setAllRawItems] = React.useState<any[]>([]);
  const [selectedOption, setSelectedOption] = React.useState<Option | null>(
    defaultOption || null,
  );
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const isMobile = useIsMobile();

  const { data, isLoading, isFetching } = useQueryHook({
    search: debouncedSearch,
    page,
    per_page: perPage,
    ...additionalParams,
  });

  // Debounce para el search
  React.useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (debouncedSearch !== search) {
        setDebouncedSearch(search);
        setPage(1);
        if (search !== "" || open) {
          setAllOptions([]);
          setAllRawItems([]);
        }
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, debounceMs, debouncedSearch, open]);

  // Agregar nuevas opciones cuando llegan datos
  React.useEffect(() => {
    if (data?.data) {
      const newOptions = data.data.map(mapOptionFn);

      if (page === 1) {
        setAllOptions(newOptions);
        setAllRawItems(data.data);
      } else {
        setAllOptions((prev) => {
          const existingIds = new Set(prev.map((opt) => opt.value));
          const uniqueNew = newOptions.filter(
            (opt) => !existingIds.has(opt.value),
          );
          return [...prev, ...uniqueNew];
        });
        setAllRawItems((prev) => {
          const existingIds = new Set(prev.map((item) => mapOptionFn(item).value));
          return [...prev, ...data.data.filter((item) => !existingIds.has(mapOptionFn(item).value))];
        });
      }
    }
  }, [data, page, mapOptionFn]);

  // Precargar item específico buscando en todas las páginas
  React.useEffect(() => {
    if (
      preloadItemId &&
      !isLoading &&
      !isFetching &&
      data?.meta?.last_page &&
      page < data.meta.last_page
    ) {
      const itemFound = allOptions.some((opt) => opt.value === preloadItemId);
      if (!itemFound) {
        setPage((prev) => prev + 1);
      }
    }
  }, [preloadItemId, allOptions, isLoading, isFetching, data?.meta?.last_page, page]);

  // Manejar scroll para cargar más
  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const bottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

      if (
        bottom &&
        !isLoading &&
        !isFetching &&
        data?.meta?.last_page &&
        page < data.meta.last_page
      ) {
        setPage((prev) => prev + 1);
      }
    },
    [isLoading, isFetching, data?.meta?.last_page, page],
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch("");
      setDebouncedSearch("");
      setPage(1);
      if (onBlur) onBlur();
    }
  };

  const handleSelect = (option: Option) => {
    const newValue = option.value === value ? "" : option.value;
    onChange(newValue);
    setSelectedOption(newValue ? option : null);
    if (onValueChange) {
      const selectedItem = allRawItems.find(
        (item) => mapOptionFn(item).value === option.value,
      );
      onValueChange(newValue, selectedItem);
    }
    setOpen(false);
  };

  const selected =
    allOptions.find((opt) => opt.value === value) ||
    (value && selectedOption?.value === value ? selectedOption : null);

  const commandContent = (
    <Command className="md:max-h-72 overflow-hidden" shouldFilter={false}>
      <CommandInput
        className="border-none focus:ring-0"
        placeholder="Buscar..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList
        className="md:max-h-60 overflow-y-auto"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {isLoading && page === 1 ? (
          <div className="py-6 text-center text-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-muted-foreground">Buscando...</span>
          </div>
        ) : (
          <>
            <CommandEmpty className="py-4 text-center text-sm">
              No hay resultados.
            </CommandEmpty>
            {allOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option)}
                className="flex items-center cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 shrink-0",
                    value === option.value ? "opacity-100" : "opacity-0",
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
            {isFetching && page > 1 && (
              <div className="py-2 text-center text-sm flex items-center justify-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">
                  Cargando más...
                </span>
              </div>
            )}
          </>
        )}
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
        className,
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
        <Drawer open={open} onOpenChange={handleOpenChange}>
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
        <Popover open={open} onOpenChange={handleOpenChange}>
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
