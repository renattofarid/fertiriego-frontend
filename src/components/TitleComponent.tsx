import * as LucideReact from "lucide-react";
import BackButton from "./BackButton";

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
  icon?: keyof typeof LucideReact;
  backRoute?: string;
  children?: React.ReactNode;
}

export default function TitleComponent({
  title,
  subtitle,
  className = "",
  icon,
  backRoute,
  children,
}: Props) {
  const IconComponent = icon
    ? (LucideReact[icon] as React.ComponentType<any>)
    : null;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
      <div className={`flex items-center gap-4 ${className}`}>
        {backRoute && <BackButton route={backRoute} name="" size="icon" />}
        {IconComponent && (
          <div className="text-white bg-primary rounded-md p-2">
            <IconComponent className="size-5 text-white" />
          </div>
        )}
        <div className="flex flex-col items-start">
          <h1 className="md:text-xl font-bold text-primary">{title}</h1>
          {subtitle && (
            <p className="hidden md:block text-muted-foreground text-xs md:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
