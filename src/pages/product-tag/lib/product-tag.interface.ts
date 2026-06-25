import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Tags } from "lucide-react";

const ROUTE = "/etiquetas-producto";
const NAME = "Etiqueta";

export const PRODUCT_TAG: ModelComplete<TagResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de etiquetas y clasificación de productos.",
    plural: "Etiquetas de Producto",
    gender: true,
  },
  ICON: "Tags",
  ICON_REACT: Tags,
  ENDPOINT: "/tags",
  QUERY_KEY: "product-tags",
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
    slug: "",
    color: "#3b82f6",
    type: "custom",
    description: "",
    is_active: true,
    products_count: 0,
    created_at: "",
  },
};

export type TagType = "rotation" | "priority" | "supplier" | "custom";

export interface TagResponse {
  data: TagResource[];
  links: Links;
  meta: Meta;
}

export interface TagResource {
  id: number;
  name: string;
  slug: string;
  color: string;
  type: TagType;
  description: string;
  is_active: boolean;
  products_count: number;
  created_at: string;
}

export interface TagResourceById {
  data: TagResource;
}

export interface GetTagsProps {
  params?: Record<string, any>;
}
