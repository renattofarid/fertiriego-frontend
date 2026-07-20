import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { ArrowUpCircle } from "lucide-react";

const ROUTE = "/planillas/ingresos";
const NAME = "Ingreso";

export const INCOME: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de ingresos adicionales de los trabajadores.",
    plural: "Ingresos",
    gender: false,
  },
  ICON: "ArrowUpCircle",
  ICON_REACT: ArrowUpCircle,
  ENDPOINT: "/payroll/hr/incomes",
  QUERY_KEY: "payroll-incomes",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para registrar un nuevo ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos para modificar el ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar el ${NAME.toLowerCase()}`,
    },
  },
  EMPTY: {},
};

export type IncomeType =
  | "FIJO"
  | "VARIABLE"
  | "GRATIFICACION"
  | "CTS"
  | "BONO"
  | "OTRO";

export const INCOME_TYPE_OPTIONS: { value: IncomeType; label: string }[] = [
  { value: "FIJO", label: "Fijo" },
  { value: "VARIABLE", label: "Variable" },
  { value: "GRATIFICACION", label: "Gratificación" },
  { value: "CTS", label: "CTS" },
  { value: "BONO", label: "Bono" },
  { value: "OTRO", label: "Otro" },
];

export interface IncomeResource {
  id: number;
  person_id: number;
  person_name?: string;
  concept: string;
  type: IncomeType;
  amount: string;
  is_taxable: boolean;
  is_active: boolean;
  created_at: string;
}

export interface IncomeResponse {
  data: IncomeResource[];
  links: Links;
  meta: Meta;
}

export interface CreateIncomeRequest {
  person_id: number;
  concept: string;
  type: IncomeType;
  amount: number;
  is_taxable?: boolean | null;
  is_active?: boolean | null;
}

export interface CreateIncomeResponse {
  message: string;
  data: IncomeResource;
}

export interface DeleteIncomeResponse {
  message: string;
  data: boolean;
}

export interface GetIncomesProps {
  params?: Record<string, unknown>;
}
