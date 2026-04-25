"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SALE } from "../lib/sale.interface";
import { useNavigate } from "react-router-dom";
import ExportButtons from "@/components/ExportButtons";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

export default function SaleActions({
  startDate,
  endDate,
  customerId,
  documentType,
  paymentType,
  status,
  currency,
  serie,
  numero,
  warehouseId,
  userId,
  productId,
}: {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  documentType?: string;
  paymentType?: string;
  status?: string;
  currency?: string;
  serie?: string;
  numero?: string;
  warehouseId?: string;
  userId?: string;
  productId?: string;
}) {
  const navigate = useNavigate();
  const { MODEL } = SALE;
  const { access, user } = useAuthStore();

  const canAddSale =
    user?.rol_id === 1 ||
    access?.find((perm) =>
      perm.permissions.some((p) => p.routes.some((r) => r === "agregar-venta"))
    );

  const excelParams = new URLSearchParams();
  if (startDate) excelParams.append("from", startDate);
  if (endDate) excelParams.append("to", endDate);
  if (customerId) excelParams.append("customer_id", customerId);
  if (documentType) excelParams.append("document_type", documentType);
  if (paymentType) excelParams.append("payment_type", paymentType);
  if (status) excelParams.append("status", status);
  if (currency) excelParams.append("currency", currency);
  if (serie) excelParams.append("serie", serie);
  if (numero) excelParams.append("numero", numero);
  if (warehouseId) excelParams.append("warehouse_id", warehouseId);
  if (userId) excelParams.append("user_id", userId);
  if (productId) excelParams.append("product_id", productId);
  const excelQuery = excelParams.toString();
  const excelEndpoint = `/sale/excel${excelQuery ? `?${excelQuery}` : ""}`;

  return (
    <div className="flex items-center gap-2">
      <ExportButtons
        excelEndpoint={excelEndpoint}
        excelFileName="ventas.xlsx"
        variant="grouped"
      />

      {canAddSale && (
        <Button
          className="ml-auto"
          onClick={() => navigate("/ventas/agregar")}
        >
          <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
        </Button>
      )}
    </div>
  );
}
