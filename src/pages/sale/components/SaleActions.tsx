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
}: {
  startDate?: string;
  endDate?: string;
}) {
  const navigate = useNavigate();
  const { MODEL } = SALE;
  const { access, user } = useAuthStore();

  const canAddSale =
    user?.rol_id === 1 ||
    access?.find((perm) =>
      perm.permissions.some((p) => p.routes.some((r) => r === "agregar-venta"))
    );

  // Construir query params para el Excel
  const excelParams = new URLSearchParams();
  if (startDate) excelParams.append("from", startDate);
  if (endDate) excelParams.append("to", endDate);
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
