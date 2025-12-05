import type { ModelComplete } from "@/lib/core.interface";
import { DollarSign } from "lucide-react";

// Reutilizamos las interfaces de sale para installments y payments
export type {
  SaleInstallmentResource,
  SalePaymentResource,
} from "@/pages/sale/lib/sale.interface";

export const ACCOUNTS_RECEIVABLE_ENDPOINT = "/installments";
export const ACCOUNTS_RECEIVABLE_QUERY_KEY = "accounts-receivable";

export const AccountsReceivableRoute = "/cuentas-por-cobrar";
const NAME = "Cuenta por Cobrar";

export const ACCOUNTS_RECEIVABLE: ModelComplete = {
  MODEL: {
    name: NAME,
    description: "Registro de cuentas por cobrar de los clientes",
    plural: "Cuentas por Cobrar",
    gender: false,
  },
  ICON: "DollarSign",
  ICON_REACT: DollarSign,
  ENDPOINT: ACCOUNTS_RECEIVABLE_ENDPOINT,
  QUERY_KEY: ACCOUNTS_RECEIVABLE_QUERY_KEY,
  ROUTE: AccountsReceivableRoute,
  ROUTE_ADD: `${AccountsReceivableRoute}/agregar`,
  ROUTE_UPDATE: `${AccountsReceivableRoute}/[id]/actualizar`,
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

// Resumen de cuentas por cobrar
export interface AccountsReceivableSummary {
  total_pending: number;
  total_overdue: number;
  total_to_expire_soon: number;
  total_installments: number;
}
