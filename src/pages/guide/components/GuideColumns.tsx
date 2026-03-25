import type { ColumnDef } from "@tanstack/react-table";
import type { GuideResource, GuideStatus } from "../lib/guide.interface";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ButtonAction } from "@/components/ButtonAction";
import {
  Copy,
  Eye,
  Pencil,
  RefreshCcw,
  BanknoteArrowUp,
  FileCode2,
  FileArchive,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { ColumnActions } from "@/components/SelectActions";
import ExportButtons from "@/components/ExportButtons";
import { api } from "@/lib/config";
import { toast } from "sonner";
import { parse } from "date-fns";

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

interface GuideColumnsProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  onChangeStatus: (id: number, status: GuideStatus) => void;
  onGenerateSale: (guide: GuideResource) => void;
  onDuplicate: (guide: GuideResource) => void;
}

export const GuideColumns = ({
  onEdit,
  onDelete,
  onView,
  onChangeStatus,
  onGenerateSale,
  onDuplicate,
}: GuideColumnsProps): ColumnDef<GuideResource>[] => [
  {
    accessorKey: "full_guide_number",
    header: "N° Documento",
    cell: ({ getValue }) => (
      <Badge
        variant={"outline"}
        className="font-mono text-xs font-semibold"
        size="sm"
      >
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "dates",
    header: "Fechas",
    cell: ({ row }) => {
      const issueDate = parse(
        row.original.issue_date,
        "yyyy-MM-dd",
        new Date(),
      );
      const transferDate = parse(
        row.original.transfer_date,
        "yyyy-MM-dd",
        new Date(),
      );
      return (
        <div className="flex flex-col text-xs">
          <span>
            <strong>F. Emisión:</strong>{" "}
            {issueDate.toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
          <span>
            <strong>F. Traslado:</strong>{" "}
            {transferDate.toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "recipient",
    header: "Destinatario",
    cell: ({ row }) => {
      const recipient = row.original.recipient;
      return (
        <span className="text-xs text-wrap">
          {recipient?.business_name ??
            `${recipient?.names} ${recipient?.father_surname ?? ""} ${recipient?.mother_surname ?? ""}`}
        </span>
      );
    },
  },
  {
    accessorKey: "transport_modality",
    header: "Modalidad",
    cell: ({ getValue }) => {
      const modality = getValue() as string;
      return (
        <Badge variant="outline" size="sm">
          {modality === "PUBLICO" ? "Transporte Público" : "Transporte Privado"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "carrier",
    header: "Transportista",
    cell: ({ row }) => {
      const modality = row.original.transport_modality;
      if (modality === "PUBLICO") {
        const carrier = row.original.carrier;
        return (
          <span className="text-xs text-wrap">
            {carrier?.business_name ?? carrier?.names}
          </span>
        );
      } else {
        const driver = row.original.driver;
        const fullName = [
          driver?.names,
          driver?.father_surname,
          driver?.mother_surname,
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-wrap">{fullName || "-"}</span>
            {driver?.number_document && (
              <span className="text-xs text-muted-foreground font-mono">
                {driver.number_document}
              </span>
            )}
          </div>
        );
      }
    },
  },
  {
    accessorKey: "orden_pedido",
    header: "Orden Pedido",
    cell: ({ getValue }) => {
      const value = getValue() as string | null | undefined;
      return value ? (
        <span className="text-xs font-mono">{value}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "total_weight",
    header: "Peso Total",
    cell: ({ row }) => {
      const weight = row.original.total_weight;
      return <span className="text-xs font-mono">{weight} KG</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const statusVariant = {
        REGISTRADA: "secondary",
        ENVIADA: "default",
        ACEPTADA: "default",
        RECHAZADA: "destructive",
        ANULADA: "destructive",
      }[status] as "secondary" | "default" | "destructive";

      return (
        <Badge size="sm" variant={statusVariant}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sunat_status",
    header: "Estado SUNAT",
    cell: ({ row }) => {
      const status = row.original.sunat_status;
      const variantMap: Record<
        string,
        "yellow" | "blue" | "green" | "gray" | "red"
      > = {
        PENDIENTE: "yellow",
        ENVIADO: "blue",
        ACEPTADO: "green",
        BAJA: "gray",
        RECHAZADO: "red",
      };
      const variant = variantMap[status] ?? "gray";
      return (
        <Badge size="sm" variant={variant}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "user.name",
    header: "Usuario",
    cell: ({ getValue }) => {
      const userName = getValue() as string | undefined;
      return userName ? (
        <span className="text-xs text-wrap">{userName}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const isAceptado = row.original.sunat_status === "ACEPTADO";
      return (
        <ColumnActions>
          <ExportButtons
            pdfEndpoint={`/shipping-guide-remit/${row.original.id}/pdf`}
            pdfFileName={`guia-${row.original.full_guide_number}.pdf`}
            variant="separate"
          />
          {["ENVIADA", "ACEPTADA", "DECLARADA"].includes(
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
                        `/getArchivosDocument/${row.original.id}/guia`,
                        `xml-guia-${row.original.full_guide_number}.xml`,
                      )
                    }
                  >
                    <FileCode2 className="h-4 w-4 mr-2 text-blue-500" />
                    XML Guía
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      downloadXml(
                        `/getArchivosDocumentCDR/${row.original.id}/guia`,
                        `cdr-guia-${row.original.full_guide_number}.zip`,
                      )
                    }
                  >
                    <FileArchive className="h-4 w-4 mr-2 text-orange-500" />
                    CDR Guía
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          )}
          <ButtonAction
            icon={Eye}
            tooltip="Ver Detalle"
            onClick={() => onView(row.original.id)}
          />
          <ButtonAction
            icon={BanknoteArrowUp}
            tooltip="Generar Venta"
            onClick={() => onGenerateSale(row.original)}
            color="primary"
          />
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Más opciones</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDuplicate(row.original)}>
                <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onChangeStatus(row.original.id, row.original.status)
                }
                disabled={isAceptado}
              >
                <RefreshCcw className="h-4 w-4 mr-2 text-muted-foreground" />
                Cambiar Estado
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(row.original.id)}
                disabled={isAceptado}
              >
                <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                {isAceptado ? "No se puede editar" : "Editar"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(row.original.id)}
                disabled={isAceptado}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isAceptado ? "No se puede eliminar" : "Eliminar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ColumnActions>
      );
    },
  },
];
