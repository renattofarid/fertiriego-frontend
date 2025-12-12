"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SALE } from "../lib/sale.interface";
import { useNavigate } from "react-router-dom";
import ExportButtons from "@/components/ExportButtons";

export default function SaleActions() {
  const navigate = useNavigate();
  const { MODEL } = SALE;

  return (
    <div className="flex items-center gap-2">
      <ExportButtons
        excelEndpoint="/sales/export"
        excelFileName="ventas.xlsx"
        variant="grouped"
      />
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => navigate("/ventas/agregar")}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
