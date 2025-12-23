import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { FilePlus } from "lucide-react";

const ROUTE = "/notas-debito";
const NAME = "Nota de Débito";

export const DEBIT_NOTE: ModelComplete<DebitNoteResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de notas de débito.",
    plural: "Notas de Débito",
    gender: false,
  },
  ICON: "FilePlus",
  ICON_REACT: FilePlus,
  ENDPOINT: "/debit-notes",
  QUERY_KEY: "debit-notes",
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
    debit_note_motive_id: 0,
    observations: "",
    warehouse_id: 0,
    total_amount: "",
    status: "",
    sale: {
      id: 0,
      full_document_number: "",
      total_amount: "",
      current_amount: "",
      customer: {
        id: 0,
        name: "",
        document_number: "",
      },
    },
    currency: "",
    customer_id: 0,
    user_id: 0,
    document_series: "",
    document_number: "",
    full_document_number: "",
    reason: "",
    motive: {
      id: 0,
      code: "",
      name: "",
    },
    subtotal: "",
    tax: "",
    xml_url: "",
    pdf_url: "",
    cdr_url: "",
    hash_cpe: "",
    sunat_status: "",
    sunat_error_code: "",
    sunat_error_message: "",
    created_at: "",
    details: [],
    updated_at: "",
    warehouse: {
      id: 0,
      name: "",
    },
    customer: {
      id: 0,
      type_document: "",
      type_person: "",
      number_document: "",
      names: "",
      father_surname: "",
      mother_surname: "",
      address: "",
      phone: "",
      email: "",
      business_name: "",
      commercial_name: "",
      created_at: "",
      roles: [],
      birth_date: "",
      gender: "",
      user_id: "",
    },
    user: {
      id: 0,
      name: "",
    },
  },
};

export interface DebitNoteResponse {
  data: DebitNoteResource[];
  links: Links;
  meta: Meta;
}

export interface DebitNoteDetailResource {
  id: number;
  debit_note_id: number;
  sale_detail_id: number;
  product_id: number;
  concept: string;
  quantity: string;
  unit_price: string;
  subtotal: string;
  tax: string;
  total: string;
  product: Product;
  sale_detail: Saledetail;
  created_at: string;
  updated_at: string;
}

export interface DebitNoteResource {
  id: number;
  sale_id: number;
  warehouse_id: number;
  user_id: number;
  customer_id: number;
  document_series: string;
  document_number: string;
  full_document_number: string;
  issue_date: string;
  debit_note_motive_id: number;
  reason: string;
  motive: Motive;
  currency: string;
  subtotal: string;
  tax: string;
  total_amount: string;
  status: string;
  observations?: string;
  xml_url?: string;
  pdf_url?: string;
  cdr_url?: string;
  hash_cpe?: string;
  sunat_status: string;
  sunat_error_code?: string;
  sunat_error_message?: string;
  sale: Sale;
  warehouse: Warehouse;
  customer: Customer2;
  user: Warehouse;
  details: DebitNoteDetailResource[];
  created_at: string;
  updated_at: string;
}

export interface DebitNoteResourceById {
  data: DebitNoteResource;
}

export interface getDebitNoteProps {
  params?: Record<string, any>;
}

export interface DebitNoteReason {
  id: number;
  code: string;
  name: string;
  active: number;
}

interface Saledetail {
  id: number;
  quantity: string;
  unit_price: string;
  total: string;
}

interface Product {
  id: number;
  name: string;
  code?: string;
  unit: Unit;
}

interface Unit {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

interface Customer2 {
  id: number;
  type_document: string;
  type_person: string;
  number_document: string;
  names: string;
  father_surname?: string;
  mother_surname?: string;
  gender?: string;
  birth_date?: string;
  phone: string;
  email: string;
  address: string;
  business_name: string;
  commercial_name: string;
  user_id?: string;
  created_at: string;
  roles: Role[];
}

interface Role {
  id: number;
  name: string;
}

interface Warehouse {
  id: number;
  name: string;
}

interface Sale {
  id: number;
  full_document_number: string;
  total_amount: string;
  current_amount: string;
  customer: Customer;
}

interface Customer {
  id: number;
  name?: string;
  document_number?: string;
}

interface Motive {
  id: number;
  code: string;
  name: string;
}
