import type { ColumnDef } from "@tanstack/react-table";
import type {
  ShippingGuideCarrierResource,
  ShippingGuideCarrierStatus,
} from "../lib/shipping-guide-carrier.interface";
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
import { ColumnActions } from "@/components/SelectActions";
import { ButtonAction } from "@/components/ButtonAction";
import { Eye, Pencil, RefreshCcw, FileCode2, FileArchive } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";
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

interface ShippingGuideCarrierColumnsProps {
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onChangeStatus: (id: number, status: ShippingGuideCarrierStatus) => void;
}

export const ShippingGuideCarrierColumns = ({
  onEdit,
  onView,
  onChangeStatus,
}: ShippingGuideCarrierColumnsProps): ColumnDef<ShippingGuideCarrierResource>[] => [
  {
    accessorKey: "full_guide_number",
    header: "N° Documento",
    cell: ({ getValue }) => (
      <Badge variant={"outline"} className="font-mono text-xs font-semibold">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "issue_date",
    header: "F. Emisión",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "transfer_start_date",
    header: "F. Inicio Traslado",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "carrier",
    header: "Transportista",
    cell: ({ row }) => {
      const carrier = row.original.carrier;
      return (
        <span className="text-sm text-wrap">
          {carrier?.business_name ||
            (carrier?.names ?? "") +
              " " +
              (carrier?.father_surname ?? "") +
              " " +
              (carrier?.mother_surname ?? "") ||
            "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "remittent",
    header: "Remitente",
    cell: ({ row }) => {
      const remittent = row.original.remittent;
      return (
        <span className="text-sm text-wrap">
          {remittent?.business_name ||
            (remittent?.names ?? "") +
              " " +
              (remittent?.father_surname ?? "") +
              " " +
              (remittent?.mother_surname ?? "") ||
            "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "recipient",
    header: "Destinatario",
    cell: ({ row }) => {
      const recipient = row.original.recipient;
      return (
        <span className="text-sm text-wrap">
          {recipient?.business_name ||
            (recipient?.names ?? "") +
              " " +
              (recipient?.father_surname ?? "") +
              " " +
              (recipient?.mother_surname ?? "") ||
            "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "driver",
    header: "Conductor",
    cell: ({ row }) => {
      const driver = row.original.driver;
      return (
        <span className="text-sm text-wrap">{driver?.full_name || "-"}</span>
      );
    },
  },
  {
    accessorKey: "vehicle",
    header: "Vehículo",
    cell: ({ row }) => {
      const vehicle = row.original.vehicle;
      return <span className="text-sm font-mono">{vehicle?.plate || "-"}</span>;
    },
  },
  {
    accessorKey: "total_weight",
    header: "Peso Total",
    cell: ({ row }) => {
      const weight = row.original.total_weight;
      return <span className="text-sm font-mono">{weight} KG</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const statusVariant = {
        EMITIDA: "secondary",
        EN_TRANSITO: "default",
        ENTREGADA: "default",
        ANULADA: "destructive",
      }[status] as "secondary" | "default" | "destructive";

      return <Badge variant={statusVariant}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <ColumnActions>
          <ExportButtons
            pdfEndpoint={`/shipping-guide-carriers/${row.original.id}/pdf`}
            pdfFileName={`guia-transportista-${row.original.full_guide_number}.pdf`}
            variant="separate"
          />
          {["EN_TRANSITO", "ENTREGADA", "DECLARADA"].includes(
            row.original.status,
          ) && (
            <TooltipProvider>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <FileCode2 className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Descargar XML / CDR</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      downloadXml(
                        `/getArchivosDocument/${row.original.id}/guiatransportista`,
                        `xml-guia-transportista-${row.original.full_guide_number}.xml`,
                      )
                    }
                  >
                    <FileCode2 className="h-4 w-4 mr-2 text-blue-500" />
                    XML Guía Transportista
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      downloadXml(
                        `/getArchivosDocumentCDR/${row.original.id}/guiatransportista`,
                        `cdr-guia-transportista-${row.original.full_guide_number}.zip`,
                      )
                    }
                  >
                    <FileArchive className="h-4 w-4 mr-2 text-orange-500" />
                    CDR Guía Transportista
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          )}
          <ButtonAction
            icon={Eye}
            tooltip="Ver Detalle"
            onClick={() => onView(id)}
          />
          <ButtonAction
            icon={RefreshCcw}
            tooltip="Actualizar Estado"
            onClick={() => onChangeStatus(id, row.original.status)}
          />
          <ButtonAction
            icon={Pencil}
            tooltip="Editar"
            onClick={() => onEdit(id)}
          />
        </ColumnActions>
      );
    },
  },
];
