import { api } from "@/lib/config";
import type {
  PurchaseInstallmentResource,
  PurchaseInstallmentResponse,
  SinglePurchaseInstallmentResponse,
} from "./accounts-payable.interface";
import { ACCOUNTS_PAYABLE_ENDPOINT } from "./accounts-payable.interface";

// ============================================
// Obtener todas las cuotas de compra (cuentas por pagar)
// ============================================

export const getInstallments = async (
  params: Record<string, any>
): Promise<PurchaseInstallmentResponse> => {
  const response = await api.get<PurchaseInstallmentResponse>(
    ACCOUNTS_PAYABLE_ENDPOINT,
    {
      params,
    }
  );
  return response.data;
};

export const getAllInstallments = async (): Promise<
  PurchaseInstallmentResource[]
> => {
  const response = await api.get<PurchaseInstallmentResource[]>(
    ACCOUNTS_PAYABLE_ENDPOINT,
    {
      params: { all: true },
    }
  );
  return response.data;
};

export const getInstallmentById = async (
  id: number
): Promise<PurchaseInstallmentResource> => {
  const response = await api.get<SinglePurchaseInstallmentResponse>(
    `${ACCOUNTS_PAYABLE_ENDPOINT}/${id}`
  );
  return response.data.data;
};
