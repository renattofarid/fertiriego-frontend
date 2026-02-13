import type { ColumnDef } from "@tanstack/react-table";
import type { VehicleResource } from "../lib/vehicle.interface";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

interface VehicleColumnsProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const VehicleColumns = ({
  onEdit,
  onDelete,
}: VehicleColumnsProps): ColumnDef<VehicleResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "plate",
    header: "Placa",
  },
  {
    accessorKey: "brand",
    header: "Marca",
  },
  {
    accessorKey: "model",
    header: "Modelo",
  },
  {
    accessorKey: "year",
    header: "Año",
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "vehicle_type",
    header: "Tipo",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      const typeLabels: Record<string, string> = {
        carga: "Carga",
        pasajeros: "Pasajeros",
        mixto: "Mixto",
      };
      return typeLabels[type] || type;
    },
  },
  {
    accessorKey: "max_weight",
    header: "Peso Máx. (kg)",
  },
  {
    accessorKey: "owner",
    header: "Propietario",
    cell: ({ getValue }) => {
      const owner = getValue() as VehicleResource["owner"];
      return owner.full_name;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge variant={status === "Activo" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Creación",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <ColumnActions>
          <ButtonAction
            icon={Pencil}
            tooltip="Editar"
            onClick={() => onEdit(id)}
          />
          <DeleteButton onClick={() => onDelete(id)} />
        </ColumnActions>
      );
    },
  },
];
