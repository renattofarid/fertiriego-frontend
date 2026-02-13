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
import { Trash2, type LucideIcon } from "lucide-react";
interface SimpleDeleteDialogProps {
  onConfirm: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  isLoading?: boolean;
}

export const DeleteButton = ({
  onClick,
  icon: Icon = Trash2,
  variant = "outline",
  tooltip = "Eliminar",
  disabled = false,
}: {
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "ghost" | "outline" | "default" | "destructive";
  tooltip?: string;
  disabled?: boolean;
}) => {
  return (
    <Button
      type="button"
      tooltip={tooltip}
      variant={variant}
      size="icon"
      color="red"
      className="size-7"
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="size-5" />}
    </Button>
  );
};

export function SimpleDeleteDialog({
  onConfirm,
  open,
  onOpenChange,
  title = "Eliminar registro",
  description = "Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este registro?",
  confirmText = "Confirmar",
  isLoading,
}: SimpleDeleteDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = isLoading ?? internalLoading;

  const handleConfirm = async () => {
    // Si el estado de carga viene controlado desde fuera,
    // solo ejecutamos la acción y cerramos el diálogo.
    if (isLoading !== undefined) {
      await onConfirm();
      onOpenChange(false);
      return;
    }

    setInternalLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            variant={"destructive"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Eliminando..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
