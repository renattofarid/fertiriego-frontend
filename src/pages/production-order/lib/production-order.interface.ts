// ============================================
// PRODUCTION ORDER - Interfaces, Types & Routes
// ============================================

import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { ClipboardList } from "lucide-react";

// ===== STATUS =====

export type ProductionOrderStatus =
  | "BORRADOR"
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO"
  | "PROCESADO"
  | "ANULADO";

// ===== API RESOURCES (LIST) =====

export interface ProductionOrderResource {
  id: number;
  order_number: string;
  status: ProductionOrderStatus;
  status_badge: string;
  requested_date: string;
  approved_at: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  quantity_requested: number;
  currency: string;
  estimated_component_cost: number;
  labor_cost: number;
  overhead_cost: number;
  estimated_total_cost: number;
  observations: string | null;
  rejection_reason: string | null;
  company_id: number;
  warehouse_origin_id: number;
  warehouse_dest_id: number;
  product_id: number;
  user_id: number;
  responsible_id: number;
  production_document_id: number | null;
}

// ===== API RESOURCES (DETAIL - SHOW) =====

export interface ProductionOrderComponentResource {
  id: number;
  production_order_id: number;
  component_id: number;
  component: {
    id: number;
    name: string;
    category_id: number;
    category_name: string;
    brand_id: number | null;
    brand_name: string | null;
    unit_id: number;
    unit_name: string;
    observations: string;
  };
  quantity_required: number;
  unit_cost: number;
  total_cost: number;
  waste_quantity: number;
  waste_percentage: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductionOrderWarehouse {
  id: number;
  name: string;
  address: string;
  capacity: number;
  responsible_id: number;
  responsible_full_name: string;
  branch_id: number;
  branch_name: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface ProductionOrderProduct {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  brand_id: number | null;
  brand_name: string | null;
  unit_id: number;
  unit_name: string;
  observations: string;
}

export interface ProductionOrderUser {
  id: number;
  name: string | null;
  username: string | null;
  person_id: number | null;
  person: {
    full_name: string;
    number_document: string;
    type_document: string;
  } | null;
  rol_id: number | null;
  rol_name: string | null;
}

export interface ProductionOrderDetailResource extends ProductionOrderResource {
  product: ProductionOrderProduct;
  warehouse_origin: ProductionOrderWarehouse;
  warehouse_dest: ProductionOrderWarehouse;
  user: ProductionOrderUser;
  responsible: ProductionOrderUser;
  approved_by: ProductionOrderUser | null;
  components: ProductionOrderComponentResource[];
  production_document: null | object;
}

// ===== API RESPONSES =====

export interface ProductionOrderResponse {
  data: ProductionOrderResource[];
  meta: Meta;
  links: Links;
}

export interface ProductionOrderResourceById {
  data: ProductionOrderDetailResource;
}

// ===== CREATE/UPDATE REQUESTS =====

export interface ProductionOrderComponentRequest {
  component_id: number;
  quantity_required: number;
  unit_cost?: number;
  waste_quantity?: number;
  waste_percentage?: number;
  notes?: string;
}

export interface CreateProductionOrderRequest {
  warehouse_origin_id: number;
  warehouse_dest_id: number;
  product_id: number;
  responsible_id: number;
  requested_date: string;
  quantity_requested: number;
  currency?: string;
  labor_cost?: number;
  overhead_cost?: number;
  observations?: string;
  components: ProductionOrderComponentRequest[];
}

export interface UpdateProductionOrderRequest {
  warehouse_origin_id?: number;
  warehouse_dest_id?: number;
  product_id?: number;
  responsible_id?: number;
  requested_date?: string;
  quantity_requested?: number;
  currency?: string;
  labor_cost?: number;
  overhead_cost?: number;
  observations?: string;
  components?: ProductionOrderComponentRequest[];
}

// ===== API QUERY PARAMS =====

export interface GetProductionOrdersParams {
  page?: number;
  per_page?: number;
}

// ===== CONSTANTS =====

export const PRODUCTION_ORDER_ENDPOINT = "/production-orders";
export const PRODUCTION_ORDER_QUERY_KEY = "production-orders";

// ===== ROUTES =====

export const ProductionOrderRoute = "/ordenes-produccion";
export const ProductionOrderAddRoute = "/ordenes-produccion/agregar";
export const ProductionOrderEditRoute = "/ordenes-produccion/actualizar/:id";
export const ProductionOrderDetailRoute = "/ordenes-produccion/:id";

// ===== STATUS OPTIONS =====

export const PRODUCTION_ORDER_STATUSES = [
  { value: "BORRADOR", label: "Borrador" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "APROBADO", label: "Aprobado" },
  { value: "RECHAZADO", label: "Rechazado" },
  { value: "PROCESADO", label: "Procesado" },
  { value: "ANULADO", label: "Anulado" },
] as const;

// ===== MODEL COMPLETE =====

import type { ProductionOrderSchema } from "./production-order.schema";

const NAME = "Orden de Producción";

export const PRODUCTION_ORDER: ModelComplete<ProductionOrderSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de órdenes de producción del sistema.",
    plural: "Órdenes de Producción",
    gender: true,
  },
  ICON: "ClipboardList",
  ICON_REACT: ClipboardList,
  ENDPOINT: PRODUCTION_ORDER_ENDPOINT,
  QUERY_KEY: PRODUCTION_ORDER_QUERY_KEY,
  ROUTE: ProductionOrderRoute,
  ROUTE_ADD: ProductionOrderAddRoute,
  ROUTE_UPDATE: ProductionOrderEditRoute,
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
  EMPTY: {} as any,
};
