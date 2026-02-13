import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { ArrowLeftRight } from "lucide-react";

const ROUTE = "/movimientos-caja";
const NAME = "Movimiento de Caja";

export const BOX_MOVEMENT: ModelComplete<BoxMovementResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de movimientos de caja chica",
    plural: "Movimientos de Caja",
    gender: false,
  },
  ICON: "ArrowLeftRight",
  ICON_REACT: ArrowLeftRight,
  ENDPOINT: "/box-movements",
  QUERY_KEY: "box-movements",
  ROUTE: ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Registrar ${NAME}`,
      subtitle: "Complete los campos para registrar un nuevo movimiento",
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: "Actualice la información del movimiento",
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: "¿Está seguro de eliminar este movimiento?",
    },
  },
  EMPTY: {
    id: 0,
    number_movement: "",
    box_id: 0,
    box_shift_id: 0,
    user_id: 0,
    customer_id: 0,
    movement_date: "",
    type: "INGRESO",
    concept: "",
    amount_cash: 0,
    amount_deposit: 0,
    amount_yape: 0,
    amount_plin: 0,
    amount_tarjeta: 0,
    amount_other: 0,
    total_amount: 0,
    comment: "",
    payment_methods: {},
    created_at: "",
    updated_at: "",
  },
};

export interface PaymentMethods {
  EFECTIVO?: string;
  DEPOSITO?: string;
  YAPE?: string;
  PLIN?: string;
  TARJETA?: string;
  OTRO?: string;
}

export interface BoxMovementResource {
  id: number;
  number_movement: string;
  box_id: number;
  box_shift_id: number;
  user_id: number;
  customer_id: number;
  movement_date: string;
  type: string;
  concept: string;
  amount_cash: number;
  amount_deposit: number;
  amount_yape: number;
  amount_plin: number;
  amount_tarjeta: number;
  amount_other: number;
  total_amount: number;
  comment: string;
  payment_methods: PaymentMethods;
  created_at: string;
  updated_at: string;
}

export interface BoxMovementResponse {
  data: BoxMovementResource[];
  links: Links;
  meta: Meta;
}

export interface BoxMovementResourceById {
  data: BoxMovementResource;
}

export interface GetBoxMovementProps {
  params?: {
    box_shift_id?: number;
    box_id?: number;
    user_id?: number;
    customer_id?: number;
    type?: string;
    from?: string;
    to?: string;
    page?: number;
    per_page?: number;
    search?: string;
  };
}

export interface CreateBoxMovementProps {
  box_id: number;
  customer_id: string;
  type: string;
  concept: string;
  amount_cash?: number;
  amount_deposit?: number;
  amount_yape?: number;
  amount_plin?: number;
  amount_tarjeta?: number;
  amount_other?: number;
  comment?: string;
}
