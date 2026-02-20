import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import RequiredField from "./RequiredField";
import { cn } from "@/lib/utils";

interface FormInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name"
> {
  name: string;
  description?: string;
  label?: string | React.ReactNode;
  control?: Control<any>;
  tooltip?: string | React.ReactNode;
  children?: React.ReactNode;
  required?: boolean;
  addonStart?: React.ReactNode;
  addonEnd?: React.ReactNode;
  error?: string;
  uppercase?: boolean;
  optional?: boolean;
}

export function FormInput({
  name,
  description,
  label,
  control,
  tooltip,
  children,
  required,
  className,
  addonStart,
  addonEnd,
  error,
  value,
  onChange,
  uppercase,
  optional,
  ...inputProps
}: FormInputProps) {
  const isNumberType = inputProps.type === "number";

  // Si no hay control, funcionar como input controlado estándar
  if (!control) {
    const handleStandaloneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        if (isNumberType) {
          const val = e.target.value;
          // Crear un evento sintético con el valor numérico
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: val === "" ? "" : Number(val),
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        } else {
          const val = uppercase ? e.target.value.toUpperCase() : e.target.value;
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: val,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      }
    };

    return (
      <div className="flex flex-col justify-between">
        {label && (
          <label className="flex justify-start items-center text-xs md:text-sm mb-1 leading-none h-fit font-medium text-muted-foreground">
            {label}
            {required && <RequiredField />}
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    color="tertiary"
                    className="ml-2 p-0 aspect-square w-4 h-4 text-center justify-center"
                  >
                    ?
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            )}
          </label>
        )}
        <div className="flex flex-col gap-2 items-center">
          <div className="relative w-full">
            {addonStart && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground pointer-events-none z-10">
                {addonStart}
              </div>
            )}
            <Input
              name={name}
              className={cn(
                addonStart && "pl-10",
                addonEnd && "pr-10",
                value && "bg-muted!",
                optional && "border-dashed",
                className,
              )}
              {...inputProps}
              onChange={handleStandaloneChange}
              value={value ?? ""}
            />
            {addonEnd && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground z-10">
                {addonEnd}
              </div>
            )}
          </div>
          {children}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {error && (
          <p className="text-xs font-medium text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }

  // Si hay control, funcionar como FormField (comportamiento original)
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (isNumberType) {
            const val = e.target.value;
            // Permitir string vacío temporalmente
            field.onChange(val === "" ? "" : Number(val));
          } else {
            const val = uppercase
              ? e.target.value.toUpperCase()
              : e.target.value;
            field.onChange(val);
          }
        };

        return (
          <FormItem className="flex flex-col justify-between">
            <FormLabel className="flex justify-start items-center text-xs md:text-sm leading-none h-fit dark:text-muted-foreground">
              {label}
              {required && <RequiredField />}
              {tooltip && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      color="tertiary"
                      className="ml-2 p-0 aspect-square w-4 h-4 text-center justify-center"
                    >
                      ?
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
              )}
            </FormLabel>
            <div className="flex flex-col gap-2 items-center">
              <div className="relative w-full">
                {addonStart && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground pointer-events-none z-10">
                    {addonStart}
                  </div>
                )}
                <FormControl>
                  <Input
                    className={cn(
                      "text-xs md:text-sm",
                      addonStart && "pl-10",
                      addonEnd && "pr-10",
                      field.value && "bg-muted!",
                      optional && "border-dashed",
                      className,
                    )}
                    {...field}
                    {...inputProps}
                    onChange={handleChange}
                    value={field.value ?? ""}
                  />
                </FormControl>
                {addonEnd && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground z-10">
                    {addonEnd}
                  </div>
                )}
              </div>
              {children}
            </div>

            {description && (
              <FormDescription className="text-xs text-muted-foreground mb-0!">
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
