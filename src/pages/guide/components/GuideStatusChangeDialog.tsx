import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GUIDE_STATUS_LABELS, type GuideStatus } from "../lib/guide.interface";

interface GuideStatusChangeDialogProps {
  onConfirm: (newStatus: GuideStatus) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: GuideStatus;
}

export function GuideStatusChangeDialog({
  onConfirm,
  open,
  onOpenChange,
  currentStatus,
}: GuideStatusChangeDialogProps) {
  const [loading, setLoading] = useState(false);
  const currentStatusLabel = GUIDE_STATUS_LABELS[currentStatus] ?? currentStatus;
  const canAnnul = ["DECLARADA", "EMITIDA"].includes(currentStatus);

  const handleConfirm = async () => {
    if (!canAnnul) return;

    setLoading(true);
    try {
      await onConfirm("ANULADA");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anular guía de remisión</DialogTitle>
          <DialogDescription>
            Estado actual: <strong>{currentStatusLabel}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta acción cambiará el estado de la guía a <strong>ANULADA</strong>.
            Solo aplica para guías declaradas o emitidas.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading || !canAnnul}
            >
              {loading ? "Anulando..." : "Anular"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
