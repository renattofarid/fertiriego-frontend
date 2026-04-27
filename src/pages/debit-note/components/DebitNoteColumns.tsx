import type { ColumnDef } from "@tanstack/react-table";
import type { DebitNoteResource } from "../lib/debit-note.interface";
import { Pencil, FileCode2, FileArchive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/components/SimpleDeleteDialog";
import { ButtonAction } from "@/components/ButtonAction";
import ExportButtons from "@/components/ExportButtons";
import { ColumnActions } from "@/components/SelectActions";
import { api } from "@/lib/config";
import { toast } from "sonner";

const downloadXml = async (endpoint: string, fileName: string) => {
  try {
    const response = await api.get(endpoint, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success("XML descargado exitosamente");
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Error al descargar el XML");
  }
};

interface DebitNoteColumnsProps {
  onDelete: (id: number) => void;
}

export const DebitNoteColumns = ({
  onDelete,
}: DebitNoteColumnsProps): ColumnDef<DebitNoteResource>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "sale",
      header: "Venta",
      cell: ({ getValue }) => {
        const sale = getValue() as DebitNoteResource["sale"];
        return sale.full_document_number;
      },
    },
    {
      accessorKey: "customer.names",
      header: "Cliente",
      cell: ({ row }) => {
        return row.original.customer.names;
      },
    },
    {
      accessorKey: "issue_date",
      header: "Fecha de Emisión",
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return date.toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      accessorKey: "motive.name",
      header: "Motivo",
      cell: ({ getValue }) => {
        const type = getValue() as string;
        const typeLabels: Record<string, string> = {
          DEVOLUCION: "Devolución",
          DESCUENTO: "Descuento",
          ANULACION: "Anulación",
          BONIFICACION: "Bonificación",
        };
        return typeLabels[type] || type;
      },
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ getValue }) => {
        const amount = Number(getValue());
        return `S/ ${amount.toFixed(2)}`;
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <Badge
            variant={
              status === "PROCESADO"
                ? "default"
                : status === "PENDIENTE"
                  ? "secondary"
                  : "destructive"
            }
          >
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
        const debitNote = row.original;

        return (
          <ColumnActions>
            <ExportButtons
              pdfEndpoint={`/debit-notes/${row.original.id}/pdf`}
              pdfFileName={`nota-debito-${row.original.document_number}.pdf`}
              variant="separate"
              openDirect
            />
            {["ENVIADO", "ACEPTADO"].includes(row.original.sunat_status?.toUpperCase()) && (
              <TooltipProvider>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600">
                          <FileCode2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Descargar XML / CDR</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => downloadXml(`/getArchivosDocument/${row.original.id}/nota`, `xml-nota-debito-${row.original.full_document_number}.xml`)}>
                      <FileCode2 className="h-4 w-4 mr-2 text-blue-500" />
                      XML Nota Débito
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadXml(`/getArchivosDocumentCDR/${row.original.id}/nota`, `cdr-nota-debito-${row.original.full_document_number}.zip`)}>
                      <FileArchive className="h-4 w-4 mr-2 text-orange-500" />
                      CDR Nota Débito
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipProvider>
            )}
            <ButtonAction
              icon={Pencil}
              tooltip="Editar"
              onClick={() =>
                navigate(`/notas-debito/actualizar/${debitNote.id}`)
              }
            />
            <DeleteButton onClick={() => onDelete(row.original.id)} />
          </ColumnActions>
        );
      },
    },
  ];
};
