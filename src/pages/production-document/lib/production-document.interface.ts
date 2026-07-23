// ============================================
// PRODUCTION DOCUMENT - Interfaces, Types & Routes
// ============================================

import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Factory } from "lucide-react";

// ===== API RESOURCES =====

export type ProductionDocumentStatus = "PROCESADO" | "CANCELADO";

export interface ProductionDocumentComponentResource {
  id: number;
  production_document_id: number;
  component_id: number;
  component_name: string;
  component_code?: string;
  component_weight: number;
  quantity_required: number;
  quantity_used: number;
  quantity_required_formatted: string;
  quantity_used_formatted: string;
  quantity_required_kg: number;
  quantity_used_kg: number;
  unit_cost: number;
  total_cost: number;
  total_cost_formatted: string;
  waste_quantity: number;
  waste_percentage: number;
  has_waste: boolean;
  notes: string;
  component: {
    id: number;
    name: string;
    codigo?: string;
    weight: number;
    unit: string;
    category: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ProductionDocumentResource {
  id: number;
  company_id: number;
  warehouse_origin_id: number;
  warehouse_dest_id: number;
  product_id: number;
  user_id: number;
  responsible_id: number;
  warehouse_origin_name: string;
  warehouse_dest_name: string;
  product_name: string;
  product_code?: string;
  user_name: string;
  responsible_name: string;
  document_number: string;
  production_date: string;
  production_date_formatted: string;
  quantity_produced: number;
  total_component_cost: number;
  labor_cost: number;
  overhead_cost: number;
  total_production_cost: number;
  unit_production_cost: number;
  status: ProductionDocumentStatus;
  status_badge: string;
  observations?: string;
  total_components: number;
  total_waste: number;
  warehouse_origin: {
    id: number;
    name: string;
    address: string;
  };
  warehouse_dest: {
    id: number;
    name: string;
    address: string;
  };
  product: {
    id: number;
    name: string;
    codigo?: string;
    weight: number;
    unit: string;
  };
  user: {
    id: number;
    name: string;
    email?: string;
  };
  responsible: {
    id: number;
    full_name: string;
    document_number?: string;
  };
  details: ProductionDocumentComponentResource[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ProductionDocumentResourceById {
  data: ProductionDocumentResource;
}

// ===== API RESPONSES =====

export interface ProductionDocumentResponse {
  data: ProductionDocumentResource[];
  meta: Meta;
  links: Links;
}

// ===== CREATE/UPDATE REQUESTS =====

export interface CreateProductionDocumentComponentRequest {
  component_id: number;
  quantity_required: number;
  quantity_used: number;
  unit_cost: number;
  notes?: string;
}

export interface CreateProductionDocumentRequest {
  warehouse_origin_id: number;
  warehouse_dest_id: number;
  product_id: number;
  user_id: number;
  responsible_id: number;
  production_date: string;
  quantity_produced: number;
  labor_cost: number;
  overhead_cost: number;
  observations?: string;
  components: CreateProductionDocumentComponentRequest[];
}

export interface UpdateProductionDocumentRequest {
  warehouse_origin_id?: number;
  warehouse_dest_id?: number;
  product_id?: number;
  user_id?: number;
  responsible_id?: number;
  production_date?: string;
  quantity_produced?: number;
  labor_cost?: number;
  overhead_cost?: number;
  observations?: string;
  components?: CreateProductionDocumentComponentRequest[];
}

// ===== API QUERY PARAMS =====

export interface GetProductionDocumentsParams {
  page?: number;
  per_page?: number;
  company_id?: number;
  warehouse_origin_id?: number;
  product_id?: number;
  responsible_id?: number;
  document_number?: string;
  from?: string;
  to?: string;
}

// ===== CONSTANTS =====

export const PRODUCTION_DOCUMENT_ENDPOINT = "/productiondocument";
export const PRODUCTION_DOCUMENT_QUERY_KEY = "production-documents";

// ===== ROUTES =====

export const ProductionDocumentRoute = "/documentos-produccion";
export const ProductionDocumentAddRoute = "/documentos-produccion/agregar";
export const ProductionDocumentEditRoute = "/documentos-produccion/actualizar/:id";
export const ProductionDocumentDetailRoute = "/documentos-produccion/:id";

// ===== STATUS OPTIONS =====

export const PRODUCTION_DOCUMENT_STATUSES = [
  { value: "PROCESADO", label: "Procesado" },
  { value: "CANCELADO", label: "Cancelado" },
] as const;

// ===== MODEL COMPLETE =====
import type { ProductionDocumentSchema } from "./production-document.schema";

const NAME = "Documento de Producción";

export const PRODUCTION_DOCUMENT: ModelComplete<ProductionDocumentSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de documentos de producción del sistema.",
    plural: "Documentos de Producción",
    gender: false,
  },
  ICON: "Factory",
  ICON_REACT: Factory,
  ENDPOINT: PRODUCTION_DOCUMENT_ENDPOINT,
  QUERY_KEY: PRODUCTION_DOCUMENT_QUERY_KEY,
  ROUTE: ProductionDocumentRoute,
  ROUTE_ADD: ProductionDocumentAddRoute,
  ROUTE_UPDATE: ProductionDocumentEditRoute,
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
  EMPTY: {} as any,
};
