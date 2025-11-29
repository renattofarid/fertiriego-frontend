import type { Links, Meta } from "@/lib/pagination.interface";
import type { DocumentType } from "./warehouse-document.interface";

// Kardex Movement Type
export type MovementType = "ENTRADA" | "SALIDA";

// Kardex Resource
export interface WarehouseKardexResource {
  id: number;
  warehouse_id: number;
  warehouse_name: string;
  product_id: number;
  product_name: string;
  movement_date: string;
  movement_type: MovementType;
  document_type: DocumentType;
  document_number: string;
  quantity_in: number;
  quantity_out: number;
  quantity_balance: number;
  unit_cost: number;
  total_cost_in: number;
  total_cost_out: number;
  total_cost_balance: number;
  average_cost: number;
  user_id: number;
  user_name: string;
  created_at: string;
}

// Kardex Response
export interface WarehouseKardexResponse {
  data: WarehouseKardexResource[];
  links: Links;
  meta: Meta;
}

// Kardex by Product
export interface KardexByProductMovement {
  id: number;
  document_type: DocumentType;
  document_number: string;
  movement_type: MovementType;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  previous_balance: number;
  new_balance: number;
  document_date: string;
  warehouse_name: string;
  created_at: string;
}

export interface KardexByProductResource {
  product_id: number;
  product_name: string;
  movements: KardexByProductMovement[];
}

export interface KardexByProductResponse {
  data: KardexByProductResource;
}

// Valuated Inventory - Uses the same structure as Kardex
export interface ValuatedInventoryItem {
  id: number;
  warehouse_id: number;
  warehouse_name: string;
  product_id: number;
  product_name: string;
  movement_date: string;
  movement_type: MovementType;
  document_type: DocumentType;
  document_number: string;
  quantity_in: number;
  quantity_out: number;
  quantity_balance: number;
  unit_cost: number;
  total_cost_in: number;
  total_cost_out: number;
  total_cost_balance: number;
  average_cost: number;
  user_id: number;
  user_name: string;
  created_at: string;
}

export interface ValuatedInventoryResponse {
  data: ValuatedInventoryItem[];
  links: Links;
  meta: Meta;
}

// Query Props
export interface GetWarehouseKardexProps {
  params?: {
    page?: number;
    per_page?: number;
    warehouse_id?: number;
    product_id?: number;
    document_type?: DocumentType;
    from?: string;
    to?: string;
    movement_type?: MovementType;
  };
}
