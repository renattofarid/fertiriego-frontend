"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WAREHOUSE_DOCUMENT } from "../lib/warehouse-document.interface";

interface WarehouseDocumentActionsProps {
  onCreateDocument: () => void;
}

export default function WarehouseDocumentActions({
  onCreateDocument,
}: WarehouseDocumentActionsProps) {
  const { MODEL } = WAREHOUSE_DOCUMENT;

  return (
    <div className="flex items-center gap-2">
      <Button  className="ml-auto" onClick={onCreateDocument}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
