"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const MONTHS_FULL = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

interface MonthPickerProps {
  /** Mes en formato "yyyy-MM" */
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Formato corto ("nov 2026") en lugar del largo ("noviembre 2026") */
  short?: boolean;
  /** Meses anteriores a este ("yyyy-MM") quedan deshabilitados */
  min?: string;
  /** Meses posteriores a este ("yyyy-MM") quedan deshabilitados */
  max?: string;
}

const parse = (v?: string) => {
  if (!v) return null;
  const [y, m] = v.split("-").map(Number);
  if (!y || !m) return null;
  return { year: y, month: m - 1 };
};

const toKey = (year: number, month: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}`;

export default function MonthPicker({
  value,
  onChange,
  placeholder = "Selecciona un mes",
  className,
  disabled = false,
  short = false,
  min,
  max,
}: MonthPickerProps) {
  const parsed = parse(value);
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(parsed?.year ?? new Date().getFullYear());

  // Al abrir, vuelve al año seleccionado
  useEffect(() => {
    if (open) setYear(parsed?.year ?? new Date().getFullYear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const label = parsed
    ? short
      ? `${MONTHS[parsed.month].toLowerCase()} ${parsed.year}`
      : `${MONTHS_FULL[parsed.month]} ${parsed.year}`
    : placeholder;

  const today = new Date();
  const currentKey = toKey(today.getFullYear(), today.getMonth());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-between font-normal",
            !parsed && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate capitalize">{label}</span>
          <CalendarIcon className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-3" align="start">
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Año anterior"
            onClick={() => setYear((y) => y - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-semibold tabular-nums">{year}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Año siguiente"
            onClick={() => setYear((y) => y + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {MONTHS.map((name, i) => {
            const key = toKey(year, i);
            const selected = key === value;
            const isCurrent = key === currentKey;
            const isDisabled = (!!min && key < min) || (!!max && key > max);
            return (
              <button
                key={key}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={cn(
                  "h-9 rounded-md text-sm transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
                  "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  isCurrent && !selected && "border border-primary/40",
                  selected &&
                    "bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
