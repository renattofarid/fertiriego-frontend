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
    sale_id: 0,
    issue_date: "",
    credit_note_type: "",
    reason: "",
    affects_stock: false,
    total_amount: 0,
    status: "",
    sale: {
      id: 0,
      full_document_number: "",
      customer_fullname: "",
      total_amount: 0,
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
  sale_id: number;
  issue_date: string;
  credit_note_type: string;
  reason: string;
  affects_stock: boolean;
  total_amount: number;
  status: string;
  sale: {
    id: number;
    full_document_number: string;
    customer_fullname: string;
    total_amount: number;
  };
  details: CreditNoteDetailResource[];
  created_at: string;
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
  name: string;
}
