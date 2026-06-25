import { GeneralModal } from "@/components/GeneralModal";
import FormSkeleton from "@/components/FormSkeleton";
import { Badge } from "@/components/ui/badge";
import { useProductClassifications } from "@/pages/product-tag/lib/classification.hook";
import type { ClassificationItem } from "@/pages/product-tag/lib/classification.interface";

interface Props {
  open: boolean;
  productId: number;
  onClose: () => void;
}

const PRIORITY_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  A: { label: "A — Alta", variant: "default" },
  B: { label: "B — Media", variant: "secondary" },
  C: { label: "C — Baja", variant: "outline" },
};

function ClassificationCard({ item }: { item: ClassificationItem }) {
  const priority = PRIORITY_LABELS[item.priority] ?? { label: item.priority, variant: "outline" as const };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
      <div
        className="w-3 h-3 rounded-full shrink-0 mt-1 border border-border"
        style={{ backgroundColor: item.tag.color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{item.tag.name}</span>
          <Badge variant={priority.variant} className="text-xs">
            Prioridad {priority.label}
          </Badge>
        </div>
        {item.notes && (
          <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Asignado por{" "}
          <span className="font-medium">{item.assigned_by.name}</span>
          {" — "}
          {new Date(item.assigned_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

export default function ProductClassificationModal({ open, productId, onClose }: Props) {
  const { data, isLoading } = useProductClassifications(productId);

  const classification = data?.data;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Clasificación del Producto"
      maxWidth="!max-w-2xl"
      icon="Tags"
    >
      {isLoading || !classification ? (
        <FormSkeleton />
      ) : (
        <div className="space-y-5 w-full">
          <div className="bg-muted p-3 rounded-lg">
            <p className="font-semibold text-sm">{classification.product.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {classification.product.category} · {classification.product.brand}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Clasificaciones Actuales</h4>
            {classification.current_classifications.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Sin clasificaciones actualmente.
              </p>
            ) : (
              <div className="space-y-2">
                {classification.current_classifications.map((item) => (
                  <ClassificationCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {classification.classification_history.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Historial</h4>
              <div className="space-y-2">
                {classification.classification_history.map((item) => (
                  <ClassificationCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </GeneralModal>
  );
}
