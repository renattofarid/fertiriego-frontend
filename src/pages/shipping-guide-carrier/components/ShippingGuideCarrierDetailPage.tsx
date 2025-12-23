import { useParams } from "react-router-dom";
import TitleComponent from "@/components/TitleComponent";
import { FileText, Calendar, Truck, User, Package, FileCheck, Route as RouteIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { BackButton } from "@/components/BackButton";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { GroupFormSection } from "@/components/GroupFormSection";
import { useShippingGuideCarrierStore } from "../lib/shipping-guide-carrier.store";
import { SHIPPING_GUIDE_CARRIER, type ShippingGuideCarrierDetailResource } from "../lib/shipping-guide-carrier.interface";

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

  const statusVariants: Record<string, "default" | "secondary" | "destructive"> = {
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
    { accessorKey: "unit_measure", header: "Unidad" },
    { accessorKey: "weight", header: "Peso" },
  ];

  return (
    <FormWrapper>
      <div className="flex justify-between items-center gap-2">
        <BackButton to={ROUTE} />
        <TitleComponent
          title={`${MODEL.name} - ${guide.full_guide_number}`}
          subtitle={`Detalle de la ${MODEL.name.toLowerCase()}`}
          icon={ICON}
        />
      </div>

      <div className="space-y-4">
        {/* Resumen */}
        <GroupFormSection title="Resumen" icon={FileCheck} cols={{ sm: 2, md: 3 }}>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge variant={statusVariants[guide.status] || "default"} className="text-sm">
              {guide.status}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Bultos</p>
            <p className="text-lg font-bold">{guide.total_packages}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Peso Total (KG)</p>
            <p className="text-lg font-bold">{guide.total_weight}</p>
          </div>
        </GroupFormSection>

        {/* Documento */}
        <GroupFormSection title="Información del Documento" icon={FileText} cols={{ sm: 2, md: 3 }}>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Número</p>
            <p className="font-mono font-bold text-lg">{guide.full_guide_number}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Fecha Emisión
            </p>
            <p className="font-medium">{formatDate(guide.issue_date)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Inicio Traslado
            </p>
            <p className="font-medium">{formatDate(guide.transfer_start_date)}</p>
          </div>
        </GroupFormSection>

        {/* Participantes */}
        <GroupFormSection title="Participantes" icon={User} cols={{ sm: 1, md: 3 }}>
          <div>
            <p className="text-xs text-muted-foreground">Transportista</p>
            <p className="font-semibold">{guide.carrier?.business_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Remitente</p>
            <p className="font-semibold">{guide.remittent?.business_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Conductor</p>
            <p className="font-semibold">{guide.driver?.full_name}</p>
          </div>
        </GroupFormSection>

        {/* Vehículos */}
        <GroupFormSection title="Vehículos" icon={Truck} cols={{ sm: 1, md: 3 }}>
          <div>
            <p className="text-xs text-muted-foreground">Principal</p>
            <p className="font-mono font-semibold">{guide.vehicle?.plate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Secundario</p>
            <p className="font-mono font-semibold">{guide.secondary_vehicle?.plate || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Licencia Conductor</p>
            <p className="font-semibold">{guide.driver_license}</p>
          </div>
        </GroupFormSection>

        {/* Rutas */}
        <GroupFormSection title="Rutas" icon={RouteIcon} cols={{ sm: 1, md: 2 }}>
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Dirección Origen</p>
              <p className="font-medium">{guide.origin_address}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Ubigeo Origen</p>
              <Badge variant="outline" className="font-mono">
                {guide.origin_ubigeo?.full_name || "-"}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Dirección Destino</p>
              <p className="font-medium">{guide.destination_address}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Ubigeo Destino</p>
              <Badge variant="outline" className="font-mono">
                {guide.destination_ubigeo?.full_name || "-"}
              </Badge>
            </div>
          </div>
        </GroupFormSection>

        {/* Observaciones */}
        <GroupFormSection title="Observaciones" icon={FileText} cols={{ sm: 1 }}>
          <p className="text-sm">{guide.observations || "-"}</p>
        </GroupFormSection>

        {/* Detalles */}
        <GroupFormSection title="Detalles de Productos" icon={Package} cols={{ sm: 1 }}>
          <DataTable columns={detailColumns} data={guide.details || []} />
        </GroupFormSection>
      </div>
    </FormWrapper>
  );
}
