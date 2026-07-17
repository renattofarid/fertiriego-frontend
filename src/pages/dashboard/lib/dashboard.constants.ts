import type { BadgeProps } from "@/components/ui/badge";

export const URGENCY_STYLES: Record<
  string,
  {
    text: string;
    dot: string;
    hex: string;
    ring: string;
    badgeVariant: BadgeProps["variant"];
  }
> = {
  CRITICO: {
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    hex: "#ef4444",
    ring: "ring-red-500/20",
    badgeVariant: "red",
  },
  ADVERTENCIA: {
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
    hex: "#f97316",
    ring: "ring-orange-500/20",
    badgeVariant: "orange",
  },
  NORMAL: {
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    hex: "#10b981",
    ring: "ring-emerald-500/20",
    badgeVariant: "green",
  },
  SIN_DATOS: {
    text: "text-gray-500 dark:text-gray-400",
    dot: "bg-gray-400",
    hex: "#9ca3af",
    ring: "ring-gray-400/20",
    badgeVariant: "gray",
  },
};

export const URGENCY_ORDER: Record<string, number> = {
  CRITICO: 0,
  ADVERTENCIA: 1,
  NORMAL: 2,
  SIN_DATOS: 3,
};

export function getUrgencyStyle(urgency: string) {
  return URGENCY_STYLES[urgency] ?? URGENCY_STYLES.SIN_DATOS;
}

export function urgencyLabel(status: string) {
  return status === "SIN_DATOS"
    ? "Sin datos"
    : status.charAt(0) + status.slice(1).toLowerCase();
}
