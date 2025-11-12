import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Trunca (sin redondear) un número a `decimals` decimales.
 * Ej: truncDecimal(1.23456789, 6) => 1.234567
 */
export function truncDecimal(value: number, decimals = 6): number {
  if (!isFinite(value) || isNaN(value)) return value;
  const factor = Math.pow(10, decimals);
  return Math.trunc(value * factor) / factor;
}

/**
 * Formatea un número truncado a `decimals` decimales y devuelve string con esos decimales.
 * Usa truncDecimal internamente para evitar cualquier redondeo.
 */
export function formatDecimalTrunc(value: number, decimals = 6): string {
  const v = truncDecimal(value, decimals);
  // toFixed aquí no redondeará porque ya truncamos
  return v.toFixed(decimals);
}
