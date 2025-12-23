import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Building2 } from "lucide-react";

const ROUTE = "/sucursal";
const NAME = "Sucursal";

export const BRANCH: ModelComplete<BranchResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de sucursales de la empresa.",
    plural: "Sucursales",
    gender: false,
  },
  ICON: "Building2",
  ICON_REACT: Building2,
  ENDPOINT: "/branch",
  QUERY_KEY: "branches",
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
    name: "",
    address: "",
    is_invoice: 0,
    responsible_id: 0,
    responsible_full_name: "",
    phone: "",
    email: "",
    company_id: 0,
    created_at: "",
    has_igv: 0,
    company_name: "",
  },
};

export interface BranchResponse {
  data: BranchResource[];
  links: Links;
  meta: Meta;
}

export interface BranchResource {
  id: number;
  name: string;
  address: string;
  is_invoice: number;
  responsible_id: number;
  responsible_full_name: string;
  phone: string;
  email: string;
  has_igv: number;
  company_id: number;
  company_name?: string;
  created_at: string;
}

export interface BranchResourceById {
  data: BranchResource;
}

export interface getBranchProps {
  params?: Record<string, any>;
}
