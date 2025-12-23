"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";
interface SimpleDeleteDialogProps {
  onConfirm: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  isLoading?: boolean;
}

export function SimpleDeleteDialog({
  onConfirm,
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  isLoading,
}: SimpleDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const effectiveLoading = isLoading ?? loading;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? "Eliminar registro"}</DialogTitle>
          <DialogDescription>
            {description ??
              "Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este registro?"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={effectiveLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={effectiveLoading}
          >
            {effectiveLoading ? (confirmText ? `${confirmText}...` : "Procesando...") : (confirmText ?? "Confirmar")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
