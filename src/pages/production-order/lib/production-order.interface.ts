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
// NOTA: el endpoint de listado (GET /production-orders) todavía devuelve
// campos agregados a nivel de orden (product_id/quantity_requested únicos),
// aunque la orden ya admita varios ítems al crearse/editarse. Se deja tal
// cual responde hoy el backend.

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
  waste_quantity: number;
  waste_percentage: number;
  total_cost: number;
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

// ⚠️ IMPORTANTE — desalineación confirmada con el backend:
// El POST/PUT de /production-orders acepta "items[]" (varios productos por
// orden, cada uno con sus propios componentes/BOM). Sin embargo, el
// GET /production-orders/{id} (confirmado con respuesta real) TODAVÍA NO
// devuelve esa agrupación por ítem: sigue entregando un único "product" y un
// solo arreglo plano "components" a nivel de orden (como en el modelo viejo
// de 1 producto por orden), solo que ahora con waste_quantity/waste_percentage
// por componente y overhead_cost a nivel de orden.
// Mientras el backend no exponga "items" en el show, el detalle/edición solo
// puede reconstruir correctamente órdenes de 1 solo ítem — con varios ítems
// se perderá la agrupación (se verá todo como si fuera un único producto).
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
  // ⚠️ waste_quantity/waste_percentage NO se envían en la request: el
  // backend los calcula automáticamente, igual que overhead_cost.
  notes?: string;
}

export interface ProductionOrderItemRequest {
  product_id: number;
  quantity_requested: number;
  labor_cost?: number;
  // ⚠️ overhead_cost NO se envía en la request: es calculado por el backend,
  // no es un dato que el usuario ingrese en el formulario.
  notes?: string;
  // ✅ Componentes opcionales: si no se envían, el backend los autocompleta
  // desde el combo (BOM) definido para el producto.
  components?: ProductionOrderComponentRequest[] | null;
}

export interface CreateProductionOrderRequest {
  warehouse_origin_id: number;
  warehouse_dest_id: number;
  responsible_id: number;
  requested_date: string;
  currency?: string;
  observations?: string;
  items: ProductionOrderItemRequest[];
}

export type UpdateProductionOrderRequest = Partial<CreateProductionOrderRequest>;

// ===== API QUERY PARAMS =====

export interface GetProductionOrdersParams {
  page?: number;
  per_page?: number;
}

// ===== SUMMARY (dashboard de estados) =====

export interface ProductionOrderSummary {
  total: number;
  borrador: number;
  pendiente: number;
  aprobado: number;
  rechazado: number;
  procesado: number;
  anulado: number;
}

export interface ProductionOrderSummaryResponse {
  message: string;
  data: ProductionOrderSummary;
}

// ===== REPORTE: ÓRDENES/ÍTEMS PENDIENTES A PRODUCIR =====
// NOTA: al momento de documentar, /production-orders/pending devolvía
// "data": [] (sin órdenes aprobadas pendientes de producir en ese momento),
// por lo que la forma exacta de cada fila no está confirmada por el backend.
// Se modela con los campos más probables (orden + ítem + saldo pendiente)
// y se debe ajustar cuando el backend entregue un ejemplo con datos reales.
export interface ProductionOrderPendingItem {
  order_id: number;
  order_number: string;
  status: ProductionOrderStatus;
  requested_date: string;
  approved_at: string | null;
  item_id: number;
  product_id: number;
  product_name: string;
  quantity_requested: number;
  quantity_produced: number;
  quantity_pending: number;
  warehouse_origin_id?: number;
  warehouse_dest_id?: number;
  responsible_id?: number;
  [key: string]: unknown;
}

export interface ProductionOrderPendingResponse {
  message: string;
  data: ProductionOrderPendingItem[];
}

// ===== HISTORIAL DE PRODUCCIÓN PARCIAL POR ÍTEM =====
// NOTA: endpoint pendiente de crear/confirmar por el backend
// (GET /production-order-items/{itemId}/history). Forma asumida en base al
// flujo de "producción parcial + continuar" descrito por el negocio.
export interface ProductionOrderItemHistoryEntry {
  id: number;
  production_order_item_id: number;
  quantity_produced: number;
  production_document_id: number | null;
  produced_by?: ProductionOrderUser | null;
  observations: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface ProductionOrderItemHistoryResponse {
  message: string;
  data: ProductionOrderItemHistoryEntry[];
}

// ===== CONSTANTS =====

export const PRODUCTION_ORDER_ENDPOINT = "/production-orders";
export const PRODUCTION_ORDER_QUERY_KEY = "production-orders";
export const PRODUCTION_ORDER_SUMMARY_ENDPOINT = "/production-orders/summary";
export const PRODUCTION_ORDER_PENDING_ENDPOINT = "/production-orders/pending";
export const PRODUCTION_ORDER_ITEM_HISTORY_ENDPOINT = (itemId: number) =>
  `/production-order-items/${itemId}/history`;

// ===== ROUTES =====

export const ProductionOrderRoute = "/ordenes-produccion";
export const ProductionOrderAddRoute = "/ordenes-produccion/agregar";
export const ProductionOrderEditRoute = "/ordenes-produccion/actualizar/:id";
export const ProductionOrderDetailRoute = "/ordenes-produccion/:id";
export const ProductionOrderPendingRoute = "/ordenes-produccion/pendientes-a-producir";

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

const NAME = "Orden Pedido de Producción";

export const PRODUCTION_ORDER: ModelComplete<ProductionOrderSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de órdenes de producción del sistema.",
    plural: "Órdenes Pedido Producción",
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
