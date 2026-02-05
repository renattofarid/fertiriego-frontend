import type { LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface ButtonActionProps extends Omit<
  ButtonProps,
  "size" | "children" | "asChild"
> {
  icon: LucideIcon;
  canRender?: boolean;
  color?: ButtonProps["color"];
}

export function ButtonAction({
  icon: Icon,
  variant = "outline",
  canRender = true,
  color = "muted",
  ...props
}: ButtonActionProps) {
  if (!canRender) return null;

  return (
    <Button variant={variant} size="icon-xs" color={color} {...props}>
      <Icon />
    </Button>
  );
}
