import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Tags } from "lucide-react";

const ROUTE = "/categoria";
const NAME = "Categoría";

export const CATEGORY: ModelComplete<CategoryResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de categorías de productos en el sistema.",
    plural: "Categorías",
    gender: false,
  },
  ICON: "Tags",
  ICON_REACT: Tags,
  ENDPOINT: "/category",
  QUERY_KEY: "categories",
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
    parent_id: null,
    parent_name: "",
    level: 1,
    created_at: "",
  },
};

export interface CategoryResponse {
  data: CategoryResource[];
  links: Links;
  meta: Meta;
}

export interface CategoryResource {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  parent_name: string;
  level: number;
  created_at: string;
}

export interface CategoryResourceById {
  data: CategoryResource;
}

export interface getCategoryProps {
  params?: Record<string, any>;
}