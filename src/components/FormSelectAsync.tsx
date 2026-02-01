import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
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
import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Option } from "@/lib/core.interface";
import RequiredField from "./RequiredField";

interface FormSelectAsyncProps {
  name: string;
  description?: string;
  label?: string | (() => React.ReactNode);
  placeholder?: string;
  control: Control<any>;
  disabled?: boolean;
  tooltip?: string | React.ReactNode;
  classNameOption?: string;
  withValue?: boolean;
  children?: React.ReactNode;
  className?: string;
  required?: boolean;
  // Props específicos para async
  useQueryHook: (params: {
    search?: string;
    2?: number;
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
  defaultOption?: Option; // Opción inicial para mostrar cuando se edita
  additionalParams?: Record<string, any>; // Parámetros adicionales para el hook
  onValueChange?: (value: string, item?: any) => void; // Callback cuando cambia el valor
}

export function FormSelectAsync({
  name,
  description,
  label,
  placeholder,
  control,
  disabled,
  tooltip,
  classNameOption,
  withValue = true,
  children,
  className,
  required = false,
  useQueryHook,
  mapOptionFn,
  perPage = 10,
  debounceMs = 500,
  defaultOption,
  additionalParams = {},
  onValueChange,
}: FormSelectAsyncProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allOptions, setAllOptions] = useState<Option[]>(
    defaultOption ? [defaultOption] : []
  );
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    defaultOption || null
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Hook de consulta con parámetros dinámicos
  const { data, isLoading, isFetching } = useQueryHook({
    search: debouncedSearch,
    page,
    per_page: perPage,
    ...additionalParams,
  });

  // Debounce para el search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Solo limpiar opciones si realmente cambió la búsqueda
      if (debouncedSearch !== search) {
        setDebouncedSearch(search);
        setPage(1); // Resetear a página 1 cuando cambia la búsqueda
        // Solo limpiar si hay búsqueda activa (para evitar limpiar en estado inicial)
        if (search !== "" || open) {
          setAllOptions([]); // Limpiar opciones anteriores solo cuando hay búsqueda
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
  useEffect(() => {
    if (data?.data) {
      const newOptions = data.data.map(mapOptionFn);

      if (page === 1) {
        setAllOptions(newOptions);
      } else {
        setAllOptions((prev) => {
          // Evitar duplicados
          const existingIds = new Set(prev.map((opt) => opt.value));
          const uniqueNew = newOptions.filter(
            (opt) => !existingIds.has(opt.value)
          );
          return [...prev, ...uniqueNew];
        });
      }
    }
  }, [data, page, mapOptionFn]);

  // Manejar scroll para cargar más
  const handleScroll = useCallback(
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
    [isLoading, isFetching, data?.meta?.last_page, page]
  );

  // Reset cuando se cierra el popover
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch("");
      setDebouncedSearch("");
      setPage(1);
      // NO limpiamos allOptions para mantener la opción seleccionada visible
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Buscar la opción seleccionada en las opciones cargadas o usar la cache
        const selected =
          allOptions.find((opt) => opt.value === field.value) ||
          (field.value && selectedOption?.value === field.value
            ? selectedOption
            : null);

        // Actualizar cache cuando se encuentra la opción seleccionada
        if (field.value && selected && selected !== selectedOption) {
          setSelectedOption(selected);
        }

        // Limpiar cache si no hay valor seleccionado
        if (!field.value && selectedOption) {
          setSelectedOption(null);
        }

        return (
          <FormItem className="flex flex-col justify-between">
            {label && typeof label === "function"
              ? label()
              : label && (
                  <FormLabel className="flex justify-start items-center">
                    {label}
                    {required && <RequiredField />}
                    {tooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="tertiary"
                            className="ml-2 p-0 aspect-square w-4 h-4 text-center justify-center"
                          >
                            ?
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{tooltip}</TooltipContent>
                      </Tooltip>
                    )}
                  </FormLabel>
                )}

            <div className="flex gap-2 items-center">
              <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={disabled}
                      className={cn(
                        "w-full justify-between min-h-10 flex",
                        !field.value && "text-muted-foreground",
                        className
                      )}
                    >
                      <span className="text-nowrap! line-clamp-1">
                        {selected
                          ? typeof selected.label === "function"
                            ? selected.label()
                            : selected.label
                          : placeholder}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                <PopoverContent
                  className="p-0 w-(--radix-popover-trigger-width)!"
                  onWheel={(e) => e.stopPropagation()}
                  onWheelCapture={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <Command
                    className="max-h-72 overflow-hidden"
                    shouldFilter={false}
                  >
                    <CommandInput
                      className="border-none focus:ring-0"
                      placeholder="Buscar..."
                      value={search}
                      onValueChange={setSearch}
                    />
                    <CommandList
                      className="max-h-60 overflow-y-auto"
                      ref={scrollRef}
                      onScroll={handleScroll}
                    >
                      {isLoading && page === 1 ? (
                        <div className="py-6 text-center text-sm flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-muted-foreground">
                            Buscando...
                          </span>
                        </div>
                      ) : (
                        <>
                          <CommandEmpty className="py-4 text-center text-sm">
                            No hay resultados.
                          </CommandEmpty>
                          {allOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              className="cursor-pointer"
                              onSelect={() => {
                                const newValue =
                                  option.value === field.value
                                    ? ""
                                    : option.value;
                                field.onChange(newValue);
                                // Llamar onValueChange si existe, pasando el item completo
                                if (onValueChange) {
                                  const selectedItem = data?.data?.find(
                                    (item) =>
                                      mapOptionFn(item).value === option.value
                                  );
                                  onValueChange(newValue, selectedItem);
                                }
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  option.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span
                                  className={cn("truncate", classNameOption)}
                                >
                                  {typeof option.label === "function"
                                    ? option.label()
                                    : option.label}
                                </span>
                                {option.description && (
                                  <span className="text-[10px] text-muted-foreground truncate">
                                    {withValue && `${option.value} - `}{" "}
                                    {option.description}
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
                </PopoverContent>
              </Popover>
              {children}
            </div>
            {description && (
              <FormDescription className="text-xs text-muted-foreground mb-0!">
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
