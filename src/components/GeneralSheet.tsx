import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

export interface GeneralSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  modal?: boolean;
  icon?: React.ReactNode;
}

const GeneralSheet: React.FC<GeneralSheetProps> = ({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
  modal,
  icon,
}) => {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()} modal={modal}>
      <SheetContent side={side} className={className}>
        <SheetHeader>
          <div className="flex items-center gap-2">
            {icon && <div className="mr-2">{icon}</div>}
            {title && <SheetTitle>{title}</SheetTitle>}
          </div>
          <SheetClose onClick={onClose} />
        </SheetHeader>
        <div className="h-full">{children}</div>
      </SheetContent>
    </Sheet>
  );
};

export default GeneralSheet;
