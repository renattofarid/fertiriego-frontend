import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
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

interface FormTextAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "name"
> {
  name: string;
  description?: string;
  label?: string | React.ReactNode;
  control?: Control<any>;
  tooltip?: string | React.ReactNode;
  children?: React.ReactNode;
  required?: boolean;
  error?: string;
  uppercase?: boolean;
}

export function FormTextArea({
  name,
  description,
  label,
  control,
  tooltip,
  children,
  required,
  className,
  error,
  value,
  onChange,
  uppercase,
  ...textareaProps
}: FormTextAreaProps) {
  // Sin control: textarea controlado estándar
  if (!control) {
    const handleStandaloneChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        const val = uppercase ? e.target.value.toUpperCase() : e.target.value;
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: val },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
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
          <Textarea
            name={name}
            className={cn("text-xs md:text-sm", className)}
            {...textareaProps}
            onChange={handleStandaloneChange}
            value={value ?? ""}
          />
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

  // Con control: integración con react-hook-form
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          const val = uppercase ? e.target.value.toUpperCase() : e.target.value;
          field.onChange(val);
        };

        return (
          <FormItem className="flex flex-col justify-between">
            <FormLabel className="flex justify-start items-center text-xs md:text-sm mb-1 leading-none h-fit dark:text-muted-foreground">
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
              <FormControl>
                <Textarea
                  className={cn("text-xs md:text-sm", className)}
                  {...field}
                  {...textareaProps}
                  onChange={handleChange}
                  value={field.value ?? ""}
                />
              </FormControl>
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
