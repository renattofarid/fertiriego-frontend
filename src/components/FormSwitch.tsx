import { type Control, type FieldValues, type Path } from "react-hook-form";
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
}: FormSwitchProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel className="h-fit flex">{label}</FormLabel>}
          <FormLabel
            className={cn(
              "flex flex-row truncate items-center justify-between rounded-lg border h-10 p-3 shadow-xs bg-transparent hover:bg-muted hover:cursor-pointer",
              className
            )}
          >
            <div className="flex flex-col gap-1">
              <p>{text}</p>
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
        </FormItem>
      )}
    />
  );
}
