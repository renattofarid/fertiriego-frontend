import { Truck } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";

// ===== CONSTANTS =====

export const PURCHASE_SHIPPING_GUIDE_ENDPOINT = "/purchase-shipping-guides";
export const PURCHASE_SHIPPING_GUIDE_DETAIL_ENDPOINT =
  "/purchase-shipping-guide-details";

export const PURCHASE_SHIPPING_GUIDE_QUERY_KEY = "purchase-shipping-guides";
export const PURCHASE_SHIPPING_GUIDE_DETAIL_QUERY_KEY =
  "purchase-shipping-guide-details";

export const PurchaseShippingGuideRoute = "/guias-compra";
export const PurchaseShippingGuideAddRoute = `${PurchaseShippingGuideRoute}/agregar`;
export const PurchaseShippingGuideEditRoute = `${PurchaseShippingGuideRoute}/actualizar`;

const NAME = "Guía de Compra";

// ===== ENUMS =====

export const GUIDE_STATUS = {
  EMITIDA: "EMITIDA",
  EN_TRANSITO: "EN_TRANSITO",
  ENTREGADA: "ENTREGADA",
  CANCELADA: "CANCELADA",
} as const;

export const GUIDE_STATUS_OPTIONS = [
  { value: "EMITIDA", label: "Emitida" },
  { value: "EN_TRANSITO", label: "En Tránsito" },
  { value: "ENTREGADA", label: "Entregada" },
  { value: "CANCELADA", label: "Cancelada" },
];

export const UNIT_OPTIONS = [
  { value: "unidad", label: "Unidad" },
  { value: "kg", label: "Kilogramo (kg)" },
  { value: "caja", label: "Caja" },
  { value: "bolsa", label: "Bolsa" },
  { value: "paquete", label: "Paquete" },
  { value: "litro", label: "Litro" },
  { value: "metro", label: "Metro" },
];

// ===== DETAIL INTERFACES =====

export interface PurchaseShippingGuideDetail {
  product_id: number;
  quantity: number;
  unit: string;
}

export interface PurchaseShippingGuideDetailResource {
  id: number;
  purchase_shipping_guide_id: number;
  purchase_shipping_correlative: string;
  product_id: number;
  product_name: string;
  quantity: string;
  unit: string;
  created_at: string;
}

// ===== MAIN INTERFACES =====

export interface PurchaseShippingGuideResource {
  id: number;
  purchase_id: number | null;
  purchase_correlative: string | null;
  user_id: number;
  guide_number: string;
  issue_date: string;
  transfer_date: string;
  motive: string;
  carrier_name: string;
  carrier_ruc: string;
  vehicle_plate: string;
  driver_name: string;
  driver_license: string;
  origin_address: string;
  destination_address: string;
  total_weight: string;
  observations: string;
  status: keyof typeof GUIDE_STATUS;
  details: PurchaseShippingGuideDetailResource[];
  created_at: string;
}

// ===== REQUEST INTERFACES =====

export interface CreatePurchaseShippingGuideRequest {
  purchase_id?: number | null;
  guide_number: string;
  issue_date: string;
  transfer_date: string;
  motive: string;
  carrier_name: string;
  carrier_ruc: string;
  vehicle_plate: string;
  driver_name: string;
  driver_license: string;
  origin_address: string;
  destination_address: string;
  total_weight: number;
  observations?: string;
  status: string;
  details: PurchaseShippingGuideDetail[];
}

export interface UpdatePurchaseShippingGuideRequest {
  purchase_id?: number | null;
  guide_number?: string;
  issue_date?: string;
  transfer_date?: string;
  motive?: string;
  carrier_name?: string;
  carrier_ruc?: string;
  vehicle_plate?: string;
  driver_name?: string;
  driver_license?: string;
  origin_address?: string;
  destination_address?: string;
  total_weight?: number;
  observations?: string;
  status?: string;
}

export interface AssignPurchaseRequest {
  purchase_id: number;
}

// ===== RESPONSE INTERFACES =====

export interface PurchaseShippingGuideResponse {
  data: PurchaseShippingGuideResource[];
  meta: Meta;
  links: Links;
}

export interface PurchaseShippingGuideResourceById {
  data: PurchaseShippingGuideResource;
}

// ===== MODEL COMPLETE =====

export const PURCHASE_SHIPPING_GUIDE: ModelComplete<CreatePurchaseShippingGuideRequest> =
  {
    MODEL: {
      name: NAME,
      description: "Gestión de guías de compra del sistema.",
      plural: "Guías de Compra",
      gender: false,
    },
    ICON: "Truck",
    ICON_REACT: Truck,
    ENDPOINT: PURCHASE_SHIPPING_GUIDE_ENDPOINT,
    QUERY_KEY: PURCHASE_SHIPPING_GUIDE_QUERY_KEY,
    ROUTE: PurchaseShippingGuideRoute,
    ROUTE_ADD: PurchaseShippingGuideAddRoute,
    ROUTE_UPDATE: PurchaseShippingGuideEditRoute,
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
      purchase_id: null,
      guide_number: "",
      issue_date: "",
      transfer_date: "",
      motive: "",
      carrier_name: "",
      carrier_ruc: "",
      vehicle_plate: "",
      driver_name: "",
      driver_license: "",
      origin_address: "",
      destination_address: "",
      total_weight: 0,
      observations: "",
      status: GUIDE_STATUS.EMITIDA,
      details: [],
    },
  };
