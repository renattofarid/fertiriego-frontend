import type { SaleResource } from "./sale.interface";

/**
 * Las cuotas son consistentes si suman el total de la venta, o, cuando hay
 * notas de crédito (total_amount no se reduce pero las cuotas sí), si el
 * saldo pendiente de las cuotas coincide con el saldo actual de la venta.
 */
export const areInstallmentsConsistent = (sale: SaleResource): boolean => {
  const installments = sale.installments ?? [];
  const sumAmount = installments.reduce(
    (sum, inst) => sum + Number(inst.amount),
    0,
  );
  const sumPending = installments.reduce(
    (sum, inst) => sum + Number(inst.pending_amount),
    0,
  );
  return (
    Math.abs(Number(sale.total_amount) - sumAmount) < 0.01 ||
    Math.abs(Number(sale.current_amount) - sumPending) < 0.01
  );
};
