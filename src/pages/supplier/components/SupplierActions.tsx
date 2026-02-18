"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SUPPLIER } from "../lib/supplier.interface";

export default function SupplierActions() {
  const { MODEL } = SUPPLIER;
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button
        
        className="ml-auto"
        onClick={() => navigate("/proveedores/agregar")}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
