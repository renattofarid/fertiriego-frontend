import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { ShoppingCart } from "lucide-react";
import type { PurchaseOrderSchema } from "./purchase-order.schema";

const ROUTE = "/ordenes-compra";
const NAME = "Orden de Compra";

export const PURCHASE_ORDER: ModelComplete<PurchaseOrderSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de órdenes de compra del sistema.",
    plural: "Órdenes de Compra",
    gender: false,
  },
  ICON: "ShoppingCart",
  ICON_REACT: ShoppingCart,
  ENDPOINT: "/purchaseorder",
  QUERY_KEY: "purchase-orders",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
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
    supplier_id: "",
    warehouse_id: "",
    apply_igv: false,
    issue_date: "",
    expected_date: "",
    observations: "",
    details: [],
  },
};

export interface PurchaseOrderResponse {
  data: PurchaseOrderResource[];
  links: Links;
  meta: Meta;
}

export interface PurchaseOrderResource {
  id: number;
  correlativo: string;
  supplier_id: number;
  supplier_fullname: string;
  warehouse_id: number;
  warehouse_name: string | null;
  user_id: number;
  user_name: string;
  order_number: string;
  issue_date: string;
  expected_date: string;
  status: string;
  observations: string;
  total_estimated: string;
  purchase_id: number | null;
  purchase_correlativo: string | null;
  details: PurchaseOrderDetailResource[];
  created_at: string;
}

export interface PurchaseOrderResourceById {
  data: PurchaseOrderResource;
}

export interface CreatePurchaseOrderRequest {
  supplier_id: number;
  warehouse_id: number;
  issue_date: string;
  expected_date: string;
  observations: string | null;
  apply_igv?: boolean;
  total_estimated?: number;
  details: CreatePurchaseOrderDetailRequest[];
}

export interface UpdatePurchaseOrderRequest {
  supplier_id?: number;
  warehouse_id?: number;
  order_number?: string;
  issue_date?: string;
  expected_date?: string;
  observations?: string | null;
}

export interface GetPurchaseOrdersProps {
  params?: Record<string, unknown>;
}

// Purchase Order Detail Interfaces
export interface PurchaseOrderDetailResource {
  id: number;
  correlativo: string;
  purchase_order_id: number;
  purchase_order_correlative: string;
  product_id: number;
  product_name: string;
  quantity_requested: number;
  unit_price_estimated: string;
  subtotal_estimated: string;
  created_at: string;
}

export interface PurchaseOrderDetailResponse {
  data: PurchaseOrderDetailResource[];
  links: Links;
  meta: Meta;
}

export interface PurchaseOrderDetailResourceById {
  data: PurchaseOrderDetailResource;
}

export interface CreatePurchaseOrderDetailRequest {
  product_id: number;
  quantity_requested: number;
  unit_price_estimated: number;
  subtotal_estimated?: number;
}

export interface CreatePurchaseOrderDetailRequestFull {
  purchase_order_id: number;
  product_id: number;
  quantity_requested: number;
  unit_price_estimated: number;
  subtotal_estimated: number;
}

export interface UpdatePurchaseOrderDetailRequest {
  product_id?: number;
  quantity_requested?: number;
  unit_price_estimated?: number;
  subtotal_estimated?: number;
}

export interface GetPurchaseOrderDetailsProps {
  purchaseOrderId: number;
  params?: Record<string, unknown>;
}
