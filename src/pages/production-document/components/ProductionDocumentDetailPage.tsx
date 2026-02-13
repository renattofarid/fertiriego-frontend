import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProductionDocumentStore } from "../lib/production-document.store";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { GroupFormSection } from "@/components/GroupFormSection";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import type { ColumnDef } from "@tanstack/react-table";
import { Package, Factory, AlertCircle } from "lucide-react";
import { successToast, errorToast } from "@/lib/core.function";
import { PRODUCTION_DOCUMENT } from "../lib/production-document.interface";
import type { ProductionDocumentComponentResource } from "../lib/production-document.interface";
import TitleFormComponent from "@/components/TitleFormComponent";

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PROCESADO: "default",
  CANCELADO: "destructive",
};

export default function ProductionDocumentDetailPage() {
  const { ROUTE, ICON } = PRODUCTION_DOCUMENT;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    document: guide,
    fetchDocument,
    cancelDocument,
    isFinding,
  } = useProductionDocumentStore();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocument(parseInt(id));
    }
  }, [id, fetchDocument]);

  const handleCancel = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await cancelDocument(parseInt(id));
      successToast("Documento cancelado correctamente");
      setShowCancelDialog(false);
      fetchDocument(parseInt(id));
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al cancelar el documento",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const detailColumns: ColumnDef<ProductionDocumentComponentResource>[] = [
    {
      accessorKey: "component_name",
      header: "Componente",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.component_name}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.component.category}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "quantity_required_formatted",
      header: "Cantidad Requerida",
      cell: ({ row }) => (
        <span>{row.original.quantity_required_formatted}</span>
      ),
    },
    {
      accessorKey: "quantity_used_formatted",
      header: "Cantidad Usada",
      cell: ({ row }) => <span>{row.original.quantity_used_formatted}</span>,
    },
    {
      accessorKey: "unit_cost",
      header: "Costo Unitario",
      cell: ({ row }) => <span>S/ {row.original.unit_cost.toFixed(2)}</span>,
    },
    {
      accessorKey: "total_cost_formatted",
      header: "Costo Total",
      cell: ({ row }) => (
        <span className="font-medium">
          S/ {row.original.total_cost_formatted}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notas",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.notes || "-"}
        </span>
      ),
    },
  ];

  if (isFinding || !guide) {
    return <FormSkeleton />;
  }

  return (
    <FormWrapper>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TitleFormComponent
            title={`${guide.document_number} - ${guide.product_name}`}
            mode="detail"
            icon={ICON}
            backRoute={ROUTE}
          />
        </div>
        <div className="flex gap-2">
          {guide.status === "PROCESADO" && (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`${ROUTE.replace(ROUTE, "")}/actualizar/${id}`)
                }
              >
                Actualizar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                Cancelar Documento
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Estado y Resumen */}
        <GroupFormSection
          title="Resumen"
          icon={Factory}
          cols={{ sm: 2, md: 4 }}
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge
              variant={statusVariants[guide.status] || "default"}
              className="text-sm"
            >
              {guide.status}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cantidad Producida</p>
            <p className="text-lg font-bold">{guide.quantity_produced}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Componentes</p>
            <p className="text-lg font-bold">{guide.total_components}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Costo Total</p>
            <p className="text-lg font-bold">
              S/ {guide.total_production_cost.toFixed(2)}
            </p>
          </div>
        </GroupFormSection>

        {/* Información del Documento */}
        <GroupFormSection
          title="Información del Documento"
          icon={Package}
          cols={{ sm: 1, md: 2 }}
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Número</p>
            <p className="font-mono font-bold text-lg">
              {guide.document_number}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Producto</p>
            <p className="font-semibold">{guide.product_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Fecha de Producción</p>
            <p className="font-medium">{guide.production_date_formatted}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cantidad Producida</p>
            <p className="font-semibold">{guide.quantity_produced}</p>
          </div>
        </GroupFormSection>

        {/* Participantes */}
        <GroupFormSection
          title="Participantes"
          icon={Factory}
          cols={{ sm: 1, md: 3 }}
        >
          <div>
            <p className="text-xs text-muted-foreground">Usuario</p>
            <p className="font-semibold">{guide.user_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Responsable</p>
            <p className="font-semibold">{guide.responsible_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Documento</p>
            <p className="font-mono">
              {guide.responsible?.document_number || "-"}
            </p>
          </div>
        </GroupFormSection>

        {/* Almacenes */}
        <GroupFormSection
          title="Almacenes"
          icon={Package}
          cols={{ sm: 1, md: 2 }}
        >
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Almacén Origen</p>
              <p className="font-semibold">{guide.warehouse_origin_name}</p>
              <p className="text-sm text-muted-foreground">
                {guide.warehouse_origin?.address}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Almacén Destino</p>
              <p className="font-semibold">{guide.warehouse_dest_name}</p>
              <p className="text-sm text-muted-foreground">
                {guide.warehouse_dest?.address}
              </p>
            </div>
          </div>
        </GroupFormSection>

        {/* Costos */}
        <GroupFormSection
          title="Detalles de Costos"
          icon={Factory}
          cols={{ sm: 1, md: 3 }}
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Costo de Componentes
            </p>
            <p className="text-lg font-bold">
              S/ {guide.total_component_cost.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Costo Laboral</p>
            <p className="text-lg font-bold">
              S/ {guide.labor_cost.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Costo Indirecto</p>
            <p className="text-lg font-bold">
              S/ {guide.overhead_cost.toFixed(2)}
            </p>
          </div>
        </GroupFormSection>

        {/* Observaciones */}
        {guide.observations && (
          <GroupFormSection
            title="Observaciones"
            icon={AlertCircle}
            cols={{ sm: 1 }}
          >
            <p className="text-sm">{guide.observations}</p>
          </GroupFormSection>
        )}

        {/* Detalles de Componentes */}
        <GroupFormSection
          title="Detalles de Componentes"
          icon={Package}
          cols={{ sm: 1 }}
        >
          <DataTable columns={detailColumns} data={guide.details || []} />
        </GroupFormSection>
      </div>

      <SimpleDeleteDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancel}
        title="Cancelar Documento"
        description="¿Está seguro de que desea cancelar este documento de producción? Esta acción no se puede deshacer."
        confirmText="Cancelar Documento"
        isLoading={isSubmitting}
      />
    </FormWrapper>
  );
}
