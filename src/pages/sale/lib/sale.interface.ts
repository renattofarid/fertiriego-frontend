// ============================================
// SALE - Interfaces, Types & Routes
// ============================================

// ===== API RESOURCES =====

export interface SaleDetailResource {
  id: number;
  sale_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  unit_price: number;
  purchase_price: number;
  subtotal: number;
  tax: number;
  total: number;
  profit: number;
  profit_margin: number;
  created_at: string;
}

export interface SaleInstallmentResource {
  id: number;
  sale_id: number;
  installment_number: number;
  due_days: number;
  due_date: string;
  amount: number;
  pending_amount: number;
  total_paid: number;
  status: string;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
  currency: string;
}

export interface SaleResource {
  id: number;
  customer_id: number;
  warehouse_id: number;
  user_id: number;
  customer_fullname: string;
  customer_document?: string;
  warehouse_name?: string;
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
  quotation_id?: number;
  order_id?: number;
  total_amount: number;
  current_amount: number;
  currency: string;
  status: string;
  observations?: string;
  customer: Customer;
  warehouse: Warehouse;
  user: User;
  details: SaleDetailResource[];
  installments: SaleInstallmentResource[];
  created_at: string;
  updated_at: string;
}

export interface SaleResourceById {
  data: SaleResource;
}

// ===== API RESPONSES =====

export interface SaleResponse {
  data: SaleResource[];
  links: Links;
  meta: Meta;
}

interface Product {
  id: number;
  name: string;
  code?: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
}

interface Warehouse {
  id?: number;
  name?: string;
  address?: string;
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

// ===== CREATE/UPDATE REQUESTS =====

export interface CreateSaleDetailRequest {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateSaleInstallmentRequest {
  installment_number: number;
  due_days: number;
  amount: number;
}

export interface CreateSaleRequest {
  customer_id: number;
  warehouse_id: number;
  document_type: string;
  issue_date: string;
  payment_type: string;
  currency: string;
  observations: string;
  amount_cash: string;
  amount_card: string;
  amount_yape: string;
  quotation_id?: number;
  order_id?: number;
  details: CreateSaleDetailRequest[];
  installments?: CreateSaleInstallmentRequest[];
}

export interface UpdateSaleRequest {
  customer_id?: number;
  warehouse_id?: number;
  document_type?: string;
  issue_date?: string;
  payment_type?: string;
  currency?: string;
  observations?: string;
  details?: {
    product_id: number;
    quantity: number;
    unit_price: number;
  }[];
  installments?: {
    installment_number: number;
    due_days: number;
    amount: number;
  }[];
}

// ===== DETAIL MANAGEMENT =====

export interface SaleDetailResponse {
  data: SaleDetailResource[];
  links: Links;
  meta: Meta;
}

export interface SaleDetailResourceById {
  data: SaleDetailResource;
}

export interface CreateSaleDetailRequestFull {
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface UpdateSaleDetailRequest {
  product_id?: number;
  quantity?: number;
  unit_price?: number;
}

// ===== INSTALLMENT MANAGEMENT =====

export interface SaleInstallmentResponse {
  data: SaleInstallmentResource[];
  links: Links;
  meta: Meta;
}

export interface SaleInstallmentResourceById {
  data: SaleInstallmentResource;
}

export interface CreateSaleInstallmentRequestFull {
  sale_id: number;
  installment_number: number;
  due_days: number;
  amount: number;
}

export interface UpdateSaleInstallmentRequest {
  due_days?: number;
  amount?: number;
}

// ===== PAYMENT MANAGEMENT =====

export interface SalePaymentResource {
  id: number;
  sale_installment_id: number;
  user_id: number;
  user: User;
  payment_date: string;
  reference_number?: string;
  bank_number?: string;
  route?: string;
  amount_cash: number;
  amount_card: number;
  amount_yape: number;
  amount_plin: number;
  amount_deposit: number;
  amount_transfer: number;
  amount_other: number;
  total_paid: number;
  payment_methods_used: Record<string, number>;
  observation?: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
}

export interface SalePaymentResponse {
  data: SalePaymentResource[];
  links: Links;
  meta: Meta;
}

export interface SalePaymentResourceById {
  data: SalePaymentResource;
}

export interface CreateSalePaymentRequest {
  payment_date: string;
  amount_cash: number;
  amount_card: number;
  amount_yape: number;
  amount_plin: number;
  amount_deposit: number;
  amount_transfer: number;
  amount_other: number;
  observation: string;
}

export interface UpdateSalePaymentRequest {
  payment_date?: string;
  amount_cash?: number;
  amount_card?: number;
  amount_yape?: number;
  amount_plin?: number;
  amount_deposit?: number;
  amount_transfer?: number;
  amount_other?: number;
  observation?: string;
}

// ===== CONSTANTS =====

export const SALE_ENDPOINT = "/sale";
export const SALE_INSTALLMENT_ENDPOINT = "/installments";
export const SALE_PAYMENT_ENDPOINT = "/installment";

export const SALE_QUERY_KEY = "sales";
export const SALE_DETAIL_QUERY_KEY = "sale-details";
export const SALE_INSTALLMENT_QUERY_KEY = "sale-installments";
export const SALE_PAYMENT_QUERY_KEY = "sale-payments";

// ===== ROUTES =====

export const SaleRoute = "/ventas";
export const SaleAddRoute = "/ventas/agregar";
export const SaleEditRoute = "/ventas/actualizar/:id";

// ===== STATUS & TYPE OPTIONS =====

export const DOCUMENT_TYPES = [
  { value: "FACTURA", label: "Factura" },
  { value: "BOLETA", label: "Boleta" },
  // { value: "GUIA", label: "Guía de Remisión" },
] as const;

export const PAYMENT_TYPES = [
  { value: "CONTADO", label: "Contado" },
  { value: "CREDITO", label: "Crédito" },
] as const;

export const CURRENCIES = [
  { value: "PEN", label: "S/. Soles" },
  { value: "USD", label: "$ Dólares" },
  { value: "EUR", label: "€ Euros" },
] as const;

export const SALE_STATUSES = [
  { value: "REGISTRADO", label: "Registrado" },
  { value: "PAGADA", label: "Pagada" },
  { value: "CANCELADO", label: "Cancelado" },
] as const;

export const INSTALLMENT_STATUSES = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PAGADO", label: "Pagado" },
  { value: "VENCIDO", label: "Vencido" },
] as const;

// ===== MODEL COMPLETE =====

import type { ModelComplete } from "@/lib/core.interface";
import type { SaleSchema } from "./sale.schema";
import { ShoppingBag, PackageOpen, CreditCard, Wallet } from "lucide-react";
import type { Links, Meta } from "@/lib/pagination.interface";

const NAME = "Venta";
const NAME_DETAIL = "Detalle de Venta";
const NAME_INSTALLMENT = "Cuota de Venta";
const NAME_PAYMENT = "Pago de Venta";

export const SALE: ModelComplete<SaleSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de ventas del sistema.",
    plural: "Ventas",
    gender: false,
  },
  ICON: "ShoppingBag",
  ICON_REACT: ShoppingBag,
  ENDPOINT: SALE_ENDPOINT,
  QUERY_KEY: SALE_QUERY_KEY,
  ROUTE: SaleRoute,
  ROUTE_ADD: SaleAddRoute,
  ROUTE_UPDATE: SaleEditRoute,
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

export const SALE_DETAIL: ModelComplete<any> = {
  MODEL: {
    name: NAME_DETAIL,
    description: "Gestión de detalles de venta.",
    plural: "Detalles de Venta",
    gender: false,
  },
  ICON: "PackageOpen",
  ICON_REACT: PackageOpen,
  ENDPOINT: SALE_ENDPOINT,
  QUERY_KEY: SALE_DETAIL_QUERY_KEY,
  ROUTE: SaleRoute,
  ROUTE_ADD: SaleRoute,
  ROUTE_UPDATE: SaleRoute,
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

export const SALE_INSTALLMENT: ModelComplete<any> = {
  MODEL: {
    name: NAME_INSTALLMENT,
    description: "Gestión de cuotas de venta.",
    plural: "Cuotas de Venta",
    gender: false,
  },
  ICON: "CreditCard",
  ICON_REACT: CreditCard,
  ENDPOINT: SALE_INSTALLMENT_ENDPOINT,
  QUERY_KEY: SALE_INSTALLMENT_QUERY_KEY,
  ROUTE: SaleRoute,
  ROUTE_ADD: SaleRoute,
  ROUTE_UPDATE: SaleRoute,
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

export const SALE_PAYMENT: ModelComplete<any> = {
  MODEL: {
    name: NAME_PAYMENT,
    description: "Gestión de pagos de venta.",
    plural: "Pagos de Venta",
    gender: false,
  },
  ICON: "Wallet",
  ICON_REACT: Wallet,
  ENDPOINT: SALE_PAYMENT_ENDPOINT,
  QUERY_KEY: SALE_PAYMENT_QUERY_KEY,
  ROUTE: SaleRoute,
  ROUTE_ADD: SaleRoute,
  ROUTE_UPDATE: SaleRoute,
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
