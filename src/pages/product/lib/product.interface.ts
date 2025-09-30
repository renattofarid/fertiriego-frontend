import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Package } from "lucide-react";
import type { ProductSchema } from "./product.schema";

const ROUTE = "/productos";
const NAME = "Producto";

export const PRODUCT: ModelComplete<ProductSchema> = {
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
    name: "",
    category_id: 0,
    brand_id: 0,
    unit_id: 0,
    product_type: "",
    technical_sheet: [],
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
  components: {
    component_id: number;
    component_name: string | null;
    component_quantity: number;
  }[];
  created_at: string;
}

export interface ProductResourceById {
  data: ProductResource;
}

export interface getProductProps {
  params?: Record<string, unknown>;
}

export interface DeleteTechnicalSheetRequest {
  value: string;
}

// Product Image Interfaces
export interface ProductImageResource {
  id: number;
  product_id: string;
  product_name: string;
  image_url: string;
  alt_text: string;
  created_at: string;
}

export interface ProductImageResponse {
  data: ProductImageResource[];
  links: Links;
  meta: Meta;
}

export interface ProductImageResourceById {
  data: ProductImageResource;
}

export interface CreateProductImageRequest {
  product_id: number;
  image_url: File[];
  alt_text: string;
}

export interface GetProductImagesProps {
  productId: number;
  params?: Record<string, unknown>;
}

// Product Price Interfaces
export interface ProductPriceResource {
  id: number;
  product_id: number;
  product_name: string;
  branch_id: number;
  branch_name: string;
  category: "LISTA 1" | "LISTA 2" | "LISTA 3" | "LISTA 4" | "LISTA 5";
  price_soles: string;
  price_usd: string;
  created_at: string;
}

export interface ProductPriceResponse {
  data: ProductPriceResource[];
  links: Links;
  meta: Meta;
}

export interface ProductPriceResourceById {
  data: ProductPriceResource;
}

export interface CreateProductPriceRequest {
  product_id: number;
  branch_id: number;
  category: "LISTA 1" | "LISTA 2" | "LISTA 3" | "LISTA 4" | "LISTA 5";
  price_soles: number;
  price_usd: number;
}

export interface UpdateProductPriceRequest {
  branch_id?: number;
  category?: "LISTA 1" | "LISTA 2" | "LISTA 3" | "LISTA 4" | "LISTA 5";
  price_soles?: number;
  price_usd?: number;
}

export interface GetProductPricesProps {
  productId: number;
  params?: Record<string, unknown>;
}

// Product Component Interfaces
export interface ProductComponentResource {
  id: number;
  product_id: number;
  product_name: string;
  component_id: number;
  component_name: string | null;
  quantity: number;
  created_at: string;
}

export interface ProductComponentResponse {
  data: ProductComponentResource[];
  links: Links;
  meta: Meta;
}

export interface ProductComponentResourceById {
  data: ProductComponentResource;
}

export interface CreateProductComponentRequest {
  product_id: number;
  component_id: number;
  quantity: number;
}

export interface UpdateProductComponentRequest {
  component_id?: number;
  quantity?: number;
}

export interface GetProductComponentsProps {
  productId: number;
  params?: Record<string, unknown>;
}
