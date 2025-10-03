import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import type { ProductResource } from "../lib/product.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { FileText, Image } from "lucide-react";

export const ProductColumns = ({
  onEdit,
  onDelete,
  onView,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}): ColumnDef<ProductResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "category_name",
    header: "Categoría",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-medium">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "brand_name",
    header: "Marca",
    cell: ({ getValue }) => (
      <Badge variant="secondary" className="font-medium">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "unit_name",
    header: "Unidad",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "product_type_name",
    header: "Tipo",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      const getVariant = (
        type: string
      ): "default" | "destructive" | "secondary" | "outline" => {
        switch (type) {
          case "Normal":
            return "default";
          case "Kit":
            return "destructive";
          case "Servicio":
            return "secondary";
          default:
            return "outline";
        }
      };
      return (
        <Badge variant={getVariant(type)} className="font-semibold">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "technical_sheet",
    header: "Fichas Técnicas",
    cell: ({ getValue }) => {
      const sheets = getValue() as string[];
      return (
        <div className="flex items-center space-x-1">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{sheets.length}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "product_images",
    header: "Imágenes",
    cell: ({ getValue }) => {
      const images = getValue() as string[];
      return (
        <div className="flex items-center space-x-1">
          <Image className="h-4 w-4 text-green-500" />
          <span className="text-sm">{images.length}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Creación",
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
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onView(id)}>
              Ver Detalles
            </DropdownMenuItem>
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
