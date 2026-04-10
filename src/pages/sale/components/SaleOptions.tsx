"use client";
import DatePicker from "@/components/DatePicker";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import SearchInput from "@/components/SearchInput";
import FilterWrapper from "@/components/FilterWrapper";
import type { Option } from "@/lib/core.interface";
import { useClients } from "@/pages/client/lib/client.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { useWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import { useUsers } from "@/pages/users/lib/User.hook";
import type { UserResource } from "@/pages/users/lib/User.interface";
import { useProduct } from "@/pages/product/lib/product.hook";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import {
  DOCUMENT_TYPES,
  PAYMENT_TYPES,
  CURRENCIES,
  SALE_STATUSES,
} from "../lib/sale.interface";

const documentTypeOptions: Option[] = [
  { value: "", label: "Todos los tipos" },
  ...DOCUMENT_TYPES.map((dt) => ({ value: dt.value, label: dt.label })),
];

const paymentTypeOptions: Option[] = [
  { value: "", label: "Todos los tipos de pago" },
  ...PAYMENT_TYPES.map((pt) => ({ value: pt.value, label: pt.label })),
];

const currencyOptions: Option[] = [
  { value: "", label: "Todas las monedas" },
  ...CURRENCIES.map((c) => ({ value: c.value, label: c.label })),
];

const statusOptions: Option[] = [
  { value: "", label: "Todos los estados" },
  ...SALE_STATUSES.map((s) => ({ value: s.value, label: s.label })),
];

const mapClientOption = (person: PersonResource): Option => ({
  value: String(person.id),
  label: person.names,
  description: person.number_document,
});

const mapWarehouseOption = (warehouse: WarehouseResource): Option => ({
  value: String(warehouse.id),
  label: warehouse.name,
});

const mapUserOption = (user: UserResource): Option => ({
  value: String(user.id),
  label: user.name,
});

const mapProductOption = (product: ProductResource): Option => ({
  value: String(product.id),
  label: product.name,
});

export default function SaleOptions({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  customerId,
  setCustomerId,
  documentType,
  setDocumentType,
  paymentType,
  setPaymentType,
  status,
  setStatus,
  currency,
  setCurrency,
  serie,
  setSerie,
  numero,
  setNumero,
  warehouseId,
  setWarehouseId,
  userId,
  setUserId,
  productId,
  setProductId,
}: {
  search: string;
  setSearch: (value: string) => void;
  startDate?: string;
  setStartDate?: (value: string) => void;
  endDate?: string;
  setEndDate?: (value: string) => void;
  customerId?: string;
  setCustomerId?: (value: string) => void;
  documentType?: string;
  setDocumentType?: (value: string) => void;
  paymentType?: string;
  setPaymentType?: (value: string) => void;
  status?: string;
  setStatus?: (value: string) => void;
  currency?: string;
  setCurrency?: (value: string) => void;
  serie?: string;
  setSerie?: (value: string) => void;
  numero?: string;
  setNumero?: (value: string) => void;
  warehouseId?: string;
  setWarehouseId?: (value: string) => void;
  userId?: string;
  setUserId?: (value: string) => void;
  productId?: string;
  setProductId?: (value: string) => void;
}) {
  const handleStartDateChange = (date: Date | undefined) => {
    if (setStartDate) {
      setStartDate(date ? date.toISOString().split("T")[0] : "");
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (setEndDate) {
      setEndDate(date ? date.toISOString().split("T")[0] : "");
    }
  };

  const activeExtraCount = [
    documentType,
    paymentType,
    status,
    currency,
    serie,
    numero,
    warehouseId,
    userId,
    productId,
  ].filter(Boolean).length;

  return (
    <FilterWrapper activeExtraCount={activeExtraCount} maxVisible={6}>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar venta"
      />

      {setStartDate && (
        <DatePicker
          value={startDate}
          onChange={handleStartDateChange}
          placeholder="Fecha Inicio"
        />
      )}

      {setEndDate && (
        <DatePicker
          value={endDate}
          onChange={handleEndDateChange}
          placeholder="Fecha Fin"
        />
      )}

      {setCustomerId && (
        <SearchableSelectAsync
          value={customerId ?? ""}
          onChange={setCustomerId}
          placeholder="Cliente"
          useQueryHook={useClients}
          mapOptionFn={mapClientOption}
        />
      )}

      {setWarehouseId && (
        <SearchableSelectAsync
          value={warehouseId ?? ""}
          onChange={setWarehouseId}
          placeholder="Almacén"
          className="w-full"
          useQueryHook={useWarehouses}
          mapOptionFn={mapWarehouseOption}
        />
      )}

      {setProductId && (
        <SearchableSelectAsync
          value={productId ?? ""}
          onChange={setProductId}
          placeholder="Producto"
          className="w-full"
          useQueryHook={useProduct}
          mapOptionFn={mapProductOption}
        />
      )}


      {setDocumentType && (
        <SearchableSelect
          options={documentTypeOptions}
          value={documentType ?? ""}
          onChange={setDocumentType}
          placeholder="Tipo de documento"
          className="w-full"
        />
      )}

      {setPaymentType && (
        <SearchableSelect
          options={paymentTypeOptions}
          value={paymentType ?? ""}
          onChange={setPaymentType}
          placeholder="Tipo de pago"
          className="w-full"
        />
      )}

      {setStatus && (
        <SearchableSelect
          options={statusOptions}
          value={status ?? ""}
          onChange={setStatus}
          placeholder="Estado de venta"
          className="w-full"
        />
      )}

      {setCurrency && (
        <SearchableSelect
          options={currencyOptions}
          value={currency ?? ""}
          onChange={setCurrency}
          placeholder="Moneda"
          className="w-full"
        />
      )}

      {setSerie && (
        <SearchInput
          value={serie ?? ""}
          onChange={setSerie}
          placeholder="Serie"
        />
      )}

      {setNumero && (
        <SearchInput
          value={numero ?? ""}
          onChange={setNumero}
          placeholder="Número"
        />
      )}
      {setUserId && (
        <SearchableSelectAsync
          value={userId ?? ""}
          onChange={setUserId}
          placeholder="Usuario"
          className="w-full"
          useQueryHook={useUsers}
          mapOptionFn={mapUserOption}
        />
      )}
    </FilterWrapper>
  );
}
