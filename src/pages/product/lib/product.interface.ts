import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Package } from "lucide-react";

const ROUTE = "/producto";
const NAME = "Producto";

export const PRODUCT: ModelComplete<ProductResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de productos del sistema.",
    plural: "Productos",
    gender: false,
  },
  ICON: "Package",
  ICON_REACT: Package,
  ENDPOINT: "/product",
  QUERY_KEY: "products",
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
    id: 0,
    name: "",
    category_id: 0,
    category_name: "",
    brand_id: 0,
    brand_name: "",
    unit_id: 0,
    unit_name: "",
    product_type: "Normal",
    technical_sheet: [],
    product_images: [],
    components: [],
    created_at: "",
  },
};

export interface ProductResponse {
  data: ProductResource[];
  links: Links;
  meta: Meta;
}

export interface ProductResource {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  brand_id: number;
  brand_name: string;
  unit_id: number;
  unit_name: string;
  product_type: string;
  technical_sheet: string[];
  product_images: string[];
  components: any[];
  created_at: string;
}

export interface ProductResourceById {
  data: ProductResource;
}

export interface getProductProps {
  params?: Record<string, any>;
}

export interface DeleteTechnicalSheetRequest {
  value: string;
}