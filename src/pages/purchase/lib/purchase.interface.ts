// ============================================
// PURCHASE - Interfaces, Types & Routes
// ============================================

// ===== API RESOURCES =====

export interface PurchaseDetailResource {
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

export interface PurchaseInstallmentResource {
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
}

export interface PurchaseResource {
  id: number;
  correlativo: string;
  supplier_id: number;
  supplier_fullname: string;
  warehouse_id: number;
  warehouse_name: string;
  user_id: number;
  user_name: string;
  purchase_order_id: number | null;
  document_type: string;
  document_number: string;
  issue_date: string;
  payment_type: string;
  total_amount: string;
  current_amount: string;
  currency: string;
  status: string;
  observations: string;
  details: PurchaseDetailResource[];
  installments: PurchaseInstallmentResource[];
  created_at: string;
}

export interface PurchaseResourceById {
  data: PurchaseResource;
}

// ===== API RESPONSES =====

export interface PurchaseResponse {
  current_page: number;
  data: PurchaseResource[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

// ===== CREATE/UPDATE REQUESTS =====

export interface CreatePurchaseDetailRequest {
  product_id: number;
  quantity: number;
  unit_price: number;
  tax: number;
}

export interface CreatePurchaseInstallmentRequest {
  due_days: number;
  amount: number;
}

export interface CreatePurchaseRequest {
  supplier_id: number;
  warehouse_id: number;
  user_id: number;
  purchase_order_id: number | null;
  document_type: string;
  document_number: string;
  issue_date: string;
  payment_type: string;
  currency: string;
  observations: string;
  details: CreatePurchaseDetailRequest[];
  installments: CreatePurchaseInstallmentRequest[];
}

export interface UpdatePurchaseRequest {
  supplier_id?: number;
  warehouse_id?: number;
  user_id?: number;
  purchase_order_id?: number | null;
  document_type?: string;
  document_number?: string;
  issue_date?: string;
  payment_type?: string;
  currency?: string;
  observations?: string;
}

// ===== DETAIL MANAGEMENT =====

export interface PurchaseDetailResponse {
  current_page: number;
  data: PurchaseDetailResource[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PurchaseDetailResourceById {
  data: PurchaseDetailResource;
}

export interface CreatePurchaseDetailRequestFull {
  purchase_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  tax: number;
}

export interface UpdatePurchaseDetailRequest {
  product_id?: number;
  quantity?: number;
  unit_price?: number;
  tax?: number;
}

// ===== INSTALLMENT MANAGEMENT =====

export interface PurchaseInstallmentResponse {
  current_page: number;
  data: PurchaseInstallmentResource[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PurchaseInstallmentResourceById {
  data: PurchaseInstallmentResource;
}

export interface CreatePurchaseInstallmentRequestFull {
  purchase_id: number;
  due_days: number;
  amount: number;
}

export interface UpdatePurchaseInstallmentRequest {
  due_days?: number;
  amount?: number;
}

// ===== PAYMENT MANAGEMENT =====

export interface PurchasePaymentResource {
  id: number;
  correlativo: string;
  purchase_installment_id: number;
  purchase_correlativo: string;
  user_id: number;
  payment_date: string;
  reference_number: string;
  bank_number: string;
  route: string;
  amount_cash: number;
  amount_yape: number;
  amount_plin: number;
  amount_deposit: number;
  amount_transfer: number;
  total_paid: number;
  observation: string;
  created_at: string;
}

export interface PurchasePaymentResponse {
  current_page: number;
  data: PurchasePaymentResource[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PurchasePaymentResourceById {
  data: PurchasePaymentResource;
}

export interface CreatePurchasePaymentRequest {
  purchase_installment_id: number;
  user_id: number;
  payment_date: string;
  reference_number: string;
  bank_number: string;
  route?: string;
  amount_cash: number;
  amount_yape: number;
  amount_plin: number;
  amount_deposit: number;
  amount_transfer: number;
  observation: string;
}

export interface UpdatePurchasePaymentRequest {
  user_id?: number;
  payment_date?: string;
  reference_number?: string;
  bank_number?: string;
  route?: string;
  amount_cash?: number;
  amount_yape?: number;
  amount_plin?: number;
  amount_deposit?: number;
  amount_transfer?: number;
  observation?: string;
}

// ===== CONSTANTS =====

export const PURCHASE_ENDPOINT = "/purchase";
export const PURCHASE_DETAIL_ENDPOINT = "/purchasedetail";
export const PURCHASE_INSTALLMENT_ENDPOINT = "/purchaseinstallment";
export const PURCHASE_PAYMENT_ENDPOINT = "/purchasepayment";

export const PURCHASE_QUERY_KEY = "purchases";
export const PURCHASE_DETAIL_QUERY_KEY = "purchase-details";
export const PURCHASE_INSTALLMENT_QUERY_KEY = "purchase-installments";
export const PURCHASE_PAYMENT_QUERY_KEY = "purchase-payments";

// ===== ROUTES =====

export const PurchaseRoute = "/compras";
export const PurchaseAddRoute = "/compras/agregar";
export const PurchaseEditRoute = "/compras/actualizar/:id";

// ===== STATUS & TYPE OPTIONS =====

export const DOCUMENT_TYPES = [
  { value: "FACTURA", label: "Factura" },
  { value: "BOLETA", label: "Boleta" },
  { value: "GUIA", label: "Guía de Remisión" },
] as const;

export const PAYMENT_TYPES = [
  { value: "CONTADO", label: "Contado" },
  { value: "CREDITO", label: "Crédito" },
] as const;

export const CURRENCIES = [
  { value: "PEN", label: "S/. Soles" },
  { value: "USD", label: "$ Dólares" },
] as const;

export const PURCHASE_STATUSES = [
  { value: "REGISTRADO", label: "Registrado" },
  { value: "PAGADA", label: "PAGADA" },
  { value: "CANCELADO", label: "Cancelado" },
] as const;

export const INSTALLMENT_STATUSES = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PAGADO", label: "PAGADO" },
  { value: "VENCIDO", label: "Vencido" },
] as const;

// ===== MODEL COMPLETE =====

import type { ModelComplete } from "@/lib/core.interface";
import type { PurchaseSchema } from "./purchase.schema";
import { ShoppingCart, PackageOpen, CreditCard, Wallet } from "lucide-react";

const NAME = "Compra";
const NAME_DETAIL = "Detalle de Compra";
const NAME_INSTALLMENT = "Cuota de Compra";
const NAME_PAYMENT = "Pago de Compra";

export const PURCHASE: ModelComplete<PurchaseSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de compras del sistema.",
    plural: "Compras",
    gender: false,
  },
  ICON: "ShoppingCart",
  ICON_REACT: ShoppingCart,
  ENDPOINT: PURCHASE_ENDPOINT,
  QUERY_KEY: PURCHASE_QUERY_KEY,
  ROUTE: PurchaseRoute,
  ROUTE_ADD: PurchaseAddRoute,
  ROUTE_UPDATE: PurchaseEditRoute,
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

export const PURCHASE_DETAIL: ModelComplete<any> = {
  MODEL: {
    name: NAME_DETAIL,
    description: "Gestión de detalles de compra.",
    plural: "Detalles de Compra",
    gender: false,
  },
  ICON: "PackageOpen",
  ICON_REACT: PackageOpen,
  ENDPOINT: PURCHASE_DETAIL_ENDPOINT,
  QUERY_KEY: PURCHASE_DETAIL_QUERY_KEY,
  ROUTE: PurchaseRoute,
  ROUTE_ADD: PurchaseRoute,
  ROUTE_UPDATE: PurchaseRoute,
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

export const PURCHASE_INSTALLMENT: ModelComplete<any> = {
  MODEL: {
    name: NAME_INSTALLMENT,
    description: "Gestión de cuotas de compra.",
    plural: "Cuotas de Compra",
    gender: false,
  },
  ICON: "CreditCard",
  ICON_REACT: CreditCard,
  ENDPOINT: PURCHASE_INSTALLMENT_ENDPOINT,
  QUERY_KEY: PURCHASE_INSTALLMENT_QUERY_KEY,
  ROUTE: PurchaseRoute,
  ROUTE_ADD: PurchaseRoute,
  ROUTE_UPDATE: PurchaseRoute,
  TITLES: {
    create: {
      title: `Crear ${NAME_INSTALLMENT}`,
      subtitle: `Complete los campos para crear una nueva cuota`,
    },
    update: {
      title: `Actualizar ${NAME_INSTALLMENT}`,
      subtitle: `Actualice los campos para modificar la cuota`,
    },
    delete: {
      title: `Eliminar ${NAME_INSTALLMENT}`,
      subtitle: `Confirme para eliminar la cuota`,
    },
  },
  EMPTY: {} as any,
};

export const PURCHASE_PAYMENT: ModelComplete<any> = {
  MODEL: {
    name: NAME_PAYMENT,
    description: "Gestión de pagos de compra.",
    plural: "Pagos de Compra",
    gender: false,
  },
  ICON: "Wallet",
  ICON_REACT: Wallet,
  ENDPOINT: PURCHASE_PAYMENT_ENDPOINT,
  QUERY_KEY: PURCHASE_PAYMENT_QUERY_KEY,
  ROUTE: PurchaseRoute,
  ROUTE_ADD: PurchaseRoute,
  ROUTE_UPDATE: PurchaseRoute,
  TITLES: {
    create: {
      title: `Crear ${NAME_PAYMENT}`,
      subtitle: `Complete los campos para crear un nuevo pago`,
    },
    update: {
      title: `Actualizar ${NAME_PAYMENT}`,
      subtitle: `Actualice los campos para modificar el pago`,
    },
    delete: {
      title: `Eliminar ${NAME_PAYMENT}`,
      subtitle: `Confirme para eliminar el pago`,
    },
  },
  EMPTY: {} as any,
};
