"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary!" />,
        info: <InfoIcon className="size-4 text-sky-600!" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-600!" />,
        error: <OctagonXIcon className="size-4 text-red-600!" />,
        loading: (
          <Loader2Icon className="size-4 text-slate-600! animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "bg-background/60! backdrop-blur-md! shadow-lg! border! border-slate-200/50! dark:border-slate-700/50!",
          description: "text-muted-foreground!",
          actionButton:
            "!bg-primary !text-primary-foreground hover:!bg-primary/90",
          success: "[&_button]:!bg-primary [&_button]:hover:!bg-primary/90",
          error: "[&_button]:!bg-red-600 [&_button]:hover:!bg-red-700",
          warning: "[&_button]:!bg-amber-600 [&_button]:hover:!bg-amber-700",
          info: "[&_button]:!bg-sky-600 [&_button]:hover:!bg-sky-700",
          loading: "",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
