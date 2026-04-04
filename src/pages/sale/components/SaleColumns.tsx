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
import {
  Trash2,
  Eye,
  Settings,
  Wallet,
  AlertTriangle,
  Pencil,
  Send,
  FileCode2,
  FileArchive,
  XCircle,
  MoreHorizontal,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SaleResource } from "../lib/sale.interface";
import { parse } from "date-fns";
import ExportButtons from "@/components/ExportButtons";
import { ButtonAction } from "@/components/ButtonAction";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
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

interface SaleColumnsProps {
  onEdit: (sale: SaleResource) => void;
  onDelete: (id: number) => void;
  onViewDetails: (sale: SaleResource) => void;
  onManage: (sale: SaleResource) => void;
  onQuickPay: (sale: SaleResource) => void;
  onDeclararSunat: (sale: SaleResource) => void;
  onAnular: (sale: SaleResource) => void;
}

export const getSaleColumns = ({
  onEdit,
  onDelete,
  onViewDetails,
  onManage,
  onQuickPay,
  onDeclararSunat,
  onAnular,
}: SaleColumnsProps): ColumnDef<SaleResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        #{row.original.id}
      </Badge>
    ),
  },
  {
    accessorKey: "sequential_number",
    header: "Documento",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-xs text-muted-foreground">
          {row.original.document_type}
        </span>
        <span className="font-mono font-semibold">
          {row.original.sequential_number}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "issue_date",
    header: "Emisión",
    cell: ({ row }) => {
      const date = parse(row.original.issue_date, "yyyy-MM-dd", new Date());
      return (
        <span className="text-sm">
          {date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "due_date",
    header: "Vencimiento",
    cell: ({ row }) => {
      const issueDate = parse(row.original.issue_date, "yyyy-MM-dd", new Date());
      const lastInstallmentDate = row.original.installments.reduce(
        (latest, inst) => {
          const instDate = parse(inst.due_date, "yyyy-MM-dd", new Date());
          return instDate > latest ? instDate : latest;
        },
        issueDate,
      );
      const dueDate =
        lastInstallmentDate > issueDate ? lastInstallmentDate : issueDate;
      return (
        <span className="text-sm">
          {dueDate.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "customer_fullname",
    header: "Cliente",
    cell: ({ row }) => (
      <div className="flex flex-col text-sm">
        <span>{row.original.customer_fullname}</span>
        <span>{row.original.customer_document}</span>
      </div>
    ),
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ row }) => <span>{row.original.warehouse_name || "N/A"}</span>,
  },
  {
    accessorKey: "payment_type",
    header: "Tipo Pago",
    cell: ({ row }) => (
      <Badge
        variant={row.original.payment_type === "CONTADO" ? "blue" : "purple"}
      >
        {row.original.payment_type}
      </Badge>
    ),
  },
  {
    accessorKey: "guides",
    header: "Guía",
    cell: ({ row }) => {
      const guides = row.original.guides;
      if (guides && guides.length > 0) {
        return (
          <Badge variant="outline" className="cursor-not-allowed" size="sm">
            {row.original.guides?.map((guide) => guide.correlative).join(", ")}
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: "order_purchase",
    header: "Orden Compra",
    cell: ({ row }) => {
      const orderPurchase = row.original.order_purchase;
      if (orderPurchase) {
        return (
          <Badge variant="outline" className="cursor-not-allowed" size="sm">
            {orderPurchase}
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => {
      const currency =
        row.original.currency === "PEN"
          ? "S/."
          : row.original.currency === "USD"
            ? "$"
            : row.original.currency === "EUR"
              ? "€"
              : row.original.currency;
      return (
        <span className="font-semibold">
          {currency} {Number(row.original.total_amount).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "current_amount",
    header: "Saldo",
    cell: ({ row }) => {
      const currency =
        row.original.currency === "PEN"
          ? "S/."
          : row.original.currency === "USD"
            ? "$"
            : "€";
      const currentAmount = row.original.current_amount;
      const isPaid = currentAmount === 0;

      return (
        <span
          className={`font-semibold ${
            isPaid ? "text-primary" : "text-orange-600"
          }`}
        >
          {currency} {Number(currentAmount).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: "green" | "red" | "gray" = "gray";

      if (status === "REGISTRADO") variant = "gray";
      if (status === "PAGADA") variant = "green";
      if (status === "CANCELADO") variant = "red";

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "status_facturado",
    header: "Estado SUNAT",
    cell: ({ row }) => {
      const status = row.original.status_facturado;
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
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "details",
    header: "Detalles",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        onClick={() => onManage(row.original)}
        className="h-auto p-1"
      >
        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
          {row.original.details?.length || 0} item(s)
        </Badge>
      </Button>
    ),
  },
  {
    accessorKey: "installments",
    header: "Cuotas",
    cell: ({ row }) => {
      // Si es al contado, ya está pagado y no hay cuotas
      const isContado = row.original.payment_type === "CONTADO";

      if (isContado) {
        return (
          <Badge variant="outline" className="text-primary">
            Pagado
          </Badge>
        );
      }

      const hasPendingPayments = row.original.installments?.some(
        (inst) => inst.pending_amount > 0,
      );

      // Validar que la suma de cuotas sea igual al total de la venta
      // total_amount ya viene del back con retención aplicada
      const totalAmount = row.original.total_amount;
      const expectedTotal = totalAmount;
      const sumOfInstallments =
        row.original.installments?.reduce(
          (sum, inst) => sum + Number(inst.amount),
          0,
        ) || 0;
      const isValid =
        Math.abs(Number(expectedTotal) - sumOfInstallments) < 0.01;

      return (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onManage(row.original)}
              className="h-auto p-1"
            >
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
              >
                {row.original.installments?.length || 0} cuota(s)
              </Badge>
            </Button>

            {!isValid && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    La suma de cuotas ({Number(sumOfInstallments).toFixed(2)})
                    no coincide con el total ({Number(expectedTotal).toFixed(2)}
                    ).
                    <br />
                    Por favor, sincronice las cuotas.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            {hasPendingPayments && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => onQuickPay(row.original)}
                    className="h-8 w-8 p-0"
                    disabled={
                      !isValid || row.original.status_facturado === "PENDIENTE"
                    }
                  >
                    <Wallet
                      className={`h-4 w-4 ${
                        isValid && row.original.status_facturado !== "PENDIENTE"
                          ? "text-primary"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {row.original.status_facturado === "PENDIENTE"
                      ? "No se puede realizar pago rápido. El documento aún no ha sido enviado a SUNAT."
                      : isValid
                        ? "Pago rápido"
                        : "No se puede realizar pago rápido. Debe sincronizar las cuotas primero."}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const isPaid = row.original.status === "PAGADA";

      // Verificar si alguna cuota tiene pagos registrados
      // (si pending_amount es menor que amount, significa que tiene pagos)
      const hasPayments =
        row.original.installments?.some(
          (inst) => inst.pending_amount < inst.amount,
        ) ?? false;
      const isEnviado = row.original.status_facturado === "ACEPTADO";
      const isRechazado = row.original.status_facturado === "RECHAZADO";

      // Anular solo permitido dentro de los 3 días posteriores a la emisión
      const issueDate = parse(
        row.original.issue_date,
        "yyyy-MM-dd",
        new Date(),
      );
      const daysSinceIssue = Math.floor(
        (new Date().setHours(0, 0, 0, 0) - issueDate.setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24),
      );
      const canAnular = daysSinceIssue <= 3;

      return (
        <div className="flex items-center gap-1">
          {/* PDF */}
          <ExportButtons
            pdfEndpoint={`/sale/${row.original.id}/pdf`}
            pdfFileName={`venta-${row.original.sequential_number}.pdf`}
            ticketEndpoint={`/sale/${row.original.id}/ticket`}
            ticketFileName={`ticket-venta-${row.original.sequential_number}.pdf`}
            variant="separate"
          />

          {/* XML / CDR — al lado del PDF, solo si está enviado */}
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
                  disabled={
                    !["ENVIADO", "ACEPTADO"].includes(
                      row.original.status_facturado,
                    )
                  }
                  onClick={() =>
                    downloadXml(
                      `/getArchivosDocument/${row.original.id}/venta`,
                      `xml-venta-${row.original.sequential_number}.xml`,
                    )
                  }
                >
                  <FileCode2 className="h-4 w-4 mr-2 text-blue-500" />
                  XML Venta
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={row.original.status_facturado !== "ACEPTADO"}
                  onClick={() =>
                    downloadXml(
                      `/getArchivosDocumentCDR/${row.original.id}/venta`,
                      `cdr-venta-${row.original.sequential_number}.zip`,
                    )
                  }
                >
                  <FileArchive className="h-4 w-4 mr-2 text-orange-500" />
                  CDR Venta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>

          {/* Ver detalle */}
          <ButtonAction
            icon={Eye}
            onClick={() => onViewDetails(row.original)}
            tooltip="Ver Detalle"
          />

          {/* Declarar SUNAT */}
          {row.original.status_facturado === "PENDIENTE" && (
            <ConfirmationDialog
              trigger={
                <ButtonAction
                  icon={Send}
                  color="blue"
                  tooltip="Declarar a SUNAT"
                />
              }
              title="Declarar a SUNAT"
              description="¿Estás seguro de que deseas declarar esta venta a SUNAT? Esta acción no se puede deshacer."
              confirmText="Declarar"
              cancelText="Cancelar"
              onConfirm={() => onDeclararSunat(row.original)}
              icon="info"
            />
          )}

          {/* Anular */}
          {row.original.status_facturado === "ACEPTADO" && canAnular && (
            <ConfirmationDialog
              trigger={
                <ButtonAction
                  icon={XCircle}
                  color="red"
                  tooltip="Anular documento"
                />
              }
              title="Anular documento"
              description={`¿Estás seguro de que deseas anular esta ${row.original.document_type === "FACTURA" ? "factura" : "boleta"}? Esta acción no se puede deshacer.`}
              confirmText="Anular"
              cancelText="Cancelar"
              onConfirm={() => onAnular(row.original)}
              icon="warning"
            />
          )}

          {/* Más opciones: Gestionar + Eliminar  */}
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
              <DropdownMenuItem onClick={() => onManage(row.original)}>
                <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                Gestionar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(row.original)}
                disabled={hasPayments || isEnviado || isRechazado}
              >
                <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                {hasPayments || isEnviado || isRechazado
                  ? "No se puede editar"
                  : "Editar"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(row.original.id)}
                disabled={isPaid || hasPayments || isEnviado || isRechazado}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isPaid || hasPayments || isEnviado || isRechazado
                  ? "No se puede eliminar"
                  : "Eliminar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
