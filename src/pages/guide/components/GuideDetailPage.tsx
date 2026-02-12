import { useParams } from "react-router-dom";
import {
  FileText,
  Calendar,
  Truck,
  User,
  Package,
  Clock,
  Building,
  Route as RouteIcon,
  CircleDot,
  Flag,
  FileCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGuideById } from "../lib/guide.hook";
import { GUIDE, type GuideDetailResource } from "../lib/guide.interface";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import TitleFormComponent from "@/components/TitleFormComponent";

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: guide, isFinding } = useGuideById(Number(id));

  const { MODEL, ICON, ROUTE } = GUIDE;

  if (isFinding || !guide) {
    return <FormSkeleton />;
  }

  const statusVariants: Record<
    string,
    "default" | "secondary" | "destructive"
  > = {
    REGISTRADA: "secondary",
    ENVIADA: "default",
    ACEPTADA: "default",
    RECHAZADA: "destructive",
    ANULADA: "destructive",
  };

  const modalityVariants: Record<string, "default" | "secondary"> = {
    PUBLICO: "default",
    PRIVADO: "secondary",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <FormWrapper>
      <div className="flex justify-between items-center gap-2">
        <TitleFormComponent
          title={`${MODEL.name} - ${guide.full_guide_number}`}
          mode="detail"
          icon={ICON}
          backRoute={ROUTE}
        />
      </div>

      <div className="space-y-4">
        {/* Header con información destacada */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Estado */}
          <Card className="border-none bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Estado
                  </p>
                  <Badge
                    variant={statusVariants[guide.status] || "default"}
                    className="text-sm"
                  >
                    {guide.status}
                  </Badge>
                </div>
                <div className="bg-muted-foreground/10 p-2.5 rounded-lg shrink-0">
                  <FileCheck className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Bultos */}
          <Card className="border-none bg-primary/5 hover:bg-primary/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Total Bultos
                  </p>
                  <p className="text-xl font-bold text-primary truncate">
                    {guide.total_packages}
                  </p>
                </div>
                <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modalidad */}
          <Card className="border-none bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Modalidad
                  </p>
                  <Badge
                    variant={
                      modalityVariants[guide.transport_modality] || "default"
                    }
                    className="text-sm"
                  >
                    {guide.transport_modality === "PUBLICO"
                      ? "🚌 Público"
                      : "🚗 Privado"}
                  </Badge>
                </div>
                <div className="bg-muted-foreground/10 p-2.5 rounded-lg shrink-0">
                  <RouteIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información del Documento */}
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
                <p className="text-xs text-muted-foreground">
                  Número de Documento
                </p>
                <p className="font-mono font-bold text-lg">
                  {guide.full_guide_number}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Motivo</p>
                <p className="font-semibold">{guide.motive?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Almacén */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-5 w-5" />
              Almacén
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">{guide.warehouse?.name}</p>
          </CardContent>
        </Card>

        {/* Fechas */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha de Emisión
                </p>
                <p className="font-medium">{formatDate(guide.issue_date)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha de Traslado
                </p>
                <p className="font-medium">{formatDate(guide.transfer_date)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha de Creación
                </p>
                <p className="font-medium">{formatDate(guide.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Transportista */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Información del Transportista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Razón Social</p>
                <p className="font-semibold">{guide.carrier?.business_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">RUC</p>
                <p className="font-mono font-semibold">
                  {guide.carrier?.number_document}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  🚗 Placa del Vehículo
                </p>
                <p className="font-mono font-bold text-lg text-primary">
                  {guide.vehicle?.plate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Conductor */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Conductor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="font-semibold">{guide.driver?.business_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Documento</p>
                <p className="font-mono">{guide.driver?.number_document}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Licencia</p>
                <p className="font-mono">{guide.driver_license}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Ubicaciones */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <RouteIcon className="h-5 w-5" />
              Ubicaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origen */}
              <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <CircleDot className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-base text-primary">Origen</p>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Dirección</p>
                    <p className="font-medium">{guide.origin_address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Ubigeo</p>
                    <Badge variant="outline" className="font-mono">
                      {guide.originUbigeo?.cadena || "-"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Destino */}
              <div className="space-y-3 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-destructive" />
                  <p className="font-semibold text-base text-destructive">
                    Destino
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Dirección</p>
                    <p className="font-medium">{guide.destination_address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Ubigeo</p>
                    <Badge variant="outline" className="font-mono">
                      {guide.destinationUbigeo?.cadena || "-"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles de Productos */}
        {guide.details && guide.details.length > 0 && (
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos Transportados ({guide.details.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {guide.details.map((detail: GuideDetailResource, index) => (
                  <div
                    key={detail.id}
                    className="p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge variant="outline" className="text-xs shrink-0">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-semibold text-sm leading-tight">
                              {detail.product_name}
                            </p>
                            {detail.product_code && (
                              <p className="text-xs text-muted-foreground font-mono">
                                Código: {detail.product_code}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {detail.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-2xl text-primary">
                          {detail.quantity}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {detail.unit_measure || "UND"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observaciones */}
        {guide.observations && (
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {guide.observations}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer con metadata */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Creado: {formatDateTime(guide.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Actualizado: {formatDateTime(guide.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FormWrapper>
  );
}
