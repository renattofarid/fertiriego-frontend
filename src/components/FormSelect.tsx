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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Control } from "react-hook-form";
import type { Option } from "@/lib/core.interface";

interface FormSelectProps {
  name: string;
  description?: string;
  label: string | (() => React.ReactNode);
  placeholder?: string;
  options: Option[];
  control: Control<any>;
  disabled?: boolean;
  tooltip?: string | React.ReactNode;
  withValue?: boolean;
  classNameOption?: string;
  strictFilter?: boolean;
  enableCodeSearch?: boolean; // Nueva prop para habilitar búsqueda por código
}

export function FormSelect({
  name,
  description,
  label,
  placeholder,
  options,
  control,
  disabled,
  tooltip,
  withValue = false,
  classNameOption,
  strictFilter = false,
  enableCodeSearch = false,
}: FormSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTab, setSearchTab] = useState<"name" | "code">("name");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected = options.find((opt) => opt.value === field.value);

        return (
          <FormItem className="flex flex-col justify-start">
            {typeof label === "function" ? (
              label()
            ) : (
              <FormLabel className="flex justify-start items-center">
                {label}
                {tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="default"
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

            {description && (
              <FormDescription className="text-sm text-muted-foreground !mb-0">
                {description}
              </FormDescription>
            )}

            <Popover
              open={open}
              onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (!newOpen) {
                  setSearch("");
                  if (enableCodeSearch) {
                    setSearchTab("name");
                  }
                }
              }}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    role="combobox"
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between min-h-7 flex min-w-0",
                      !field.value && "text-muted-foreground",
                      field.value && "bg-muted",
                    )}
                  >
                    <span className="!text-nowrap line-clamp-1">
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
                className="p-0 !min-w-(--radix-popover-trigger-width) w-auto"
                onWheel={(e) => e.stopPropagation()}
                onWheelCapture={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {enableCodeSearch ? (
                  <Tabs
                    value={searchTab}
                    onValueChange={(value) => {
                      setSearchTab(value as "name" | "code");
                      setSearch("");
                    }}
                    className="w-full"
                  >
                    <TabsList className="w-full grid grid-cols-2 rounded-b-none">
                      <TabsTrigger value="name" className="text-xs">
                        Por Nombre
                      </TabsTrigger>
                      <TabsTrigger value="code" className="text-xs">
                        Por Código
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="name" className="m-0">
                      <Command
                        className="max-h-72 overflow-hidden"
                        shouldFilter={!strictFilter}
                      >
                        <CommandInput
                          className="border-none focus:ring-0"
                          placeholder="Buscar por nombre..."
                          value={strictFilter ? search : undefined}
                          onValueChange={strictFilter ? setSearch : undefined}
                        />
                        <CommandList className="max-h-60 overflow-y-auto">
                          <CommandEmpty className="py-4 text-center text-sm">
                            No hay resultados.
                          </CommandEmpty>
                          {(strictFilter
                            ? options.filter((option) => {
                                if (!search) return true;
                                const label =
                                  typeof option.label === "function"
                                    ? option.label()
                                    : option.label;
                                return (label || "")
                                  .toString()
                                  .toLowerCase()
                                  .includes(search.toLowerCase());
                              })
                            : options
                          ).map((option) => (
                            <CommandItem
                              key={option.value}
                              className="cursor-pointer"
                              onSelect={() => {
                                const newValue =
                                  option.value === field.value
                                    ? ""
                                    : option.value;
                                field.onChange(newValue);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  option.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
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
                        </CommandList>
                      </Command>
                    </TabsContent>

                    <TabsContent value="code" className="m-0">
                      <Command
                        className="max-h-72 overflow-hidden"
                        shouldFilter={false}
                      >
                        <CommandInput
                          className="border-none focus:ring-0"
                          placeholder="Buscar por código..."
                          value={search}
                          onValueChange={setSearch}
                        />
                        <CommandList className="max-h-60 overflow-y-auto">
                          <CommandEmpty className="py-4 text-center text-sm">
                            No hay resultados.
                          </CommandEmpty>
                          {options
                            .filter((option) => {
                              if (!search) return true;
                              return (option.searchCode || "")
                                .toLowerCase()
                                .includes(search.toLowerCase());
                            })
                            .map((option) => (
                              <CommandItem
                                key={option.value}
                                className="cursor-pointer"
                                onSelect={() => {
                                  const newValue =
                                    option.value === field.value
                                      ? ""
                                      : option.value;
                                  field.onChange(newValue);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 shrink-0",
                                    option.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
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
                        </CommandList>
                      </Command>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <Command
                    className="max-h-72 overflow-hidden"
                    shouldFilter={!strictFilter}
                  >
                    <CommandInput
                      className="border-none focus:ring-0"
                      placeholder="Buscar..."
                      value={strictFilter ? search : undefined}
                      onValueChange={strictFilter ? setSearch : undefined}
                    />
                    <CommandList className="max-h-60 overflow-y-auto">
                      <CommandEmpty className="py-4 text-center text-sm">
                        No hay resultados.
                      </CommandEmpty>
                      {(strictFilter
                        ? options.filter((option) => {
                            if (!search) return true;
                            const label =
                              typeof option.label === "function"
                                ? option.label()
                                : option.label;
                            return (label || "")
                              .toString()
                              .toLowerCase()
                              .includes(search.toLowerCase());
                          })
                        : options
                      ).map((option) => (
                        <CommandItem
                          key={option.value}
                          className="cursor-pointer"
                          onSelect={() => {
                            const newValue =
                              option.value === field.value ? "" : option.value;
                            field.onChange(newValue);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              option.value === field.value
                                ? "opacity-100"
                                : "opacity-0",
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
                                {withValue && `${option.value} - `}{" "}
                                {option.description}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                )}
              </PopoverContent>
            </Popover>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
