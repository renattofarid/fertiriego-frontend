"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import GeneralSheet from "@/components/GeneralSheet";

interface FilterWrapperProps {
  children: React.ReactNode;
  maxVisible?: number;
  activeExtraCount?: number;
  className?: string;
}

export default function FilterWrapper({
  children,
  maxVisible = 4,
  activeExtraCount = 0,
  className,
}: FilterWrapperProps) {
  const [openSheet, setOpenSheet] = React.useState(false);

  const allFilters = React.Children.toArray(children).filter(Boolean);
  const primaryFilters = allFilters.slice(0, maxVisible);
  const extraFilters = allFilters.slice(maxVisible);
  const hasExtra = extraFilters.length > 0;

  return (
    <>
      <div className={cn("flex items-center gap-2 flex-wrap", className)}>
        {primaryFilters}

        {hasExtra && (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setOpenSheet(true)}
            >
              <SlidersHorizontal className="size-4" />
              Más filtros
            </Button>
            {activeExtraCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-2 -right-2 size-5 flex items-center justify-center p-0 text-[10px] pointer-events-none"
              >
                {activeExtraCount}
              </Badge>
            )}
          </div>
        )}
      </div>

      {hasExtra && (
        <GeneralSheet
          open={openSheet}
          onClose={() => setOpenSheet(false)}
          title="Más filtros"
          subtitle="Aplica filtros adicionales a la búsqueda"
          icon="SlidersHorizontal"
          size="md"
        >
          <div className="flex flex-col gap-4 py-4">{extraFilters}</div>
        </GeneralSheet>
      )}
    </>
  );
}
