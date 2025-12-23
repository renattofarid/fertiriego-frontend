// ============================================
// GUIDE - Interfaces, Types & Routes
// ============================================

// ===== API RESOURCES =====

export interface GuideMotiveResource {
  id: number;
  code: string;
  name: string;
}

export type GuideStatus = "EMITIDA" | "EN_TRANSITO" | "ENTREGADA" | "ANULADA";

export interface GuideResource {
  id: number;
  guide_series: string;
  guide_number: string;
  full_guide_number: string;
  issue_date: string;
  transfer_date: string;
  transport_modality: string;
  driver_license: string;
  origin_address: string;
  destination_address: string;
  total_weight: string;
  total_packages: number;
  status: GuideStatus;
  observations?: string;
  warehouse: Warehouse;
  user: User;
  motive: Motive;
  sale: Sale;
  purchase: Purchase;
  warehouse_document: Warehousedocument;
  carrier: Carrier;
  driver: Carrier;
  vehicle: Vehicle;
  origin_ubigeo?: string;
  destination_ubigeo?: string;
  destination_warehouse: Warehouse;
  recipient: Carrier;
  details: GuideDetailResource[];
  created_at: string;
  updated_at: string;
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
  { value: "EMITIDA", label: "Emitida" },
  { value: "EN_TRANSITO", label: "En tránsito" },
  { value: "ENTREGADA", label: "Entregada" },
  { value: "ANULADA", label: "Anulada" },
] as const;

export const GUIDE_STATUS_LABELS: Record<GuideStatus, string> = {
  EMITIDA: "Emitida",
  EN_TRANSITO: "En tránsito",
  ENTREGADA: "Entregada",
  ANULADA: "Anulada",
};

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

export interface GuideDetailResource {
  id: number;
  product_id: number;
  product_name: string;
  product_code?: string;
  description: string;
  quantity: string;
  unit_measure?: string;
  weight: string;
}

interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicle_type: string;
  max_weight: string;
  status: string;
  observations?: string;
  created_at: string;
}

interface Carrier {
  id: number;
  type_document: string;
  type_person: string;
  number_document: string;
  names: string;
  father_surname?: string;
  mother_surname?: string;
  gender?: string;
  birth_date?: string;
  phone: string;
  email: string;
  address: string;
  business_name: string;
  commercial_name: string;
  user_id?: string;
  created_at: string;
  roles: Role[];
}

interface Role {
  id: number;
  name: string;
}

interface Warehousedocument {
  id: number;
  correlativo: string;
  warehouse_id: number;
  warehouse_name: string;
  document_type: string;
  document_number: string;
  destination_warehouse_id?: string;
  destination_warehouse_name?: string;
  person_id: number;
  person_fullname: string;
  user_id: number;
  user_name: string;
  document_date: string;
  posting_date: string;
  status: string;
  observations: string;
  details: Detail2[];
  created_at: string;
}

interface Detail2 {
  id: number;
  warehouse_document_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  observations: string;
}

interface Purchase {
  id: number;
  correlativo: string;
  supplier_id: number;
  supplier_fullname: string;
  warehouse_id: number;
  warehouse_name: string;
  user_id: number;
  user_name: string;
  purchase_order_id: number;
  document_type: string;
  document_number: string;
  issue_date: string;
  payment_type: string;
  total_amount: string;
  current_amount: string;
  currency: string;
  status: string;
  observations: string;
  details: Detail[];
  installments: Installment[];
  created_at: string;
}

interface Installment {
  id: number;
  correlativo: string;
  purchase_id: number;
  purchase_correlativo: string;
  installment_number: number;
  due_days: number;
  due_date: string;
  amount: string;
  pending_amount: string;
  status: string;
  created_at: string;
  currency: string;
}

interface Detail {
  id: number;
  correlativo: string;
  purchase_id: number;
  purchase_correlativo: string;
  product_id: number;
  product_name: string;
  quantity: string;
  unit_price: string;
  subtotal: string;
  tax: string;
  total: string;
  created_at: string;
}

interface Sale {
  id: number;
  customer_id: number;
  warehouse_id: number;
  user_id: number;
  customer_fullname: string;
  customer_document?: string;
  warehouse_name: string;
  user_name: string;
  document_type: string;
  serie: string;
  numero: string;
  full_document_number: string;
  issue_date: string;
  payment_type: string;
  amount_cash: number;
  amount_card: number;
  amount_yape: number;
  amount_plin: number;
  amount_deposit: number;
  amount_transfer: number;
  amount_other: number;
  total_paid: number;
  quotation_id?: string;
  order_id?: string;
  order?: string;
  quotation?: string;
  total_amount: number;
  current_amount: number;
  currency: string;
  status: string;
  observations?: string;
  customer: Customer;
  warehouse: Warehouse;
  user: User;
  created_at: string;
  updated_at: string;
}

interface Customer {
  id: number;
  document_type?: string;
  document_number?: string;
  first_name?: string;
  father_surname?: string;
  mother_surname?: string;
  business_name: string;
  full_name: string;
}

interface Motive {
  id: number;
  code: string;
  name: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
}

interface Warehouse {
  id: number;
  name: string;
  address: string;
}
