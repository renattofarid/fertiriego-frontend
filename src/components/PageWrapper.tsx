import { cn } from "@/lib/utils";

interface Props {
  children?: React.ReactNode;
  size?: "xl" | "2xl" | "3xl";
}

export default function PageWrapper({ children, size = "3xl" }: Props) {
  const sizeClasses = {
    xl: "max-w-(--breakpoint-xl)",
    "2xl": "max-w-(--breakpoint-2xl)",
    "3xl": "max-w-(--breakpoint-3xl)",
  };

  return (
    <div className={cn("w-full mx-auto md:pt-0 space-y-6", sizeClasses[size])}>
      {children}
    </div>
  );
}
