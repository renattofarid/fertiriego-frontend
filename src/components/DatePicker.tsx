"use client";

import { useState, useEffect, useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon, CalendarPlusIcon, X } from "lucide-react";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { type Matcher } from "react-day-picker";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  tooltip?: string | React.ReactNode;
  dateFormat?: string;
  disabled?: boolean;
  disabledRange?: Matcher | Matcher[];
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
  className?: string;
  showClearButton?: boolean;
  error?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  label,
  description,
  tooltip,
  dateFormat = "dd/MM/yyyy",
  disabled = false,
  disabledRange,
  captionLayout = "label",
  className,
  showClearButton = true,
  error,
}: DatePickerProps) {
  const isMobile = useIsMobile();

  const parsedDate = useMemo(() => {
    if (value instanceof Date) return value;
    if (typeof value === "string" && value) {
      const d = parseISO(value);
      return isValid(d) ? d : undefined;
    }
    return undefined;
  }, [value]);

  const [visibleMonth, setVisibleMonth] = useState<Date | undefined>(
    parsedDate
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (parsedDate && isValid(parsedDate)) {
      setVisibleMonth(parsedDate);
    }
  }, [parsedDate]);

  const displayValue = parsedDate
    ? format(parsedDate, dateFormat, { locale: es })
    : placeholder;

  const handleChange = (date: Date | undefined) => {
    onChange(date);
    if (isMobile && date) {
      setDrawerOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {/* Label */}
      {label && (
        <label className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="ml-2 p-0 aspect-square w-4 h-4 text-center justify-center cursor-help"
                >
                  ?
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </label>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Date Picker */}
      {isMobile ? (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between font-normal",
                !parsedDate && "text-muted-foreground",
                error && "border-red-500"
              )}
              disabled={disabled}
            >
              <span className="truncate">{displayValue}</span>
              <div className="flex items-center space-x-2">
                {parsedDate && showClearButton && !disabled && (
                  <X
                    className="h-4 w-4 hover:text-red-500 transition-colors"
                    onClick={handleClear}
                  />
                )}
                <CalendarPlusIcon className="h-4 w-4 opacity-50" />
              </div>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="w-auto p-0 overflow-hidden">
            <DrawerHeader>
              <DrawerTitle>Selecciona una fecha</DrawerTitle>
            </DrawerHeader>
            <Calendar
              mode="single"
              locale={es}
              selected={parsedDate}
              month={visibleMonth}
              onMonthChange={setVisibleMonth}
              captionLayout={captionLayout}
              onSelect={handleChange}
              disabled={disabledRange}
              className="mx-auto [--cell-size:clamp(0px,calc(100vw/7.5),52px)]"
            />
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between font-normal",
                !parsedDate && "text-muted-foreground",
                error && "border-red-500"
              )}
              
              disabled={disabled}
            >
              <span className="truncate">{displayValue}</span>
              <div className="flex items-center space-x-2">
                {parsedDate && showClearButton && !disabled && (
                  <X
                    className="h-4 w-4 hover:text-red-500 transition-colors"
                    onClick={handleClear}
                  />
                )}
                <CalendarIcon className="h-4 w-4 opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={es}
              selected={parsedDate}
              month={visibleMonth}
              onMonthChange={setVisibleMonth}
              captionLayout={captionLayout}
              onSelect={handleChange}
              disabled={disabledRange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Error Message */}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
