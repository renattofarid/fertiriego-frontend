import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Wallet } from "lucide-react";

const ROUTE = "/turnos-caja";
const NAME = "Turno de Caja";

export const BOX_SHIFT: ModelComplete<BoxShiftResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de de caja chica",
    plural: "Caja Chica",
    gender: false,
  },
  ICON: "Wallet",
  ICON_REACT: Wallet,
  ENDPOINT: "/boxshift",
  QUERY_KEY: "box-shifts",
  ROUTE: ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Abrir ${NAME}`,
      subtitle: "Complete los campos para abrir un nuevo turno de caja",
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: "Actualice la información del turno de caja",
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: "¿Está seguro de eliminar este turno de caja?",
    },
  },
  EMPTY: {
    id: 0,
    box_id: 0,
    user_id: 0,
    open_date: "",
    close_date: null,
    started_amount: 0,
    closed_amount: 0,
    status: "ABIERTO",
    observation: "",
    total_income: 0,
    total_outcome: 0,
    expected_balance: 0,
    difference: 0,
    is_open: true,
    is_closed: false,
    created_at: "",
    updated_at: "",
  },
};

export interface BoxShiftResource {
  id: number;
  box_id: number;
  user_id: number;
  open_date: string;
  close_date: string | null;
  started_amount: number;
  closed_amount: number;
  status: string;
  observation: string;
  total_income: number;
  total_outcome: number;
  expected_balance: number;
  difference: number;
  is_open: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoxShiftResponse {
  data: BoxShiftResource[];
  links: Links;
  meta: Meta;
}

export interface BoxShiftResourceById {
  data: BoxShiftResource;
}

export interface GetBoxShiftProps {
  params?: {
    box_id?: number;
    user_id?: number;
    from?: string;
    to?: string;
    page?: number;
    per_page?: number;
    search?: string;
  };
}

export interface CreateBoxShiftProps {
  box_id: number;
  started_amount: number;
  observation?: string;
}

export interface CloseBoxShiftProps {
  box_id: number;
  closed_amount: number;
  observation?: string;
}
