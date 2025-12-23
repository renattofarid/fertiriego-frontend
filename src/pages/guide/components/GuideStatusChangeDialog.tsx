"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GUIDE_STATUSES, type GuideStatus } from "../lib/guide.interface";

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
  const [selectedStatus, setSelectedStatus] = useState<GuideStatus>(
    currentStatus
  );

  const handleConfirm = async () => {
    if (selectedStatus === currentStatus) {
      onOpenChange(false);
      return;
    }

    setLoading(true);
    try {
      await onConfirm(selectedStatus);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const currentStatusLabel = GUIDE_STATUSES.find(
    (s) => s.value === currentStatus
  )?.label;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar estado de guía de remisión</DialogTitle>
          <DialogDescription>
            Estado actual: <strong>{currentStatusLabel}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nuevo estado</label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as GuideStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GUIDE_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
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
              disabled={loading || selectedStatus === currentStatus}
            >
              {loading ? "Actualizando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
