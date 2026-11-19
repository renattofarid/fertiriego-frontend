import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";
import { api } from "@/lib/config";
import { promiseToast } from "@/lib/core.function";

interface PurchaseActionsProps {
  onCreatePurchase: () => void;
  search?: string;
  status?: string;
  paymentType?: string;
  supplierId?: string;
}

const downloadLettersExcel = async () => {
  const response = await api.get("/purchases/letters/export", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "letras-compras.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const PurchaseActions = ({
  onCreatePurchase,
  search,
  status,
  paymentType,
  supplierId,
}: PurchaseActionsProps) => {
  const excelParams = new URLSearchParams();
  if (search) excelParams.append("search", search);
  if (status) excelParams.append("status", status);
  if (paymentType) excelParams.append("payment_type", paymentType);
  if (supplierId) excelParams.append("supplier_id", supplierId);

  const excelQuery = excelParams.toString();
  const excelEndpoint = `/purchase/export${excelQuery ? `?${excelQuery}` : ""}`;

  return (
    <div className="flex items-center gap-2">
      <ExportButtons
        excelEndpoint={excelEndpoint}
        excelFileName="compras.xlsx"
        variant="grouped"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          promiseToast(downloadLettersExcel(), {
            loading: "Descargando letras...",
            success: "Excel de letras descargado exitosamente",
            error: "Error al descargar el Excel de letras",
          })
        }
      >
        <FileSpreadsheet className="h-4 w-4" />
        Letras
      </Button>
      <Button onClick={onCreatePurchase}>
        <Plus className="mr-2 h-4 w-4" />
        Crear Compra
      </Button>
    </div>
  );
};
