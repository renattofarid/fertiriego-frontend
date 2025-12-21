import { cn } from "@/lib/utils";

interface Props {
  children?: React.ReactNode;
  className?: string;
  /**
   * Max width class for the form wrapper. Defaults to 'max-w-(--breakpoint-xl)'.
   */
  maxWidth?: string;
}

export default function FormWrapper({
  children,
  className,
  maxWidth = "max-w-(--breakpoint-xl)",
}: Props) {
  return (
    <div className={cn("w-full mx-auto md:p-4 space-y-4", className, maxWidth)}>
      {children}
    </div>
  );
}
