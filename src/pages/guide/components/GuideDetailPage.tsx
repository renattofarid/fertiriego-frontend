import { useParams } from "react-router-dom";
import {
  FileText,
  Calendar,
  Truck,
  Package,
  Clock,
  Route as RouteIcon,
  CircleDot,
  Flag,
  FileCheck,
  User as UserIcon,
  Weight,
  Car,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  IdCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGuideById } from "../lib/guide.hook";
import {
  type Carrier,
  type GuideDetailResource,
  GUIDE,
} from "../lib/guide.interface";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import TitleFormComponent from "@/components/TitleFormComponent";
import { GroupFormSection } from "@/components/GroupFormSection";

function getPersonName(person: Carrier): string {
  if (person.type_person === "JURIDICA" || !person.names) {
    return person.business_name || person.commercial_name || "-";
  }
  return [person.names, person.father_surname, person.mother_surname]
    .filter(Boolean)
    .join(" ");
}

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
    EMITIDA: "default",
    ENVIADA: "default",
    EN_TRANSITO: "default",
    ENTREGADA: "default",
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

          {/* Peso Total */}
          <Card className="border-none bg-primary/5 hover:bg-primary/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Peso Total
                  </p>
                  <p className="text-xl font-bold text-primary truncate">
                    {guide.total_weight} kg
                  </p>
                </div>
                <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                  <Weight className="h-5 w-5 text-primary" />
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
                      ? "Público"
                      : "Privado"}
                  </Badge>
                </div>
                <div className="bg-muted-foreground/10 p-2.5 rounded-lg shrink-0">
                  <RouteIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECCIÓN DESTACADA: Destinatario */}
        {guide.recipient && (
          <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <UserIcon className="h-5 w-5 text-green-600" />
              </div>
              <p className="font-semibold text-base text-green-700 dark:text-green-400">
                Destinatario
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Razón Social / Nombre
                </p>
                <p className="font-bold text-base">
                  {getPersonName(guide.recipient)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <IdCard className="h-3 w-3" />
                  {guide.recipient.type_document || "Documento"}
                </p>
                <p className="font-mono font-semibold">
                  {guide.recipient.number_document}
                </p>
              </div>
              {guide.recipient.address && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Dirección
                  </p>
                  <p className="text-sm">{guide.recipient.address}</p>
                </div>
              )}
              {guide.recipient.phone && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Teléfono
                  </p>
                  <p className="text-sm">{guide.recipient.phone}</p>
                </div>
              )}
              {guide.recipient.email && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Correo
                  </p>
                  <p className="text-sm">{guide.recipient.email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN 1: Información General */}
        <GroupFormSection
          title="Información General"
          icon={FileText}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Número de Documento</p>
            <p className="font-mono font-bold text-lg">
              {guide.full_guide_number}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Motivo</p>
            <p className="font-semibold">
              {guide.motive?.code ? `[${guide.motive.code}] ` : ""}
              {guide.motive?.name}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Almacén</p>
            <p className="font-semibold">{guide.warehouse?.name}</p>
            {guide.warehouse?.address && (
              <p className="text-xs text-muted-foreground">
                {guide.warehouse.address}
              </p>
            )}
          </div>

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

          {(guide.order || guide.orden_pedido) && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                Orden de Pedido
              </p>
              <p className="font-mono font-semibold">
                {guide.order?.order_number ||
                  guide.orden_pedido ||
                  `#${guide.order_id}`}
              </p>
              {guide.order?.order_date && (
                <p className="text-xs text-muted-foreground">
                  {formatDate(guide.order.order_date)}
                </p>
              )}
            </div>
          )}

          {guide.user && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                Registrado por
              </p>
              <p className="font-medium">{guide.user.name}</p>
            </div>
          )}
        </GroupFormSection>

        {/* SECCIÓN 2: Ruta */}
        <GroupFormSection
          title="Ruta de Traslado"
          icon={RouteIcon}
          cols={{ sm: 1 }}
        >
          <div className="col-span-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {guide.originUbigeo && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Ubigeo</p>
                      <Badge variant="outline" className="font-mono">
                        {guide.originUbigeo.cadena}
                      </Badge>
                    </div>
                  )}
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
                  {guide.destinationUbigeo && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Ubigeo</p>
                      <Badge variant="outline" className="font-mono">
                        {guide.destinationUbigeo.cadena}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </GroupFormSection>

        {/* SECCIÓN 3: Vehículo y Conductor */}
        <GroupFormSection
          title="Transporte"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          {/* Conductor */}
          {guide.driver && (
            <>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  Conductor
                </p>
                <p className="font-semibold">{getPersonName(guide.driver)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {guide.driver.type_document || "Documento"} Conductor
                </p>
                <p className="font-mono">{guide.driver.number_document}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Licencia de Conducir
                </p>
                <p className="font-mono font-semibold">
                  {guide.driver.driver_license || guide.driver_license || "-"}
                </p>
              </div>

              {guide.driver.phone && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Teléfono
                  </p>
                  <p className="text-sm">{guide.driver.phone}</p>
                </div>
              )}
            </>
          )}

          {/* Transportista público */}
          {guide.carrier && (
            <>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Transportista</p>
                <p className="font-semibold">{getPersonName(guide.carrier)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {guide.carrier.type_document || "RUC"} Transportista
                </p>
                <p className="font-mono">{guide.carrier.number_document}</p>
              </div>
            </>
          )}

          {/* Vehículo */}
          {guide.vehicle && (
            <>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  Placa
                </p>
                <p className="font-mono font-bold text-lg text-primary">
                  {guide.vehicle.plate}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Marca / Modelo</p>
                <p className="font-semibold">
                  {guide.vehicle.brand} {guide.vehicle.model}
                </p>
                {guide.vehicle.year && (
                  <p className="text-xs text-muted-foreground">
                    Año {guide.vehicle.year}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Color / Tipo</p>
                <p className="font-medium capitalize">
                  {guide.vehicle.color}
                  {guide.vehicle.vehicle_type
                    ? ` · ${guide.vehicle.vehicle_type}`
                    : ""}
                </p>
              </div>

              {guide.vehicle.max_weight && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Peso Máximo</p>
                  <p className="font-medium">{guide.vehicle.max_weight} kg</p>
                </div>
              )}

              {guide.vehicle_mtc && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Código MTC</p>
                  <p className="font-mono">{guide.vehicle_mtc}</p>
                </div>
              )}
            </>
          )}

          {/* Fallback: datos directos sin objeto vehicle */}
          {!guide.vehicle && (guide.vehicle_plate || guide.vehicle_brand) && (
            <>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Placa</p>
                <p className="font-mono font-bold text-lg text-primary">
                  {guide.vehicle_plate}
                </p>
              </div>
              {guide.vehicle_brand && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Marca / Modelo
                  </p>
                  <p className="font-semibold">
                    {guide.vehicle_brand} {guide.vehicle_model}
                  </p>
                </div>
              )}
              {guide.vehicle_mtc && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Código MTC</p>
                  <p className="font-mono">{guide.vehicle_mtc}</p>
                </div>
              )}
              {!guide.driver && guide.driver_license && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Licencia</p>
                  <p className="font-mono">{guide.driver_license}</p>
                </div>
              )}
            </>
          )}
        </GroupFormSection>

        {/* SECCIÓN 4: Productos y Observaciones */}
        {((guide.details && guide.details?.length > 0) ||
          guide.observations) && (
          <GroupFormSection
            title={`Productos Transportados${guide.details?.length ? ` (${guide.details.length})` : ""}`}
            icon={Package}
            cols={{ sm: 1 }}
          >
            {guide.details && guide.details.length > 0 && (
              <div className="space-y-3 col-span-full">
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
                        {detail.description &&
                          detail.description !== detail.product_name && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {detail.description}
                            </p>
                          )}
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <div>
                          <p className="font-bold text-2xl text-primary">
                            {detail.quantity}
                          </p>
                          <Badge variant="secondary" className="mt-0.5">
                            {detail.unit || detail.unit_measure || "UND"}
                          </Badge>
                        </div>
                        {detail.weight && (
                          <p className="text-xs text-muted-foreground">
                            {detail.weight} kg
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {guide.observations && (
              <div className="space-y-2 col-span-full">
                <p className="text-xs text-muted-foreground font-semibold">
                  Observaciones
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap p-3 bg-muted/30 rounded-lg border">
                  {guide.observations}
                </p>
              </div>
            )}
          </GroupFormSection>
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
