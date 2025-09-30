import type { ModelComplete } from "@/lib/core.interface";
import { Truck } from "lucide-react";

const ROUTE = "/proveedores";
const NAME = "Proveedor";

export const SUPPLIER: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de proveedores del sistema.",
    plural: "Proveedores",
    gender: false,
  },
  ICON: "Truck",
  ICON_REACT: Truck,
  ENDPOINT: "/person",
  QUERY_KEY: "suppliers",
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

export const SUPPLIER_ROLE_CODE = "SUPPLIER";
export const SUPPLIER_ROLE_ID = 3;