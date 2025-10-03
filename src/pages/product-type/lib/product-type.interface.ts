import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Tag } from "lucide-react";
import type { ProductTypeSchema } from "./product-type.schema";

const ROUTE = "/tipos-producto";
const NAME = "Tipo de Producto";

export const PRODUCT_TYPE: ModelComplete<ProductTypeSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de tipos de producto del sistema.",
    plural: "Tipos de Producto",
    gender: false,
  },
  ICON: "Tag",
  ICON_REACT: Tag,
  ENDPOINT: "/producttype",
  QUERY_KEY: "product-types",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para crear un nuevo ${NAME.toLowerCase()}`,
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
  EMPTY: {
    name: "",
    code: "",
  },
};

export interface ProductTypeResponse {
  data: ProductTypeResource[];
  links: Links;
  meta: Meta;
}

export interface ProductTypeResource {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface ProductTypeResourceById {
  data: ProductTypeResource;
}

export interface getProductTypeProps {
  params?: Record<string, unknown>;
}