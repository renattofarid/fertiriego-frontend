import { useParams } from "react-router-dom";
import { Calendar, Truck, Package, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { GroupFormSection } from "@/components/GroupFormSection";
import { useShippingGuideCarrierStore } from "../lib/shipping-guide-carrier.store";
import {
  SHIPPING_GUIDE_CARRIER,
  type ShippingGuideCarrierDetailResource,
} from "../lib/shipping-guide-carrier.interface";
import TitleFormComponent from "@/components/TitleFormComponent";

export default function ShippingGuideCarrierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { guide, isFinding, fetchGuide } = useShippingGuideCarrierStore();

  const { MODEL, ICON, ROUTE } = SHIPPING_GUIDE_CARRIER;

  if (!guide && id && !isFinding) {
    fetchGuide(Number(id));
  }

  if (isFinding || !guide) {
    return <FormSkeleton />;
  }

  const statusVariants: Record<
    string,
    "default" | "secondary" | "destructive"
  > = {
    EMITIDA: "secondary",
    EN_TRANSITO: "default",
    ENTREGADA: "default",
    ANULADA: "destructive",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const detailColumns: ColumnDef<ShippingGuideCarrierDetailResource>[] = [
    { accessorKey: "product_name", header: "Producto" },
    { accessorKey: "description", header: "Descripción" },
    { accessorKey: "quantity", header: "Cantidad" },
    { accessorKey: "unit", header: "Unidad" },
    { accessorKey: "weight", header: "Peso" },
  ];

  return (
    <FormWrapper>
      <TitleFormComponent
        title={`${MODEL.name} - ${guide.full_guide_number}`}
        backRoute={ROUTE}
        mode="detail"
        icon={ICON}
      />

      <div className="space-y-4">
        {/* Documento */}
        <GroupFormSection
          title="Información del Documento"
          icon={FileCheck}
          cols={{ sm: 2, md: 3 }}
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
            <p className="text-xs text-muted-foreground">Número</p>
            <p className="font-mono font-bold text-lg">
              {guide.full_guide_number}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Fecha Emisión
            </p>
            <p className="font-medium">{formatDate(guide.issue_date)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Bultos</p>
            <p className="text-lg font-bold">{guide.total_packages}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Peso Total (KG)</p>
            <p className="text-lg font-bold">{guide.total_weight}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Inicio Traslado
            </p>
            <p className="font-medium">
              {formatDate(guide.transfer_start_date)}
            </p>
          </div>
        </GroupFormSection>

        {/* Transporte y Ruta */}
        <GroupFormSection
          title="Transporte y Ruta"
          icon={Truck}
          cols={{ sm: 2, md: 3 }}
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Transportista</p>
            <p className="font-semibold">{guide.carrier?.business_name}</p>
          </div>
          {guide.transport_modality === "PRIVADO" && (
            <>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Conductor</p>
                <p className="font-semibold">{guide.driver?.full_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Vehículo Principal</p>
                <p className="font-mono font-semibold">{guide.vehicle?.plate}</p>
              </div>
            </>
          )}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Remitente</p>
            <p className="font-semibold">
              {guide.remittent?.business_name ??
                (guide.remittent?.names ?? "") +
                  " " +
                  (guide.remittent?.father_surname ?? "") +
                  " " +
                  (guide.remittent?.mother_surname ?? "")}
            </p>
          </div>
          {guide.transport_modality === "PRIVADO" && (
            <>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Licencia Conductor</p>
                <p className="font-semibold">{guide.driver_license}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Vehículo Secundario</p>
                <p className="font-mono font-semibold">
                  {guide.secondary_vehicle?.plate || "-"}
                </p>
              </div>
            </>
          )}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Origen</p>
            <p className="font-medium">{guide.origin_address}</p>
            <Badge variant="outline" className="font-mono">
              {guide.origin_ubigeo?.full_name || "-"}
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Destino</p>
            <p className="font-medium">{guide.destination_address}</p>
            <Badge variant="outline" className="font-mono">
              {guide.destination_ubigeo?.full_name || "-"}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Observaciones</p>
            <p className="text-sm">{guide.observations || "-"}</p>
          </div>
        </GroupFormSection>

        {/* Detalles */}
        <GroupFormSection
          title="Detalles de Productos"
          icon={Package}
          cols={{ sm: 1 }}
        >
          <DataTable columns={detailColumns} data={guide.details || []} />
        </GroupFormSection>
      </div>
    </FormWrapper>
  );
}
