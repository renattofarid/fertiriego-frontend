import { APP_LOCALE } from "./config";

export type FormatCurrencyOptions = {
  locale?: string;
  currencySymbol?: string; // símbolo a mostrar, ej. 'S/.', '$'
  decimals?: number; // cantidad de decimales a mostrar (compatibilidad hasta 6)
  showSymbol?: boolean;
};

/**
 * Formatea un número con separador de miles respetando `decimals`.
 * Usa redondeo estándar para evitar que la imprecisión del punto flotante
 * cause que valores como 2336.99 se muestren como 2336.98.
 */
export function formatNumber(
  value: number,
  decimals = 2,
  locale: string = APP_LOCALE
): string {
  if (!isFinite(value) || isNaN(value)) return String(value);
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (e) {
    return value.toFixed(decimals);
  }
}

/**
 * Formatea un número como moneda con símbolo opcional.
 * Usa truncamiento previo para mantener compatibilidad con 6 decimales.
 */
export function formatCurrency(
  value: number,
  options: FormatCurrencyOptions = {}
): string {
  const {
    locale = APP_LOCALE,
    currencySymbol = "",
    decimals = 2,
    showSymbol = true,
  } = options;

  if (!isFinite(value) || isNaN(value)) return String(value);

  const formatted = formatNumber(value, decimals, locale);

  if (!showSymbol || !currencySymbol) return formatted;

  // Asegurar espacio entre símbolo y número si no existe
  return `${currencySymbol}${currencySymbol.endsWith(" ") ? "" : " "}${formatted}`;
}

export default formatCurrency;
