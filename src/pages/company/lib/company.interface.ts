import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Building } from "lucide-react";

const ROUTE = "/empresa";
const NAME = "Empresa";

export const COMPANY: ModelComplete<CompanyResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de información empresarial en el sistema.",
    plural: "Empresas",
    gender: false,
  },
  ICON: "Building",
  ICON_REACT: Building,
  ENDPOINT: "/company",
  QUERY_KEY: "companies",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para crear una nueva ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos para modificar la ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar la ${NAME.toLowerCase()}`,
    },
  },
  EMPTY: {
    id: 0,
    social_reason: "",
    ruc: "",
    trade_name: "",
    address: "",
    phone: "",
    email: "",
    responsible_id: 0,
    responsible_full_name: "",
    created_at: "",
  },
};

export interface CompanyResponse {
  data: CompanyResource[];
  links: Links;
  meta: Meta;
}

export interface CompanyResource {
  id: number;
  social_reason: string;
  ruc: string;
  trade_name: string;
  address: string;
  phone: string;
  email: string;
  responsible_id: number;
  responsible_full_name: string;
  created_at: string;
}

export interface CompanyResourceById {
  data: CompanyResource;
}

export interface getCompanyProps {
  params?: Record<string, any>;
}
