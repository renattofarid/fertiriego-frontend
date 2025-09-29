import { Loader2 } from "lucide-react";

export default function FormSkeleton() {
  return (
    <div className="w-full max-w-(--breakpoint-lg) mx-auto md:p-4 flex flex-col gap-6 h-full items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
