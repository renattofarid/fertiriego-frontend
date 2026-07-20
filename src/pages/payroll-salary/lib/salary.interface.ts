import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Wallet } from "lucide-react";

const ROUTE = "/planillas/salarios";
const NAME = "Salario Base";

export const SALARY: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de salarios base de los trabajadores.",
    plural: "Salarios Base",
    gender: false,
  },
  ICON: "Wallet",
  ICON_REACT: Wallet,
  ENDPOINT: "/payroll/hr/salaries",
  QUERY_KEY: "payroll-salaries",
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

export interface PensionSystemResource {
  id: number;
  name: string;
  type: string;
}

export interface SalaryResource {
  id: number;
  person_id: number;
  person_name?: string;
  base_salary: string;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  pension_system?: PensionSystemResource | null;
  created_at: string;
}

export interface SalaryResponse {
  data: SalaryResource[];
  links: Links;
  meta: Meta;
}

export interface CreateSalaryRequest {
  person_id: number;
  base_salary: number;
  valid_from: string;
  valid_until: string | null;
}

export interface CreateSalaryResponse {
  message: string;
  data: SalaryResource;
}

export interface GetSalariesProps {
  params?: Record<string, unknown>;
}
