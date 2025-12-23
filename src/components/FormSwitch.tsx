import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FormSwitchProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  text: string;
  description?: string;
  textDescription?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  autoHeight?: boolean;
}

export function FormSwitch<T extends FieldValues>({
  control,
  name,
  label,
  text,
  description,
  textDescription,
  className,
  disabled,
  size = "md",
  autoHeight = false,
}: FormSwitchProps<T>) {
  const sizeClasses = {
    sm: "h-8 p-2 gap-2",
    md: "h-9 p-3 gap-3",
    lg: "h-11 p-4 gap-4",
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel className="h-fit flex">{label}</FormLabel>}
          <FormLabel
            className={cn(
              "flex flex-row items-center justify-between rounded-lg border shadow-xs bg-background hover:bg-muted hover:cursor-pointer",
              sizeClasses[size],
              className,
              autoHeight ? "h-auto" : "h-8 md:h-10"
            )}
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{text}</p>
              {textDescription && (
                <p className="text-xs text-muted-foreground font-normal leading-tight">
                  {textDescription}
                </p>
              )}
            </div>

            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
                className="shrink-0"
              />
            </FormControl>
          </FormLabel>
          {description && (
            <FormDescription className="text-xs font-normal">
              {description}
            </FormDescription>
          )}
        </FormItem>
      )}
    />
  );
}
