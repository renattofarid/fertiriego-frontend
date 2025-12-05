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

interface StatusChangeDialogProps {
  onConfirm: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: string;
  newStatus: string;
}

export function StatusChangeDialog({
  onConfirm,
  open,
  onOpenChange,
  currentStatus,
  newStatus,
}: StatusChangeDialogProps) {
  const [loading, setLoading] = useState(false);

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
          <DialogTitle>Cambiar estado de caja</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas cambiar el estado de <strong>{currentStatus}</strong> a <strong>{newStatus}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Confirmar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
