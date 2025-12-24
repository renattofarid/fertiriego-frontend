import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Tag } from "lucide-react";

const ROUTE = "/categorias-precio-producto";
const NAME = "Categoría de Precio";

export const PRODUCT_PRICE_CATEGORY: ModelComplete<ProductPriceCategoryResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de categorías de precio de productos.",
    plural: "Categorías de Precio",
    gender: false,
  },
  ICON: "Tag",
  ICON_REACT: Tag,
  ENDPOINT: "/productpricecategory",
  QUERY_KEY: "productPriceCategories",
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
    created_at: "",
  },
};

export interface ProductPriceCategoryResponse {
  data: ProductPriceCategoryResource[];
  links: Links;
  meta: Meta;
}

export interface ProductPriceCategoryResource {
  id: number;
  name: string;
  created_at: string;
}

export interface ProductPriceCategoryResourceById {
  data: ProductPriceCategoryResource;
}

export interface getProductPriceCategoryProps {
  params?: Record<string, any>;
}
