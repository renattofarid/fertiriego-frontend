import { api } from "@/lib/config";
import type {
  SaleInstallmentResource,
  SalePaymentResource,
} from "@/pages/sale/lib/sale.interface";
import type {
  CreateSalePaymentRequest,
} from "@/pages/sale/lib/sale.interface";
import { ACCOUNTS_RECEIVABLE_ENDPOINT } from "./accounts-receivable.interface";

// ============================================
// Obtener todas las cuotas (cuentas por cobrar)
// ============================================

export const getAllInstallments = async (): Promise<
  SaleInstallmentResource[]
> => {
  const response = await api.get<SaleInstallmentResource[]>(
    ACCOUNTS_RECEIVABLE_ENDPOINT,
    {
      params: { all: true },
    }
  );
  return response.data;
};

// ============================================
// Pagos de cuotas
// ============================================

export const getInstallmentPayments = async (
  installmentId: number
): Promise<SalePaymentResource[]> => {
  const response = await api.get<SalePaymentResource[]>(
    `/installment/${installmentId}/payments`
  );
  return response.data;
};

export const createInstallmentPayment = async (
  installmentId: number,
  data: CreateSalePaymentRequest
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `/installment/${installmentId}/payments`,
    data
  );
  return response.data;
};

export const deleteInstallmentPayment = async (
  installmentId: number,
  paymentId: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/installment/${installmentId}/payments/${paymentId}`
  );
  return response.data;
};
