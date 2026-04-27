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
import {
  DOCUMENT_TYPES,
  PAYMENT_TYPES,
  CURRENCIES,
  SALE_STATUSES,
} from "@/pages/sale/lib/sale.interface";

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
  label: person.business_name ?? `${person.names} ${person.father_surname} ${person.mother_surname}`,
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

interface AccountsReceivableOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  startDate?: string;
  setStartDate?: (value: string) => void;
  endDate?: string;
  setEndDate?: (value: string) => void;
  customerId?: string;
  setCustomerId?: (value: string) => void;
  warehouseId?: string;
  setWarehouseId?: (value: string) => void;
  userId?: string;
  setUserId?: (value: string) => void;
  orderId?: string;
  setOrderId?: (value: string) => void;
  quotationId?: string;
  setQuotationId?: (value: string) => void;
  documentType?: string;
  setDocumentType?: (value: string) => void;
  serie?: string;
  setSerie?: (value: string) => void;
  numero?: string;
  setNumero?: (value: string) => void;
  issueDate?: string;
  setIssueDate?: (value: string) => void;
  paymentType?: string;
  setPaymentType?: (value: string) => void;
  status?: string;
  setStatus?: (value: string) => void;
  currency?: string;
  setCurrency?: (value: string) => void;
  orderPurchase?: string;
  setOrderPurchase?: (value: string) => void;
  orderService?: string;
  setOrderService?: (value: string) => void;
  dateExpired?: string;
  setDateExpired?: (value: string) => void;
  statusFacturado?: string;
  setStatusFacturado?: (value: string) => void;
  customerNames?: string;
  setCustomerNames?: (value: string) => void;
  customerFatherSurname?: string;
  setCustomerFatherSurname?: (value: string) => void;
  customerMotherSurname?: string;
  setCustomerMotherSurname?: (value: string) => void;
}

export default function AccountsReceivableOptions({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  customerId,
  setCustomerId,
  warehouseId,
  setWarehouseId,
  userId,
  setUserId,
  orderId,
  setOrderId,
  quotationId,
  setQuotationId,
  documentType,
  setDocumentType,
  serie,
  setSerie,
  numero,
  setNumero,
  issueDate,
  setIssueDate,
  paymentType,
  setPaymentType,
  status,
  setStatus,
  currency,
  setCurrency,
  orderPurchase,
  setOrderPurchase,
  orderService,
  setOrderService,
  dateExpired,
  setDateExpired,
  statusFacturado,
  setStatusFacturado,
  customerNames,
  setCustomerNames,
  customerFatherSurname,
  setCustomerFatherSurname,
  customerMotherSurname,
  setCustomerMotherSurname,
}: AccountsReceivableOptionsProps) {
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

  const handleIssueDateChange = (date: Date | undefined) => {
    if (setIssueDate) {
      setIssueDate(date ? date.toISOString().split("T")[0] : "");
    }
  };

  const handleDateExpiredChange = (date: Date | undefined) => {
    if (setDateExpired) {
      setDateExpired(date ? date.toISOString().split("T")[0] : "");
    }
  };

  const activeExtraCount = [
    customerId,
    warehouseId,
    userId,
    orderId,
    quotationId,
    documentType,
    serie,
    numero,
    issueDate,
    paymentType,
    status,
    currency,
    startDate,
    endDate,
    orderPurchase,
    orderService,
    dateExpired,
    statusFacturado,
    customerNames,
    customerFatherSurname,
    customerMotherSurname,
  ].filter(Boolean).length;

  return (
    <FilterWrapper activeExtraCount={activeExtraCount} maxVisible={6}>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar cuenta por cobrar..."
      />

      {setCustomerId && (
        <SearchableSelectAsync
          value={customerId ?? ""}
          onChange={setCustomerId}
          placeholder="Cliente"
          useQueryHook={useClients}
          mapOptionFn={mapClientOption}
        />
      )}

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

      {setCurrency && (
        <SearchableSelect
          options={currencyOptions}
          value={currency ?? ""}
          onChange={setCurrency}
          placeholder="Moneda"
          className="w-full"
        />
      )}

      {setStatus && (
        <SearchableSelect
          options={statusOptions}
          value={status ?? ""}
          onChange={setStatus}
          placeholder="Estado"
          className="w-full"
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

      {setIssueDate && (
        <DatePicker
          value={issueDate}
          onChange={handleIssueDateChange}
          placeholder="Fecha de emisión"
        />
      )}

      {setDateExpired && (
        <DatePicker
          value={dateExpired}
          onChange={handleDateExpiredChange}
          placeholder="Fecha de vencimiento"
        />
      )}

      {setOrderId && (
        <SearchInput
          value={orderId ?? ""}
          onChange={setOrderId}
          placeholder="Orden"
        />
      )}

      {setQuotationId && (
        <SearchInput
          value={quotationId ?? ""}
          onChange={setQuotationId}
          placeholder="Cotización"
        />
      )}

      {setOrderPurchase && (
        <SearchInput
          value={orderPurchase ?? ""}
          onChange={setOrderPurchase}
          placeholder="Orden de compra"
        />
      )}

      {setOrderService && (
        <SearchInput
          value={orderService ?? ""}
          onChange={setOrderService}
          placeholder="Orden de servicio"
        />
      )}

      {setStatusFacturado && (
        <SearchInput
          value={statusFacturado ?? ""}
          onChange={setStatusFacturado}
          placeholder="Estado facturado"
        />
      )}

      {setCustomerNames && (
        <SearchInput
          value={customerNames ?? ""}
          onChange={setCustomerNames}
          placeholder="Nombres del cliente"
        />
      )}

      {setCustomerFatherSurname && (
        <SearchInput
          value={customerFatherSurname ?? ""}
          onChange={setCustomerFatherSurname}
          placeholder="Apellido paterno"
        />
      )}

      {setCustomerMotherSurname && (
        <SearchInput
          value={customerMotherSurname ?? ""}
          onChange={setCustomerMotherSurname}
          placeholder="Apellido materno"
        />
      )}
    </FilterWrapper>
  );
}
