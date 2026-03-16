import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { FileMinus } from "lucide-react";

const ROUTE = "/notas-credito";
const NAME = "Nota de Crédito";

export const CREDIT_NOTE: ModelComplete<CreditNoteResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de notas de crédito.",
    plural: "Notas de Crédito",
    gender: false,
  },
  ICON: "FileMinus",
  ICON_REACT: FileMinus,
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
    sunat_status: "",
    customer: {
      id: 0,
      full_name: "",
      business_name: "",
      document_number: "",
    },
    user: {
      id: 0,
      name: "",
      email: "",
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
      sequential_number: "",
      customer: {
        id: 0,
        type_document: "",
        type_person: "",
        number_document: "",
        names: "",
        father_surname: "",
        mother_surname: "",
        address: "",
        business_name: "",
        commercial_name: "",
        created_at: "",
        roles: [],
        birth_date: "",
        driver_license: "",
        email: "",
        gender: "",
        phone: "",
        user_id: "",
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

interface Detail {
  id: number;
  sale_detail_id: number;
  product_id: number;
  product_name: string;
  product_code?: string;
  quantity: string;
  unit_price: string;
  subtotal: string;
  tax: string;
  total: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
}

interface Customer2 {
  id: number;
  full_name: string;
  business_name: string;
  document_number?: string;
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
  sequential_number: string;
  document_type: string;
  total_amount: string;
  issue_date: string;
  customer: Customer;
}

interface Customer {
  id: number;
  type_document: string;
  type_person: string;
  number_document: string;
  names?: string;
  father_surname?: string;
  mother_surname?: string;
  gender?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  address: string;
  business_name: string;
  commercial_name: string;
  driver_license?: string;
  user_id?: string;
  created_at: string;
  roles: any[];
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
  sunat_status: string;
  sale: Sale;
  warehouse: Warehouse;
  customer: Customer2;
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

export interface CreditNoteReason {
  id: number;
  code: string;
  name: string;
  active: number;
}
