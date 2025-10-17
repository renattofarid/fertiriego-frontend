import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import type { PurchaseOrderResource } from "../lib/purchase-order.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const PurchaseOrderColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<PurchaseOrderResource>[] => [
    {
      accessorKey: "correlativo",
      header: "Correlativo",
      cell: ({ getValue }) => (
        <Badge variant="outline">
          {getValue() as string}
        </Badge>
      ),
    },
    {
      accessorKey: "order_number",
      header: "N° Orden",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "supplier_fullname",
      header: "Proveedor",
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "warehouse_name",
      header: "Almacén",
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return value ? (
          <span className="text-sm">{value}</span>
        ) : (
          <span className="text-sm text-gray-400">Sin almacén</span>
        );
      },
    },
    {
      accessorKey: "issue_date",
      header: "F. Emisión",
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      accessorKey: "expected_date",
      header: "F. Esperada",
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const getVariant = (
          status: string
        ): "default" | "destructive" | "secondary" | "outline" => {
          switch (status) {
            case "Pendiente":
              return "secondary";
            case "Completada":
              return "default";
            case "Cancelada":
              return "destructive";
            default:
              return "outline";
          }
        };
        return (
          <Badge variant={getVariant(status)} className="font-semibold">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "total_estimated",
      header: "Total Estimado",
      cell: ({ getValue }) => {
        const total = Number(getValue() as string);
        return (
          <span className="font-bold text-primary">
            S/. {total.toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: "details",
      header: "Detalles",
      cell: ({ getValue }) => {
        const details = getValue() as any[];
        return (
          <Badge variant="outline" className="font-medium">
            {details.length} items
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const id = row.original.id;

        return (
          <SelectActions>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onEdit(id)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(id)}>
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </SelectActions>
        );
      },
    },
  ];
