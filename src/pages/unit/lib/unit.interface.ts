import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Scale } from "lucide-react";

const ROUTE = "/unidad";
const NAME = "Unidad";

export const UNIT: ModelComplete<UnitResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de unidades de medida.",
    plural: "Unidades",
    gender: false,
  },
  ICON: "Scale",
  ICON_REACT: Scale,
  ENDPOINT: "/unit",
  QUERY_KEY: "units",
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
    code: "",
    created_at: "",
  },
};

export interface UnitResponse {
  data: UnitResource[];
  links: Links;
  meta: Meta;
}

export interface UnitResource {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface UnitResourceById {
  data: UnitResource;
}

export interface getUnitProps {
  params?: Record<string, any>;
}