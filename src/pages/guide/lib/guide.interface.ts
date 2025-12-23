// ============================================
// GUIDE - Interfaces, Types & Routes
// ============================================

// ===== API RESOURCES =====

export interface GuideDetailResource {
  id: number;
  sale_shipping_guide_id: number;
  product_id: number;
  quantity: number;
  unit_measure: string;
  description: string;
  weight: number;
  product: Product;
  created_at: string;
}

export interface GuideMotiveResource {
  id: number;
  code: string;
  name: string;
}

export interface GuideResource {
  id: number;
  company_id: number;
  warehouse_id: number;
  sale_id?: number;
  purchase_id?: number;
  warehouse_document_id?: number;
  user_id: number;
  serie: string;
  numero: string;
  full_document_number: string;
  issue_date: string;
  transfer_date: string;
  transport_modality: string;
  motive_id: number;
  carrier_id: number;
  driver_id: number;
  vehicle_id: number;
  driver_license: string;
  origin_address: string;
  origin_ubigeo_id: number;
  destination_address: string;
  destination_ubigeo_id: number;
  destination_warehouse_id?: number;
  recipient_id?: number;
  status: string;
  is_electronic: boolean;
  observations: string;
  company: Company;
  warehouse: Branch;
  user: User;
  motive: GuideMotiveResource;
  sale?: string;
  details: GuideDetailResource[];
  electronic_document?: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  codigo: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
}

interface Branch {
  id: number;
  name: string;
  address: string;
}

interface Company {
  id: number;
  social_reason: string;
  trade_name: string;
  ruc: string;
}

export interface GuideResourceById {
  data: GuideResource;
}

// ===== API RESPONSES =====

export interface GuideResponse {
  data: GuideResource[];
  meta: Meta;
  links: Links;
}

export interface GuideMotiveResponse {
  data: GuideMotiveResource[];
}

// ===== CREATE/UPDATE REQUESTS =====

export interface CreateGuideDetailRequest {
  product_id: number;
  description: string;
  quantity: number;
  unit_measure: string;
  weight: number;
}

export interface CreateGuideRequest {
  warehouse_id: number;
  issue_date: string;
  transfer_date: string;
  motive_id: number;
  sale_id?: number | null;
  purchase_id?: number | null;
  warehouse_document_id?: number | null;
  transport_modality: string;
  carrier_id: number;
  driver_id: number;
  vehicle_id: number;
  driver_license: string;
  origin_address: string;
  origin_ubigeo_id: number;
  destination_address: string;
  destination_ubigeo_id: number;
  destination_warehouse_id?: number | null;
  recipient_id?: number | null;
  observations?: string;
  details: CreateGuideDetailRequest[];
}

export interface UpdateGuideRequest {
  warehouse_id?: number;
  issue_date?: string;
  transfer_date?: string;
  motive_id?: number;
  sale_id?: number | null;
  purchase_id?: number | null;
  warehouse_document_id?: number | null;
  transport_modality?: string;
  carrier_id?: number;
  driver_id?: number;
  vehicle_id?: number;
  driver_license?: string;
  origin_address?: string;
  origin_ubigeo_id?: number;
  destination_address?: string;
  destination_ubigeo_id?: number;
  destination_warehouse_id?: number | null;
  recipient_id?: number | null;
  observations?: string;
  details?: CreateGuideDetailRequest[];
}

// ===== CONSTANTS =====

export const GUIDE_ENDPOINT = "/shipping-guide-remit";
export const GUIDE_MOTIVE_ENDPOINT = "/shipping-motive";

export const GUIDE_QUERY_KEY = "guides";
export const GUIDE_MOTIVE_QUERY_KEY = "shipping-motive";

// ===== ROUTES =====

export const GuideRoute = "/guias";
export const GuideAddRoute = "/guias/agregar";
export const GuideEditRoute = "/guias/actualizar/:id";
export const GuideDetailRoute = "/guias/:id";

// ===== STATUS & TYPE OPTIONS =====

export const MODALITIES = [
  { value: "PUBLICO", label: "Transporte Público" },
  { value: "PRIVADO", label: "Transporte Privado" },
] as const;

export const CARRIER_DOCUMENT_TYPES = [
  { value: "DNI", label: "DNI" },
  { value: "RUC", label: "RUC" },
] as const;

export const DRIVER_DOCUMENT_TYPES = [
  { value: "DNI", label: "DNI" },
  { value: "RUC", label: "RUC" },
  { value: "CARNET_EXT", label: "Carnet de Extranjería" },
] as const;

export const UNIT_MEASUREMENTS = [
  { value: "KGM", label: "Kilogramos (KGM)" },
  { value: "TNE", label: "Toneladas (TNE)" },
  { value: "GRM", label: "Gramos (GRM)" },
  { value: "NIU", label: "Unidades (NIU)" },
] as const;

export const GUIDE_STATUSES = [
  { value: "REGISTRADA", label: "Registrada" },
  { value: "ENVIADA", label: "Enviada" },
  { value: "ACEPTADA", label: "Aceptada" },
  { value: "RECHAZADA", label: "Rechazada" },
  { value: "ANULADA", label: "Anulada" },
] as const;

// ===== MODEL COMPLETE =====

import type { ModelComplete } from "@/lib/core.interface";
import { Truck } from "lucide-react";
import type { GuideSchema } from "./guide.schema";
import type { Links, Meta } from "@/lib/pagination.interface";

const NAME = "Guía de Remisión";

export const GUIDE: ModelComplete<GuideSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de guías de remisión del sistema.",
    plural: "Guías de Remisión",
    gender: false,
  },
  ICON: "Truck",
  ICON_REACT: Truck,
  ENDPOINT: GUIDE_ENDPOINT,
  QUERY_KEY: GUIDE_QUERY_KEY,
  ROUTE: GuideRoute,
  ROUTE_ADD: GuideAddRoute,
  ROUTE_UPDATE: GuideEditRoute,
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
