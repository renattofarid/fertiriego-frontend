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
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
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

interface FormMultiSelectAsyncProps {
  name: string;
  description?: string;
  label?: string | (() => React.ReactNode);
  placeholder?: string;
  control: Control<any>;
  disabled?: boolean;
  tooltip?: string | React.ReactNode;
  className?: string;
  required?: boolean;
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
  additionalParams?: Record<string, any>;
}

export function FormMultiSelectAsync({
  name,
  description,
  label,
  placeholder,
  control,
  disabled,
  tooltip,
  className,
  required = false,
  useQueryHook,
  mapOptionFn,
  perPage = 10,
  debounceMs = 500,
  additionalParams = {},
}: FormMultiSelectAsyncProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allOptions, setAllOptions] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Map<string, Option>>(
    new Map(),
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const { data, isLoading, isFetching } = useQueryHook({
    search: debouncedSearch,
    page,
    per_page: perPage,
    ...additionalParams,
  });

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (debouncedSearch !== search) {
        setDebouncedSearch(search);
        setPage(1);
        if (search !== "" || open) {
          setAllOptions([]);
        }
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, debounceMs, debouncedSearch, open]);

  useEffect(() => {
    if (data?.data) {
      const newOptions = data.data.map(mapOptionFn);
      if (page === 1) {
        setAllOptions(newOptions);
      } else {
        setAllOptions((prev) => {
          const existingIds = new Set(prev.map((opt) => opt.value));
          const uniqueNew = newOptions.filter(
            (opt) => !existingIds.has(opt.value),
          );
          return [...prev, ...uniqueNew];
        });
      }
    }
  }, [data, page, mapOptionFn]);

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
    [isLoading, isFetching, data?.meta?.last_page, page],
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch("");
      setDebouncedSearch("");
      setPage(1);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value: string[] = Array.isArray(field.value) ? field.value : [];

        const toggleValue = (option: Option) => {
          const exists = value.includes(option.value);
          const newValue = exists
            ? value.filter((v) => v !== option.value)
            : [...value, option.value];
          field.onChange(newValue);
          setSelectedOptions((prev) => {
            const next = new Map(prev);
            if (exists) {
              next.delete(option.value);
            } else {
              next.set(option.value, option);
            }
            return next;
          });
        };

        const removeValue = (optionValue: string) => {
          field.onChange(value.filter((v) => v !== optionValue));
          setSelectedOptions((prev) => {
            const next = new Map(prev);
            next.delete(optionValue);
            return next;
          });
        };

        const getLabel = (optionValue: string) => {
          const found =
            allOptions.find((opt) => opt.value === optionValue) ||
            selectedOptions.get(optionValue);
          return found
            ? typeof found.label === "function"
              ? found.label()
              : found.label
            : optionValue;
        };

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

            <div className="flex flex-col gap-2">
              <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      disabled={disabled}
                      className={cn(
                        "w-full justify-between min-h-7 flex min-w-0 truncate",
                        value.length === 0 && "text-muted-foreground",
                        value.length > 0 && "bg-muted",
                        className,
                      )}
                    >
                      <span className="text-nowrap! line-clamp-1">
                        {value.length > 0
                          ? `${value.length} seleccionado${value.length > 1 ? "s" : ""}`
                          : placeholder}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                <PopoverContent
                  className="p-0 min-w-(--radix-popover-trigger-width)! w-auto"
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
                              onSelect={() => toggleValue(option)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  value.includes(option.value)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate">
                                  {typeof option.label === "function"
                                    ? option.label()
                                    : option.label}
                                </span>
                                {option.description && (
                                  <span className="text-[10px] text-muted-foreground truncate">
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

              {value.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {value.map((v) => (
                    <Badge
                      key={v}
                      variant="outline"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span className="truncate max-w-40">{getLabel(v)}</span>
                      <button
                        type="button"
                        onClick={() => removeValue(v)}
                        className="rounded-full hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
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
