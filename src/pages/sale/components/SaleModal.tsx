"use client";

import { GeneralModal } from "@/components/GeneralModal";

interface SaleModalProps {
  title: string;
  mode: "create" | "update";
  open: boolean;
  onClose: () => void;
  saleId?: number;
}

export default function SaleModal({
  title,
  open,
  onClose,
}: SaleModalProps) {
  // TODO: Implementar formulario de venta
  // Referencia: PurchaseForm.tsx
  // Adaptaciones: customer_id (en lugar de supplier_id), serie/numero separados, sin tax en detalles

  return (
    <GeneralModal
      title={title}
      open={open}
      onClose={onClose}
      maxWidth="max-w-6xl"
    >
      <div className="p-4">
        <p className="text-muted-foreground">
          Formulario de venta en desarrollo...
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Este componente será implementado siguiendo el patrón de PurchaseForm.
        </p>
      </div>
    </GeneralModal>
  );
}
