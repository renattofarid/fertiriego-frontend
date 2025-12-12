// ============================================
// ORDER - Interfaces, Types & Routes
// ============================================

// ===== API RESOURCES =====

export interface OrderDetailResource {
  id: number;
  order_id: number;
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
  subtotal: string;
  tax: string;
  total: string;
  created_at: string;
}

export interface OrderResource {
  id: number;
  order_number: string;
  order_date: string;
  order_expiry_date: string;
  order_delivery_date: string;
  currency: string;
  address: string;
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
  observations: string;
  status: string;
  quotation_id: number | null;
  quotation: {
    id: number;
    quotation_number: string;
  } | null;
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
  order_details: OrderDetailResource[];
  created_at: string;
}

export interface OrderResourceById {
  data: OrderResource;
}

// ===== API RESPONSES =====

export interface OrderResponse {
  data: OrderResource[];
  meta: Meta;
  links: Links;
}

// ===== CREATE/UPDATE REQUESTS =====

export interface CreateOrderDetailRequest {
  product_id: number;
  is_igv: boolean;
  quantity: number;
  unit_price: number;
  purchase_price: number;
}

export interface CreateOrderRequest {
  order_date: string;
  order_expiry_date: string;
  order_delivery_date: string;
  currency: string;
  address: string;
  warehouse_id: number;
  user_id: number;
  observations: string;
  quotation_id?: number;
  customer_id: number;
  order_details: CreateOrderDetailRequest[];
}

export interface UpdateOrderRequest {
  order_date?: string;
  order_expiry_date?: string;
  order_delivery_date?: string;
  currency?: string;
  address?: string;
  warehouse_id?: number;
  observations?: string;
  quotation_id?: number;
  customer_id?: number;
  order_details?: CreateOrderDetailRequest[];
}

// ===== CONSTANTS =====

export const ORDER_ENDPOINT = "/order";
export const ORDER_QUERY_KEY = "orders";
export const ORDER_DETAIL_QUERY_KEY = "order-details";

// ===== ROUTES =====

export const OrderRoute = "/pedidos";
export const OrderAddRoute = "/pedidos/agregar";
export const OrderEditRoute = "/pedidos/actualizar/:id";
export const OrderDetailRoute = "/pedidos/:id";

// ===== STATUS & TYPE OPTIONS =====

export const CURRENCIES = [
  { value: "PEN", label: "S/. Soles" },
  { value: "USD", label: "$ Dólares" },
  { value: "EUR", label: "€ Euros" },
] as const;

export const ORDER_STATUSES = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "En Proceso", label: "En Proceso" },
  { value: "Completado", label: "Completado" },
  { value: "Cancelado", label: "Cancelado" },
  { value: "Entregado", label: "Entregado" },
] as const;

// ===== MODEL COMPLETE =====

import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { ShoppingCart } from "lucide-react";

const NAME = "Pedido";
const NAME_DETAIL = "Detalle de Pedido";

export const ORDER: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de pedidos del sistema.",
    plural: "Pedidos",
    gender: false,
  },
  ICON: "ShoppingCart",
  ICON_REACT: ShoppingCart,
  ENDPOINT: ORDER_ENDPOINT,
  QUERY_KEY: ORDER_QUERY_KEY,
  ROUTE: OrderRoute,
  ROUTE_ADD: OrderAddRoute,
  ROUTE_UPDATE: OrderEditRoute,
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

export const ORDER_DETAIL: ModelComplete<any> = {
  MODEL: {
    name: NAME_DETAIL,
    description: "Gestión de detalles de pedido.",
    plural: "Detalles de Pedido",
    gender: false,
  },
  ICON: "ShoppingCart",
  ICON_REACT: ShoppingCart,
  ENDPOINT: ORDER_ENDPOINT,
  QUERY_KEY: ORDER_DETAIL_QUERY_KEY,
  ROUTE: OrderRoute,
  ROUTE_ADD: OrderRoute,
  ROUTE_UPDATE: OrderRoute,
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
