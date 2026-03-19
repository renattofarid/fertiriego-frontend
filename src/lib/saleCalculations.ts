/** Redondear a 8 decimales (para cálculos internos de precios unitarios) */
export const roundTo8 = (n: number): number =>
  Math.round(n * 100000000) / 100000000;

/** Redondear a 4 decimales (para cálculos internos de ítems) */
export const roundTo4 = (n: number): number =>
  Math.round(n * 10000) / 10000;

/** Redondear a 2 decimales (para cálculos internos de ítems) */
export const roundTo2 = (n: number): number =>
  Math.round(n * 100) / 100;

/** Truncar a 2 decimales sin redondeo hacia arriba (para montos finales y cuotas).
 * Usa toFixed para evitar que errores de representación IEEE 754 causen
 * truncamientos incorrectos (ej. 1144.5999... truncando a 1144.59 en vez de 1144.60).
 */
export const truncTo2 = (n: number): number => {
  const s = n.toFixed(6);
  const dot = s.indexOf(".");
  return parseFloat(dot === -1 ? s : s.slice(0, dot + 3));
};

/**
 * Calcular montos de un ítem a partir del V.Unit (precio SIN IGV).
 * Orden canónico: subtotal → total → igv
 *   subtotal = qty × V.Unit  (coincide visualmente con lo que se muestra)
 *   total    = subtotal × 1.18
 *   igv      = total - subtotal  (garantiza subtotal + igv = total exactamente)
 */
export function calcItemAmounts(
  quantity: number,
  unitPriceSinIGV: number,
): { total: number; subtotal: number; igv: number } {
  const subtotal = roundTo4(quantity * unitPriceSinIGV);
  const total = roundTo4(subtotal * 1.18);
  const igv = roundTo4(total - subtotal);
  return { total, subtotal, igv };
}

/**
 * Sumar totales de una lista de detalles.
 * Acepta tanto el campo `igv` (Sale) como `tax` (Order/Quotation).
 */
export function sumDetailTotals(
  details: Array<{
    subtotal: number;
    igv?: number;
    tax?: number;
    total: number;
  }>,
): { subtotal: number; igv: number; total: number } {
  const subtotal = roundTo4(
    details.reduce((s, d) => s + (d.subtotal || 0), 0),
  );
  const igv = roundTo4(
    details.reduce((s, d) => s + (d.igv ?? d.tax ?? 0), 0),
  );
  const total = roundTo4(details.reduce((s, d) => s + (d.total || 0), 0));
  return { subtotal, igv, total };
}
