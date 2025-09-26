import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Tag } from "lucide-react";

const ROUTE = "/marca";
const NAME = "Marca";

export const BRAND: ModelComplete<BrandResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de marcas de productos.",
    plural: "Marcas",
    gender: false,
  },
  ICON: "Tag",
  ICON_REACT: Tag,
  ENDPOINT: "/brand",
  QUERY_KEY: "brands",
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

export interface BrandResponse {
  data: BrandResource[];
  links: Links;
  meta: Meta;
}

export interface BrandResource {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface BrandResourceById {
  data: BrandResource;
}

export interface getBrandProps {
  params?: Record<string, any>;
}