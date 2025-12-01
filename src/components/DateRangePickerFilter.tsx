"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerFilterProps {
  dateFrom?: Date;
  dateTo?: Date;
  onDateChange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void;
  placeholder?: string;
  dateFormat?: string;
  className?: string;
}

export function DateRangePickerFilter({
  dateFrom,
  dateTo,
  onDateChange,
  placeholder = "Selecciona un rango",
  dateFormat = "dd/MM/yyyy",
  className,
}: DateRangePickerFilterProps) {
  const dateRange: DateRange = {
    from: dateFrom,
    to: dateTo,
  };

  const displayValue =
    dateRange.from && dateRange.to
      ? `${format(dateRange.from, dateFormat, { locale: es })} - ${format(
          dateRange.to,
          dateFormat,
          { locale: es }
        )}`
      : dateRange.from
      ? `${format(dateRange.from, dateFormat, { locale: es })} - ...`
      : placeholder;

  const handleSelect = (range: DateRange | undefined) => {
    // Always update both dates, even if one is undefined
    // This allows the calendar to work naturally in range mode
    onDateChange(range?.from, range?.to);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateRange.from && "text-muted-foreground",
            className
          )}
        >
          {displayValue}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-h-none" align="start">
        <Calendar
          locale={es}
          mode="range"
          numberOfMonths={2}
          selected={dateRange}
          defaultMonth={dateRange?.from}
          onSelect={handleSelect}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
}
