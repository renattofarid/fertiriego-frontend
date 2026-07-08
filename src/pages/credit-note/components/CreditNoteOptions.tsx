import DatePicker from "@/components/DatePicker";
import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import SearchInput from "@/components/SearchInput";
import type { Option } from "@/lib/core.interface";
import { useClients } from "@/pages/client/lib/client.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { useSale } from "@/pages/sale/lib/sale.hook";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";
import { useCreditNoteReasons } from "../lib/credit-note.hook";
import type { CreditNoteReason } from "../lib/credit-note.interface";

const statusOptions: Option[] = [
  { value: "", label: "Todos los estados" },
  { value: "EMITIDA", label: "Emitida" },
  { value: "PROCESADO", label: "Procesado" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "ANULADA", label: "Anulada" },
];

const affectsStockOptions: Option[] = [
  { value: "", label: "Todos" },
  { value: "true", label: "Sí afecta stock" },
  { value: "false", label: "No afecta stock" },
];

const mapClientOption = (person: PersonResource): Option => ({
  value: String(person.id),
  label: person.names || person.business_name,
  description: person.number_document,
});

const mapSaleOption = (sale: SaleResource): Option => ({
  value: String(sale.id),
  label: sale.sequential_number,
  description: sale.customer_fullname,
});

const mapReasonOption = (reason: CreditNoteReason): Option => ({
  value: String(reason.id),
  label: reason.name,
  description: reason.code,
});

interface CreditNoteOptionsProps {
  search: string;
  setSearch: (search: string) => void;
  issueStartDate: string;
  setIssueStartDate: (date: string) => void;
  issueEndDate: string;
  setIssueEndDate: (date: string) => void;
  creditNoteMotiveId: string;
  setCreditNoteMotiveId: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  customerId: string;
  setCustomerId: (value: string) => void;
  saleId: string;
  setSaleId: (value: string) => void;
  affectsStock: string;
  setAffectsStock: (value: string) => void;
  createdStartDate: string;
  setCreatedStartDate: (date: string) => void;
  createdEndDate: string;
  setCreatedEndDate: (date: string) => void;
}

export default function CreditNoteOptions({
  search,
  setSearch,
  issueStartDate,
  setIssueStartDate,
  issueEndDate,
  setIssueEndDate,
  creditNoteMotiveId,
  setCreditNoteMotiveId,
  status,
  setStatus,
  customerId,
  setCustomerId,
  saleId,
  setSaleId,
  affectsStock,
  setAffectsStock,
  createdStartDate,
  setCreatedStartDate,
  createdEndDate,
  setCreatedEndDate,
}: CreditNoteOptionsProps) {
  const { data: reasons } = useCreditNoteReasons();
  const reasonOptions = [
    { value: "", label: "Todos los motivos" },
    ...(reasons ?? []).map(mapReasonOption),
  ];

  const handleDateChange =
    (setter: (date: string) => void) => (date: Date | undefined) => {
      setter(date ? date.toISOString().split("T")[0] : "");
    };

  const activeExtraCount = [
    saleId,
    affectsStock,
    createdStartDate,
    createdEndDate,
  ].filter(Boolean).length;

  return (
    <FilterWrapper activeExtraCount={activeExtraCount} maxVisible={6}>
      <SearchInput
        placeholder="Buscar por documento NC"
        value={search}
        onChange={setSearch}
      />

      <DatePicker
        value={issueStartDate}
        onChange={handleDateChange(setIssueStartDate)}
        placeholder="Emisión inicio"
      />

      <DatePicker
        value={issueEndDate}
        onChange={handleDateChange(setIssueEndDate)}
        placeholder="Emisión fin"
      />

      <SearchableSelectAsync
        value={customerId}
        onChange={setCustomerId}
        placeholder="Cliente"
        useQueryHook={useClients}
        mapOptionFn={mapClientOption}
      />

      <SearchableSelect
        options={reasonOptions}
        value={creditNoteMotiveId}
        onChange={setCreditNoteMotiveId}
        placeholder="Motivo"
        className="w-full"
      />

      <SearchableSelect
        options={statusOptions}
        value={status}
        onChange={setStatus}
        placeholder="Estado"
        className="w-full"
      />

      <SearchableSelectAsync
        value={saleId}
        onChange={setSaleId}
        placeholder="Venta"
        useQueryHook={useSale}
        mapOptionFn={mapSaleOption}
      />

      <SearchableSelect
        options={affectsStockOptions}
        value={affectsStock}
        onChange={setAffectsStock}
        placeholder="Afecta stock"
        className="w-full"
      />

      <DatePicker
        value={createdStartDate}
        onChange={handleDateChange(setCreatedStartDate)}
        placeholder="Creación inicio"
      />

      <DatePicker
        value={createdEndDate}
        onChange={handleDateChange(setCreatedEndDate)}
        placeholder="Creación fin"
      />
    </FilterWrapper>
  );
}
