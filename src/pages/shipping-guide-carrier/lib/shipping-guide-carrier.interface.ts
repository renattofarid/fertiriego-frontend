// ============================================
// SHIPPING GUIDE CARRIER - Interfaces, Types & Routes
// ============================================

import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Truck } from "lucide-react";

// ===== API RESOURCES =====

export type ShippingGuideCarrierStatus =
  | "EMITIDA"
  | "EN_TRANSITO"
  | "ENTREGADA"
  | "ANULADA";

export interface ShippingGuideCarrierDetailResource {
  id: number;
  product_id: number;
  product_name: string;
  product_code?: string;
  description: string;
  quantity: string;
  unit: string;
  weight: string;
}

interface PersonResource {
  id: number;
  type_document: string;
  type_person: string;
  number_document: string;
  names: string | null;
  father_surname: string | null;
  mother_surname: string | null;
  gender: string | null;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  business_name: string | null;
  commercial_name: string | null;
  driver_license: string | null;
  user_id: number | null;
  created_at: string;
  roles: any[];
}

export interface ShippingGuideCarrierResource {
  id: number;
  guide_series: string;
  guide_number: number;
  full_guide_number: string;
  issue_date: string;
  transfer_start_date: string;
  driver_license: string | null;
  origin_address: string;
  destination_address: string;
  total_weight: string;
  total_packages: number;
  transport_modality: string;
  motive_id: number;
  status: ShippingGuideCarrierStatus;
  observations?: string | null;
  sunat_status?: string | null;
  carrier: PersonResource;
  remittent?: PersonResource | null;
  recipient?: PersonResource | null;
  driver: {
    id: number | null;
    full_name: string | null;
    license_number: string | null;
    phone: string | null;
  };
  vehicle: {
    id: number | null;
    plate: string | null;
    brand: string | null;
    model: string | null;
  };
  vehicle_plate: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_mtc: string | null;
  secondary_vehicle: {
    id: number;
    plate: string;
    brand: string;
    model: string;
  } | null;
  origin_ubigeo?: {
    id: number;
    name: string;
    cadena: string;
    ubigeo_code: string;
  } | null;
  destination_ubigeo?: {
    id: number;
    name: string;
    cadena: string;
    ubigeo_code: string;
  } | null;
  user: {
    id: number;
    name: string;
    email: string | null;
  };
  payment_responsible: string;
  details: ShippingGuideCarrierDetailResource[];
  created_at: string;
  updated_at: string;
}

export interface ShippingGuideCarrierResourceById {
  data: ShippingGuideCarrierResource;
}

// ===== API RESPONSES =====

export interface ShippingGuideCarrierResponse {
  data: ShippingGuideCarrierResource[];
  meta: Meta;
  links: Links;
}

// ===== CREATE/UPDATE REQUESTS =====

export interface CreateShippingGuideCarrierDetailRequest {
  product_id: number;
  description: string;
  quantity: number;
  unit: string;
  weight: number;
}

export interface CreateShippingGuideCarrierRequest {
  transport_modality: string;
  motive_id?: number;
  // Campos para TRANSPORTE PÚBLICO
  carrier_id?: number | null;
  // Campos para TRANSPORTE PRIVADO
  driver_id?: number | null;
  vehicle_id?: number | null;
  vehicle_plate?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_mtc?: string;
  driver_license?: string;
  // Otros campos
  issue_date: string;
  transfer_start_date: string;
  remittent_id?: number;
  recipient_id?: number;
  secondary_vehicle_id?: number;
  order_id?: number | null;
  shipping_guide_remittent_id?: number | null;
  third_party_id?: number | null;
  payment_responsible?: string;
  // Direcciones (pueden digitarse manualmente o por ID)
  origin_address_id?: number;
  origin_address?: string;
  origin_ubigeo_id: number;
  destination_address_id?: number;
  destination_address?: string;
  destination_ubigeo_id: number;
  observations?: string;
  // Totales
  total_weight: number;
  total_packages: number;
  details: CreateShippingGuideCarrierDetailRequest[];
}

export interface UpdateShippingGuideCarrierRequest {
  transport_modality?: string;
  motive_id?: number;
  // Campos para TRANSPORTE PÚBLICO
  carrier_id?: number | null;
  // Campos para TRANSPORTE PRIVADO
  driver_id?: number | null;
  vehicle_id?: number | null;
  vehicle_plate?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_mtc?: string;
  driver_license?: string;
  // Otros campos
  issue_date?: string;
  transfer_start_date?: string;
  remittent_id?: number;
  recipient_id?: number;
  secondary_vehicle_id?: number;
  order_id?: number | null;
  shipping_guide_remittent_id?: number | null;
  third_party_id?: number | null;
  payment_responsible?: string;
  // Direcciones
  origin_address_id?: number;
  origin_address?: string;
  origin_ubigeo_id?: number;
  destination_address_id?: number;
  destination_address?: string;
  destination_ubigeo_id?: number;
  observations?: string;
  // Totales
  total_weight?: number;
  total_packages?: number;
  details?: CreateShippingGuideCarrierDetailRequest[];
}

// ===== CONSTANTS =====

export const SHIPPING_GUIDE_CARRIER_ENDPOINT = "/shipping-guide-carriers";
export const SHIPPING_GUIDE_CARRIER_QUERY_KEY = "shipping-guide-carriers";

// ===== ROUTES =====

export const ShippingGuideCarrierRoute = "/guias-transportista";
export const ShippingGuideCarrierAddRoute = "/guias-transportista/agregar";
export const ShippingGuideCarrierEditRoute =
  "/guias-transportista/actualizar/:id";
export const ShippingGuideCarrierDetailRoute = "/guias-transportista/:id";

// ===== STATUS & TYPE OPTIONS =====

export const UNIT_MEASUREMENTS = [
  { value: "KGM", label: "Kilogramos (KGM)" },
  { value: "TNE", label: "Toneladas (TNE)" },
  { value: "GRM", label: "Gramos (GRM)" },
  { value: "SACO", label: "Saco" },
  { value: "UND", label: "Unidades (UND)" },
] as const;

export const SHIPPING_GUIDE_CARRIER_STATUSES = [
  { value: "EMITIDA", label: "Emitida" },
  { value: "EN_TRANSITO", label: "En Tránsito" },
  { value: "ENTREGADA", label: "Entregada" },
  { value: "ANULADA", label: "Anulada" },
] as const;

// ===== MODEL COMPLETE =====
import type { ShippingGuideCarrierSchema } from "./shipping-guide-carrier.schema.ts";

const NAME = "Guía de Transportista";

export const SHIPPING_GUIDE_CARRIER: ModelComplete<ShippingGuideCarrierSchema> =
  {
    MODEL: {
      name: NAME,
      description: "Gestión de guías de transportista del sistema.",
      plural: "Guías de Transportista",
      gender: false,
    },
    ICON: "Truck",
    ICON_REACT: Truck,
    ENDPOINT: SHIPPING_GUIDE_CARRIER_ENDPOINT,
    QUERY_KEY: SHIPPING_GUIDE_CARRIER_QUERY_KEY,
    ROUTE: ShippingGuideCarrierRoute,
    ROUTE_ADD: ShippingGuideCarrierAddRoute,
    ROUTE_UPDATE: ShippingGuideCarrierEditRoute,
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
