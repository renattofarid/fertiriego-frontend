import { useParams } from "react-router-dom";
import TitleComponent from "@/components/TitleComponent";
import { FileText, Calendar, Truck, User, Package, FileCheck, Route as RouteIcon, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { BackButton } from "@/components/BackButton";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
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
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card className="border-none bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Estado</p>
                  <Badge variant={statusVariants[guide.status] || "default"} className="text-sm">
                    {guide.status}
                  </Badge>
                </div>
                <div className="bg-muted-foreground/10 p-2.5 rounded-lg shrink-0">
                  <FileCheck className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-primary/5 hover:bg-primary/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Total Bultos</p>
                  <p className="text-xl font-bold text-primary truncate">{guide.total_packages}</p>
                </div>
                <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Peso Total (KG)</p>
                  <p className="text-xl font-bold truncate">{guide.total_weight}</p>
                </div>
                <div className="bg-muted-foreground/10 p-2.5 rounded-lg shrink-0">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documento */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información del Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Participantes */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5" /> Participantes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </CardContent>
        </Card>

        {/* Vehículos */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-5 w-5" /> Vehículos
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </CardContent>
        </Card>

        {/* Direcciones */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <RouteIcon className="h-5 w-5" /> Rutas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

        {/* Almacén y Observaciones (si aplica) */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-5 w-5" /> Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{guide.observations || "-"}</p>
          </CardContent>
        </Card>

        {/* Detalles */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-5 w-5" /> Detalles de Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={detailColumns} data={guide.details || []} />
          </CardContent>
        </Card>
      </div>
    </FormWrapper>
  );
}
