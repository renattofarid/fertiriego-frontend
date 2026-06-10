export function formatCurrency(value: number | null | undefined): string {
  return new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export function formatPct(value: number | null | undefined): string {
  return `${(value ?? 0).toFixed(2)}%`;
}
