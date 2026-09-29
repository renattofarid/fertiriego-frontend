import type { ModelComplete } from "@/lib/core.interface";
import { DollarSign } from "lucide-react";

// Interface para las cuotas de compra (Purchase Installments)
export interface PurchaseInstallmentResource {
  id: number;
  correlativo: string;
  purchase_id: number;
  purchase_correlativo: string;
  installment_number: number;
  due_days: number;
  due_date: string;
  amount: string;
  pending_amount: string;
  status: string;
  created_at: string;
  currency?: string;
  purchase?: PurchaseInstallmentPurchase;
}

// Compra asociada a la cuota (proveedor y comprobante)
export interface PurchaseInstallmentPurchase {
  id: number;
  correlativo: string;
  supplier_id: number;
  supplier_name: string;
  warehouse_id: number;
  user_id: number;
  purchase_order_id: number | null;
  document_type: string;
  document_number: string;
  issue_date: string;
  due_date: string;
  payment_type: string;
  total_amount: string;
  current_amount: string;
  currency: string;
  status: string;
  observations: string | null;
  created_at: string;
}

export interface PurchaseInstallmentResponse {
  data: PurchaseInstallmentResource[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface SinglePurchaseInstallmentResponse {
  data: PurchaseInstallmentResource;
}

// Reutilizamos las interfaces de purchase para payments
export type {
  PurchasePaymentResource,
  CreatePurchasePaymentRequest,
} from "@/pages/purchase/lib/purchase.interface";

export const ACCOUNTS_PAYABLE_ENDPOINT = "/purchaseinstallment";
export const ACCOUNTS_PAYABLE_QUERY_KEY = "accounts-payable";

export const AccountsPayableRoute = "/cuentas-por-pagar";
const NAME = "Cuenta por Pagar";

export const ACCOUNTS_PAYABLE: ModelComplete = {
  MODEL: {
    name: NAME,
    description: "Registro de cuentas por pagar a proveedores",
    plural: "Cuentas por Pagar",
    gender: false,
  },
  ICON: "DollarSign",
  ICON_REACT: DollarSign,
  ENDPOINT: ACCOUNTS_PAYABLE_ENDPOINT,
  QUERY_KEY: ACCOUNTS_PAYABLE_QUERY_KEY,
  ROUTE: AccountsPayableRoute,
  ROUTE_ADD: `${AccountsPayableRoute}/agregar`,
  ROUTE_UPDATE: `${AccountsPayableRoute}/[id]/actualizar`,
  EMPTY: {} as any,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Formulario para crear una nueva ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Formulario para actualizar una ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirmar eliminación de la ${NAME.toLowerCase()}`,
    },
  },
};

// Resumen de cuentas por pagar
export interface AccountsPayableSummary {
  total_pending: number;
  total_overdue: number;
  total_to_expire_soon: number;
  total_installments: number;
}
