// components/GeneralModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { DialogDescription } from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import * as LucideReact from "lucide-react";
import TitleFormComponent from "./TitleFormComponent";

interface GeneralModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: Size;
  maxWidth?: string;
  className?: string;
  modal?: boolean;
  icon?: keyof typeof LucideReact;
  titleComponent?: boolean;
  mode?: "create" | "edit" | "detail";
}

type Size = "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "full";
interface SizeClasses {
  [key: string]: string;
}

const sizes: SizeClasses = {
  md: "max-w-md!",
  lg: "max-w-lg!",
  xl: "max-w-xl!",
  "2xl": "max-w-2xl!",
  "3xl": "max-w-3xl!",
  "4xl": "max-w-4xl!",
  "5xl": "max-w-5xl!",
  "6xl": "max-w-6xl!",
  full: "w-full!",
};

export function GeneralModal({
  open,
  onClose,
  titleComponent,
  title,
  subtitle = "Complete el formulario para continuar",
  children,
  size = "lg",
  className,
  modal,
  icon,
  mode = "create",
}: GeneralModalProps) {
  const IconComponent = icon
    ? (LucideReact[icon] as React.ComponentType<any>)
    : null;

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const type = isMobile ? "mobile" : isTablet ? "tablet" : "default";
  {
    return type === "default" ? (
      <Dialog
        open={open}
        onOpenChange={(v: any) => {
          // Solo permitir cerrar si NO es por clic fuera
          if (!v) {
            onClose();
          }
        }}
      >
        <DialogContent
          className={cn(sizes[size], "w-[95vw] rounded-xl overflow-auto")}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            {titleComponent ? (
              <TitleFormComponent title={title} icon={icon} mode={mode} />
            ) : (
              <div className="flex items-start gap-2">
                {icon && IconComponent && (
                  <div className="mr-2 bg-primary text-primary-foreground rounded-md p-2">
                    <IconComponent className="size-5" />
                  </div>
                )}
                <div className="flex flex-col items-start">
                  {title && <DialogTitle>{title}</DialogTitle>}
                  <DialogDescription className="text-muted-foreground text-sm">
                    {subtitle}
                  </DialogDescription>
                </div>
              </div>
            )}
          </DialogHeader>
          <div>{children}</div>
        </DialogContent>
      </Dialog>
    ) : (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()} modal={modal}>
        <DrawerContent
          className={cn(className, "pb-0 flex flex-col max-h-[96vh]")}
        >
          <DrawerHeader className="flex-shrink-0 p-2">
            <div className="flex items-start gap-2">
              {icon && IconComponent && (
                <div className="mr-2 bg-primary text-primary-foreground rounded-md p-2">
                  <IconComponent className="size-5" />
                </div>
              )}
              <div className="flex flex-col items-start">
                {title && <DrawerTitle>{title}</DrawerTitle>}
                {subtitle && (
                  <p className="text-xs text-start text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <DrawerClose onClick={onClose} />
          </DrawerHeader>
          <div
            className="mt-4 overflow-y-auto flex-1 min-h-0 py-4 px-4"
            data-vaul-no-drag
          >
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
}
