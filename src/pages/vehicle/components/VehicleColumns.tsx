import type { ColumnDef } from "@tanstack/react-table";
import type { VehicleResource } from "../lib/vehicle.interface";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VehicleColumnsProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const VehicleColumns = ({ onEdit, onDelete }: VehicleColumnsProps): ColumnDef<VehicleResource>[] => [
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
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const vehicle = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(vehicle.id)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(vehicle.id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
