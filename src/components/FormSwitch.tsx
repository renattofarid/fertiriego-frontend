import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
  autoHeight = false,
}: FormSwitchProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel className="flex justify-start items-center text-xs md:text-sm mb-1">
              {label}
            </FormLabel>
          )}
          <FormLabel
            className={cn(
              "flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs bg-background hover:bg-muted hover:cursor-pointer",
              className,
              autoHeight ? "h-auto" : "h-8 md:h-10"
            )}
          >
            <div className="flex flex-col gap-1">
              <p className="text-xs md:text-sm">{text}</p>
              {textDescription && (
                <p className="text-xs text-muted-foreground font-normal">
                  {textDescription}
                </p>
              )}
            </div>

            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
          </FormLabel>
          {description && (
            <FormDescription className="text-xs font-normal">
              {description}
            </FormDescription>
          )}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
