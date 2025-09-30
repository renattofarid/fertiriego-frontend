import type { ModelComplete } from "@/lib/core.interface";
import { HardHat } from "lucide-react";

const ROUTE = "/trabajadores";
const NAME = "Trabajador";

export const WORKER: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de trabajadores del sistema.",
    plural: "Trabajadores",
    gender: false,
  },
  ICON: "HardHat",
  ICON_REACT: HardHat,
  ENDPOINT: "/person",
  QUERY_KEY: "workers",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
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
  EMPTY: {},
};

export const WORKER_ROLE_CODE = "WORKER";
export const WORKER_ROLE_ID = 4;