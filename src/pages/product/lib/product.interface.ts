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
    category_id: "",
    brand_id: "",
    unit_id: "",
    product_type_id: "",
    is_igv: false,
    observations: "",
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
  observations?: string;
  is_igv: number;
  technical_sheet?: string[];
  product_images: string[];
  components: Component[];
  created_at: string;
  product_type_id: number;
  product_type_name: string;
}

export interface Component {
  component_id: number;
  component_name: string;
  component_quantity: number;
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
  branch_id: number;
  category_id: number;
  prices?: Prices;
  formatted_prices?: FormattedPrices;
  price_soles?: number;
  price_usd?: number;
  price_euro?: number;
  created_at: string;
}

interface FormattedPrices {
  PEN?: string;
  USD?: string;
  EUR?: string;
  GBP?: string;
  JPY?: string;
  BRL?: string;
  ARS?: string;
  CLP?: string;
  MXN?: string;
  [key: string]: string | undefined;
}

interface Prices {
  PEN?: number;
  USD?: number;
  EUR?: number;
  GBP?: number;
  JPY?: number;
  BRL?: number;
  ARS?: number;
  CLP?: number;
  MXN?: number;
  [key: string]: number | undefined;
}

export interface ProductPriceResourceById {
  data: ProductPriceResource;
}

export interface CreateProductPriceRequest {
  product_id: number;
  branch_id: number;
  category_id: number;
  prices: {
    PEN: number;
    USD: number;
    EUR: number;
    [key: string]: number;
  };
}

export interface UpdateProductPriceRequest {
  branch_id?: number;
  category_id?: number;
  prices?: {
    PEN?: number;
    USD?: number;
    EUR?: number;
    [key: string]: number | undefined;
  };
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
