import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parse } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convierte un string a Date. Las fechas "yyyy-MM-dd" (sin hora) se interpretan
 * en hora LOCAL; `new Date("2026-11-09")` las toma como UTC y, en zonas con
 * offset negativo (Perú, UTC-5), se mostraría el día anterior (08/11/2026).
 */
export function parseLocalDate(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T00:00:00(?:\.0+)?Z?)?$/.exec(value);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(value);
}

export function formatDateSafe(
  value?: string | null,
  fallback = "N/A",
): string {
  if (!value) return fallback;
  const date = parse(value, "yyyy-MM-dd", new Date());
  if (isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Trunca (sin redondear) un numero a `decimals` decimales.
 * Ej: truncDecimal(1.23456789, 6) => 1.234567
 */
export function truncDecimal(value: number, decimals = 6): number {
  if (!isFinite(value) || isNaN(value)) return value;
  const factor = Math.pow(10, decimals);
  return Math.trunc(value * factor) / factor;
}

/**
 * Formatea un numero truncado a `decimals` decimales y devuelve string con esos decimales.
 * Usa truncDecimal internamente para evitar cualquier redondeo.
 */
export function formatDecimalTrunc(value: number, decimals = 6): string {
  const v = truncDecimal(value, decimals);
  return v.toFixed(decimals);
}

const DECIMAL_QUANTITY_UNITS = new Set([
  "KG",
  "KGM",
  "L",
  "LT",
  "LTR",
  "GR",
  "GRM",
  "G",
  "ML",
]);

const INTEGER_QUANTITY_UNITS = new Set(["NIU", "UND", "PZ", "PZA", "UN"]);

const QUANTITY_UNIT_ALIASES: Record<string, string> = {
  KILO: "KG",
  KILOS: "KG",
  KILOGRAMO: "KG",
  KILOGRAMOS: "KG",
  LITRO: "L",
  LITROS: "L",
  GRAMO: "GR",
  GRAMOS: "GR",
  UNIDAD: "UND",
  UNIDADES: "UND",
  PIEZA: "PZ",
  PIEZAS: "PZ",
};

export function formatQuantityWithUnit(
  quantity: number | null | undefined,
  unit: string,
): string {
  const rawUnit = unit?.trim().toUpperCase() || "";
  const normalizedUnit = QUANTITY_UNIT_ALIASES[rawUnit] ?? rawUnit;

  if (quantity === null || quantity === undefined || !Number.isFinite(quantity)) {
    return normalizedUnit ? `- ${normalizedUnit}` : "-";
  }

  if (DECIMAL_QUANTITY_UNITS.has(normalizedUnit)) {
    return `${quantity.toFixed(2)} ${normalizedUnit}`.trim();
  }

  if (INTEGER_QUANTITY_UNITS.has(normalizedUnit)) {
    return `${Math.round(quantity)} ${normalizedUnit}`.trim();
  }

  return `${quantity} ${normalizedUnit}`.trim();
}

export function getDetailQuantityUnit(
  detail: unknown,
  fallbackUnit = "NIU",
): string {
  const row = detail as Record<string, any>;
  const product = row?.product as Record<string, any> | undefined;

  return (
    row?.unit ||
    row?.unit_measure ||
    product?.unit ||
    product?.unit_measure ||
    product?.unit_code ||
    fallbackUnit
  );
}
