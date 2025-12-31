// ============================================
// QUOTATION - Interfaces, Types & Routes
// ============================================

// ===== API RESOURCES =====

export interface QuotationDetailResource {
  id: number;
  quotation_id: number;
  product_id: number;
  product: {
    id: number;
    observations: string | null;
    is_igv: number;
    name: string;
    category_id: number;
    brand_id: number;
    unit_id: number;
    product_type: string | null;
    technical_sheet: string | null;
    created_at: string;
    product_type_id: number;
  };
  is_igv: boolean;
  quantity: string;
  unit_price: string;
  purchase_price: string;
  description?: string;
  subtotal: string;
  tax: string;
  total: string;
  created_at: string;
}

export interface QuotationResource {
  id: number;
  quotation_number: string;
  fecha_emision: string;
  delivery_time: string;
  validity_time: string;
  currency: string;
  payment_type: string;
  days?: number;
  observations: string;
  status: string;
  address: string;
  reference: string;
  account_number: string;
  order_purchase?: string;
  order_service?: string;
  warehouse_id: number;
  warehouse: {
    id: number;
    name: string;
    address: string;
    status: string;
    capacity: number;
    responsible_id: number;
    branch_id: number;
    phone: string;
    email: string;
    created_at: string;
  };
  customer_id: number;
  customer: {
    id: number;
    type_document: string;
    type_person: string;
    number_document: string;
    names: string;
    father_surname: string;
    mother_surname: string;
    business_name: string;
    address: string;
    phone: string;
    email: string;
    ocupation: string;
    status: string;
    gender: string | null;
    birth_date: string | null;
    commercial_name: string | null;
    full_name: string;
  };
  user_id: number;
  user: {
    id: number;
    name: string;
    username: string;
    status: string;
    person_id: number;
    rol_id: number;
    created_at: string | null;
    updated_at: string;
    deleted_at: string | null;
  };
  quotation_details: QuotationDetailResource[];
  created_at: string;
}

export interface QuotationResourceById {
  data: QuotationResource;
}

// ===== API RESPONSES =====

export interface QuotationResponse {
  data: QuotationResource[];
  links: Links;
  meta: Meta;
}

// ===== CREATE/UPDATE REQUESTS =====

export interface CreateQuotationDetailRequest {
  product_id: number;
  is_igv: boolean;
  quantity: number;
  unit_price: number;
  purchase_price: number;
  description?: string;
}

export interface CreateQuotationRequest {
  fecha_emision: string;
  delivery_time: string;
  validity_time: string;
  currency: string;
  payment_type: string;
  days?: number;
  observations: string;
  address: string;
  reference: string;
  order_purchase?: string;
  order_service?: string;
  warehouse_id: number;
  customer_id: number;
  user_id: number;
  quotation_details: CreateQuotationDetailRequest[];
}

export interface UpdateQuotationRequest {
  fecha_emision?: string;
  delivery_time?: string;
  validity_time?: string;
  currency?: string;
  payment_type?: string;
  days?: number;
  observations?: string;
  status?: string;
  address?: string;
  reference?: string;
  order_purchase?: string;
  order_service?: string;
  warehouse_id?: number;
  customer_id?: number;
  user_id?: number;
  quotation_details?: CreateQuotationDetailRequest[];
}

// ===== CONSTANTS =====

export const QUOTATION_ENDPOINT = "/quotation";
export const QUOTATION_QUERY_KEY = "quotations";
export const QUOTATION_DETAIL_QUERY_KEY = "quotation-details";

// ===== ROUTES =====

export const QuotationRoute = "/cotizaciones";
export const QuotationAddRoute = "/cotizaciones/agregar";
export const QuotationEditRoute = "/cotizaciones/actualizar/:id";
export const QuotationDetailRoute = "/cotizaciones/:id";

// ===== STATUS & TYPE OPTIONS =====

export const PAYMENT_TYPES = [
  { value: "CONTADO", label: "Contado" },
  { value: "CREDITO", label: "Crédito" },
] as const;

export const CURRENCIES = [
  { value: "PEN", label: "S/. Soles" },
  { value: "USD", label: "$ Dólares" },
  { value: "EUR", label: "€ Euros" },
] as const;

export const QUOTATION_STATUSES = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Aprobado", label: "Aprobado" },
  { value: "Rechazado", label: "Rechazado" },
  { value: "Vencido", label: "Vencido" },
] as const;

// ===== MODEL COMPLETE =====

import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { FileText } from "lucide-react";

const NAME = "Cotización";
const NAME_DETAIL = "Detalle de Cotización";

export const QUOTATION: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de cotizaciones del sistema.",
    plural: "Cotizaciones",
    gender: false,
  },
  ICON: "FileText",
  ICON_REACT: FileText,
  ENDPOINT: QUOTATION_ENDPOINT,
  QUERY_KEY: QUOTATION_QUERY_KEY,
  ROUTE: QuotationRoute,
  ROUTE_ADD: QuotationAddRoute,
  ROUTE_UPDATE: QuotationEditRoute,
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

export const QUOTATION_DETAIL: ModelComplete<any> = {
  MODEL: {
    name: NAME_DETAIL,
    description: "Gestión de detalles de cotización.",
    plural: "Detalles de Cotización",
    gender: false,
  },
  ICON: "FileText",
  ICON_REACT: FileText,
  ENDPOINT: QUOTATION_ENDPOINT,
  QUERY_KEY: QUOTATION_DETAIL_QUERY_KEY,
  ROUTE: QuotationRoute,
  ROUTE_ADD: QuotationRoute,
  ROUTE_UPDATE: QuotationRoute,
  TITLES: {
    create: {
      title: `Crear ${NAME_DETAIL}`,
      subtitle: `Complete los campos para crear un nuevo detalle`,
    },
    update: {
      title: `Actualizar ${NAME_DETAIL}`,
      subtitle: `Actualice los campos para modificar el detalle`,
    },
    delete: {
      title: `Eliminar ${NAME_DETAIL}`,
      subtitle: `Confirme para eliminar el detalle`,
    },
  },
  EMPTY: {} as any,
};
