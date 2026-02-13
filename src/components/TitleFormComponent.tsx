import { cn } from "@/lib/utils";
import * as LucideReact from "lucide-react";
import BackButton from "./BackButton";

interface Props {
  title: string;
  mode?: "create" | "edit" | "detail";
  className?: string;
  icon?: keyof typeof LucideReact;
  children?: React.ReactNode;
  backRoute?: string;
}

export default function TitleFormComponent({
  title,
  mode,
  className = "",
  icon,
  children,
  backRoute,
}: Props) {
  const IconComponent = icon
    ? (LucideReact[icon] as React.ComponentType<any>)
    : null;

  return (
    <div
      className={cn(
        "flex flex-row gap-4 items-center md:items-center justify-between w-full md:w-full",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-row gap-4 items-center md:items-center w-full md:w-full",
          className,
        )}
      >
        {backRoute && <BackButton route={backRoute} name={""} size="icon" />}

        {IconComponent && (
          <div className="text-white bg-primary rounded-md p-2">
            <IconComponent className="size-5 text-white" />
          </div>
        )}
        <div className="flex flex-col items-start">
          <h1 className="md:text-xl font-bold text-primary">{title}</h1>

          <p className="text-muted-foreground text-xs md:text-sm">{`${
            mode === "create"
              ? "Agregar"
              : mode === "edit"
                ? "Actualizar"
                : "Detalles"
          } ${title}`}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
