import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { FileText } from "lucide-react";

const ROUTE = "/notas-credito";
const NAME = "Nota de Crédito";

export const CREDIT_NOTE: ModelComplete<CreditNoteResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de notas de crédito.",
    plural: "Notas de Crédito",
    gender: false,
  },
  ICON: "FileText",
  ICON_REACT: FileText,
  ENDPOINT: "/credit-notes",
  QUERY_KEY: "credit-notes",
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
    id: 0,
    currency: "",
    document_series: "",
    document_number: "",
    customer: {
      id: 0,
      full_name: "",
      business_name: "",
      document_number: null,
    },
    user: {
      id: 0,
      name: "",
      email: null,
    },
    warehouse: {
      id: 0,
      name: "",
      address: "",
    },
    subtotal: "",
    tax: "",
    full_document_number: "",
    updated_at: "",
    observations: "",
    issue_date: "",
    credit_note_motive_id: 0,
    credit_note_type: "",
    reason: "",
    affects_stock: false,
    total_amount: "",
    status: "",
    sale: {
      id: 0,
      serie: "",
      numero: "",
      document_type: "",
      customer: {
        id: 0,
        full_name: "",
        business_name: "",
        document_number: null,
      },
      issue_date: "",
      total_amount: "",
    },
    details: [],
    created_at: "",
  },
};

export interface CreditNoteResponse {
  data: CreditNoteResource[];
  links: Links;
  meta: Meta;
}

export interface CreditNoteDetailResource {
  id: number;
  credit_note_id: number;
  sale_detail_id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    code?: string;
  };
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
}

export interface CreditNoteResource {
  id: number;
  document_series: string;
  document_number: string;
  full_document_number: string;
  issue_date: string;
  credit_note_type?: string;
  reason: string;
  currency: string;
  subtotal: string;
  tax: string;
  total_amount: string;
  affects_stock: boolean;
  status: string;
  observations?: string;
  sale: Sale;
  warehouse: Warehouse;
  customer: Customer;
  user: User;
  credit_note_motive_id: number;
  details: Detail[];
  created_at: string;
  updated_at: string;
}

export interface CreditNoteResourceById {
  data: CreditNoteResource;
}

export interface getCreditNoteProps {
  params?: Record<string, any>;
}

export const CREDIT_NOTE_TYPES = [
  { value: "DEVOLUCION", label: "Devolución" },
  { value: "DESCUENTO", label: "Descuento" },
  { value: "ANULACION", label: "Anulación" },
  { value: "BONIFICACION", label: "Bonificación" },
] as const;

export interface CreditNoteReason {
  id: number;
  code: string;
  name: string;
  active: number;
}
interface Detail {
  id: number;
  sale_detail_id: number;
  product_id: number;
  product_name: string;
  product_code: null;
  quantity: string;
  unit_price: string;
  subtotal: string;
  tax: string;
  total: string;
}

interface User {
  id: number;
  name: string;
  email: null;
}

interface Warehouse {
  id: number;
  name: string;
  address: string;
}

interface Sale {
  id: number;
  serie: string;
  numero: string;
  document_type: string;
  total_amount: string;
  issue_date: string;
  customer: Customer;
}

interface Customer {
  id: number;
  full_name: string;
  business_name: string;
  document_number: null;
}
