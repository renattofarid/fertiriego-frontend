import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { ArrowDownCircle } from "lucide-react";

const ROUTE = "/planillas/descuentos";
const NAME = "Descuento";

export const DEDUCTION: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de descuentos aplicados a los trabajadores.",
    plural: "Descuentos",
    gender: false,
  },
  ICON: "ArrowDownCircle",
  ICON_REACT: ArrowDownCircle,
  ENDPOINT: "/payroll/hr/deductions",
  QUERY_KEY: "payroll-deductions",
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

export type DeductionType =
  | "FIJO"
  | "VARIABLE"
  | "ADELANTO"
  | "PRESTAMO"
  | "OTRO";

export const DEDUCTION_TYPE_OPTIONS: { value: DeductionType; label: string }[] = [
  { value: "FIJO", label: "Fijo" },
  { value: "VARIABLE", label: "Variable" },
  { value: "ADELANTO", label: "Adelanto" },
  { value: "PRESTAMO", label: "Préstamo" },
  { value: "OTRO", label: "Otro" },
];

export interface DeductionResource {
  id: number;
  person_id: number;
  person_name?: string;
  concept: string;
  type: DeductionType;
  amount: string;
  is_active: boolean;
  created_at: string;
}

export interface DeductionResponse {
  data: DeductionResource[];
  links: Links;
  meta: Meta;
}

export interface CreateDeductionRequest {
  person_id: number;
  concept: string;
  type: DeductionType;
  amount: number;
  is_active?: boolean | null;
}

export interface CreateDeductionResponse {
  message: string;
  data: DeductionResource;
}

export interface DeleteDeductionResponse {
  message: string;
  data: boolean;
}

export interface GetDeductionsProps {
  params?: Record<string, unknown>;
}
