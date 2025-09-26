import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { ShoppingCart } from "lucide-react";

const ROUTE = "/caja";
const NAME = "Caja";

export const BOX: ModelComplete<BoxResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de cajas de punto de venta.",
    plural: "Cajas",
    gender: false,
  },
  ICON: "ShoppingCart",
  ICON_REACT: ShoppingCart,
  ENDPOINT: "/box",
  QUERY_KEY: "boxes",
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
    status: "Activo",
    serie: "",
    branch_id: 0,
    created_at: "",
  },
};

export interface BoxResponse {
  data: BoxResource[];
  links: Links;
  meta: Meta;
}

export interface BoxResource {
  id: number;
  name: string;
  status: string;
  serie: string;
  branch_id: number;
  created_at: string;
}

export interface BoxResourceById {
  data: BoxResource;
}

export interface getBoxProps {
  params?: Record<string, any>;
}