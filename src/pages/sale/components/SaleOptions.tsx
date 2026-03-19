"use client";

import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import DatePicker from "@/components/DatePicker";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";
import GeneralSheet from "@/components/GeneralSheet";
import type { Option } from "@/lib/core.interface";
import { useClients } from "@/pages/client/lib/client.hook";
import { useWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useUsers } from "@/pages/users/lib/User.hook";
import { useOrder } from "@/pages/order/lib/order.hook";
import { useQuotations } from "@/pages/quotation/lib/quotation.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { UserResource } from "@/pages/users/lib/User.interface";
import type { OrderResource } from "@/pages/order/lib/order.interface";
import type { QuotationResource } from "@/pages/quotation/lib/quotation.interface";

const sunatStatusOptions: Option[] = [
  { value: "", label: "Todos" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "ACEPTADO", label: "Aceptado" },
  { value: "BAJA", label: "Baja" },
  { value: "RECHAZADO", label: "Rechazado" },
];

const statusOptions: Option[] = [
  { value: "", label: "Todos" },
  { value: "REGISTRADO", label: "Registrado" },
  { value: "PAGADA", label: "Pagada" },
  { value: "CANCELADO", label: "Cancelado" },
];

const documentTypeOptions: Option[] = [
  { value: "", label: "Todos" },
  { value: "FACTURA", label: "Factura" },
  { value: "BOLETA", label: "Boleta" },
  { value: "NOTA DE CREDITO", label: "Nota de Crédito" },
];

const paymentTypeOptions: Option[] = [
  { value: "", label: "Todos" },
  { value: "CONTADO", label: "Contado" },
  { value: "CREDITO", label: "Crédito" },
];

const currencyOptions: Option[] = [
  { value: "", label: "Todas" },
  { value: "PEN", label: "Soles (PEN)" },
  { value: "USD", label: "Dólares (USD)" },
  { value: "EUR", label: "Euros (EUR)" },
];

export interface SaleFilters {
  search: string;
  startDate: string;
  endDate: string;
  statusSunat: string;
  status: string;
  // Extra filters
  documentType: string;
  paymentType: string;
  currency: string;
  serie: string;
  numero: string;
  customerId: string;
  warehouseId: string;
  userId: string;
  orderId: string;
  quotationId: string;
  orderPurchase: string;
  orderService: string;
  dateExpired: string;
  issueDate: string;
}

export const EMPTY_SALE_FILTERS: SaleFilters = {
  search: "",
  startDate: "",
  endDate: "",
  statusSunat: "",
  status: "",
  documentType: "",
  paymentType: "",
  currency: "",
  serie: "",
  numero: "",
  customerId: "",
  warehouseId: "",
  userId: "",
  orderId: "",
  quotationId: "",
  orderPurchase: "",
  orderService: "",
  dateExpired: "",
  issueDate: "",
};

const EXTRA_FILTER_KEYS: (keyof SaleFilters)[] = [
  "documentType",
  "paymentType",
  "currency",
  "serie",
  "numero",
  "customerId",
  "warehouseId",
  "userId",
  "orderId",
  "quotationId",
  "orderPurchase",
  "orderService",
  "dateExpired",
  "issueDate",
];

interface SaleOptionsProps {
  filters: SaleFilters;
  onChange: (partial: Partial<SaleFilters>) => void;
}

export default function SaleOptions({ filters, onChange }: SaleOptionsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeExtraCount = EXTRA_FILTER_KEYS.filter(
    (k) => filters[k] !== "",
  ).length;

  const clearExtraFilters = () => {
    const cleared = Object.fromEntries(
      EXTRA_FILTER_KEYS.map((k) => [k, ""]),
    ) as Partial<SaleFilters>;
    onChange(cleared);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={filters.search}
        onChange={(v) => onChange({ search: v })}
        placeholder="Buscar venta"
      />

      <DatePicker
        value={filters.startDate}
        onChange={(d) =>
          onChange({ startDate: d ? d.toISOString().split("T")[0] : "" })
        }
        placeholder="Fecha Inicio"
        className="w-48"
      />

      <DatePicker
        value={filters.endDate}
        onChange={(d) =>
          onChange({ endDate: d ? d.toISOString().split("T")[0] : "" })
        }
        placeholder="Fecha Fin"
        className="w-48"
      />

      <SearchableSelect
        options={statusOptions}
        value={filters.status}
        onChange={(v) => onChange({ status: v })}
        placeholder="Estado"
        className="w-[160px]"
      />

      <SearchableSelect
        options={sunatStatusOptions}
        value={filters.statusSunat}
        onChange={(v) => onChange({ statusSunat: v })}
        placeholder="Estado SUNAT"
        className="w-[170px]"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => setSheetOpen(true)}
        className="gap-2 h-9"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Más filtros
        {activeExtraCount > 0 && (
          <Badge className="h-5 min-w-5 px-1 text-xs">
            {activeExtraCount}
          </Badge>
        )}
      </Button>

      {activeExtraCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearExtraFilters}
          className="gap-1 text-muted-foreground h-8 px-2"
        >
          <X className="h-3 w-3" />
          Limpiar
        </Button>
      )}

      <GeneralSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtros avanzados"
        subtitle="Filtra las ventas por criterios específicos"
        icon="SlidersHorizontal"
        size="md"
        footer={
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={clearExtraFilters}
            >
              Limpiar filtros
            </Button>
            <Button className="flex-1" onClick={() => setSheetOpen(false)}>
              Aplicar
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Tipo de documento</Label>
            <SearchableSelect
              options={documentTypeOptions}
              value={filters.documentType}
              onChange={(v) => onChange({ documentType: v })}
              placeholder="Todos"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de pago</Label>
            <SearchableSelect
              options={paymentTypeOptions}
              value={filters.paymentType}
              onChange={(v) => onChange({ paymentType: v })}
              placeholder="Todos"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Moneda</Label>
            <SearchableSelect
              options={currencyOptions}
              value={filters.currency}
              onChange={(v) => onChange({ currency: v })}
              placeholder="Todas"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Serie</Label>
            <Input
              value={filters.serie}
              onChange={(e) => onChange({ serie: e.target.value })}
              placeholder="Ej: F001"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Número</Label>
            <Input
              value={filters.numero}
              onChange={(e) => onChange({ numero: e.target.value })}
              placeholder="Ej: 00000123"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <SearchableSelectAsync
              value={filters.customerId}
              onChange={(v) => onChange({ customerId: v })}
              placeholder="Buscar cliente..."
              useQueryHook={useClients}
              mapOptionFn={(p: PersonResource) => ({
                value: p.id.toString(),
                label:
                  p.business_name ||
                  `${p.names} ${p.father_surname} ${p.mother_surname}`.trim(),
                description: p.number_document,
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Almacén</Label>
            <SearchableSelectAsync
              value={filters.warehouseId}
              onChange={(v) => onChange({ warehouseId: v })}
              placeholder="Buscar almacén..."
              useQueryHook={useWarehouses}
              mapOptionFn={(w: WarehouseResource) => ({
                value: w.id.toString(),
                label: w.name,
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Usuario</Label>
            <SearchableSelectAsync
              value={filters.userId}
              onChange={(v) => onChange({ userId: v })}
              placeholder="Buscar usuario..."
              useQueryHook={useUsers}
              mapOptionFn={(u: UserResource) => ({
                value: u.id.toString(),
                label: u.name,
                description: u.username,
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Pedido</Label>
            <SearchableSelectAsync
              value={filters.orderId}
              onChange={(v) => onChange({ orderId: v })}
              placeholder="Buscar pedido..."
              useQueryHook={useOrder}
              mapOptionFn={(o: OrderResource) => ({
                value: o.id.toString(),
                label: o.order_number,
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cotización</Label>
            <SearchableSelectAsync
              value={filters.quotationId}
              onChange={(v) => onChange({ quotationId: v })}
              placeholder="Buscar cotización..."
              useQueryHook={useQuotations}
              mapOptionFn={(q: QuotationResource) => ({
                value: q.id.toString(),
                label: q.quotation_number,
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Orden de compra</Label>
            <Input
              value={filters.orderPurchase}
              onChange={(e) => onChange({ orderPurchase: e.target.value })}
              placeholder="N° orden de compra"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Orden de servicio</Label>
            <Input
              value={filters.orderService}
              onChange={(e) => onChange({ orderService: e.target.value })}
              placeholder="N° orden de servicio"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Fecha de emisión</Label>
            <DatePicker
              value={filters.issueDate}
              onChange={(d) =>
                onChange({ issueDate: d ? d.toISOString().split("T")[0] : "" })
              }
              placeholder="Seleccionar fecha"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Fecha de vencimiento</Label>
            <DatePicker
              value={filters.dateExpired}
              onChange={(d) =>
                onChange({
                  dateExpired: d ? d.toISOString().split("T")[0] : "",
                })
              }
              placeholder="Seleccionar fecha"
              className="w-full"
            />
          </div>
        </div>
      </GeneralSheet>
    </div>
  );
}
