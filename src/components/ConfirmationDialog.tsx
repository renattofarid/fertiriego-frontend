"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, BadgeInfo, X } from "lucide-react";
import { type ReactNode, useState } from "react";

interface ConfirmationDialogProps {
  trigger: ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  icon?: "warning" | "danger" | "info";
}

export const ConfirmationDialog = ({
  trigger,
  title = "¿Estás seguro?",
  description = "Se perderán todos los datos ingresados en el formulario. ¿Estás seguro de que deseas cancelar?",
  confirmText = "Sí, cancelar",
  cancelText = "No, continuar",
  onConfirm,
  icon = "warning",
}: ConfirmationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    setIsOpen(false);
    onConfirm();
  };

  const IconComponent =
    icon === "danger" ? X : icon === "warning" ? AlertTriangle : BadgeInfo;
  const iconColor =
    icon === "danger"
      ? "text-red-500"
      : icon === "warning"
        ? "text-amber-500"
        : "text-blue-500";

  const color =
    icon === "danger" ? "red" : icon === "warning" ? "amber" : "blue";

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md gap-3">
        <AlertDialogHeader className="gap-0">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${
                icon === "danger"
                  ? "bg-red-100"
                  : icon === "warning"
                    ? "bg-amber-100"
                    : "bg-blue-100"
              }`}
            >
              <IconComponent className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-left">
          {description}
        </AlertDialogDescription>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="mt-0">{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} color={color}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
