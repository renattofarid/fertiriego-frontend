import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import type { BoxMovementResource } from "../lib/box-movement.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

export const BoxMovementColumns = ({
  onDelete,
  onView,
}: {
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}): ColumnDef<BoxMovementResource>[] => [
  {
    accessorKey: "number_movement",
    header: "Número",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "movement_date",
    header: "Fecha",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.original.type;
      const isIncome = type === "INGRESO";
      return <Badge color={isIncome ? "green" : "red"}>{type}</Badge>;
    },
  },
  {
    accessorKey: "concept",
    header: "Concepto",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "total_amount",
    header: "Monto Total",
    cell: ({ row }) => {
      const amount = row.original.total_amount;
      const type = row.original.type;
      const isIncome = type === "INGRESO";
      return (
        <Badge
          variant="ghost"
          color={isIncome ? "green" : "red"}
          className={`font-semibold`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(amount)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "payment_methods",
    header: "Métodos de Pago",
    cell: ({ row }) => {
      const methods = row.original.payment_methods;
      const methodsArray = Object.entries(methods || {});

      if (methodsArray.length === 0) return "-";

      return (
        <div className="flex gap-1 flex-wrap">
          {methodsArray.map(([method, amount]) => (
            <Badge key={method} variant="outline" className="text-xs">
              {method}: {formatCurrency(parseFloat(amount))}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const movement = row.original;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onView(movement.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalle
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => onDelete(movement.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
