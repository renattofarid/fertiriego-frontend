import SearchInput from "@/components/SearchInput";
import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import DatePicker from "@/components/DatePicker";
import type { Option } from "@/lib/core.interface";
import { usePurchases } from "@/pages/purchase/lib/purchase.hook";

export interface AccountsPayableFilters {
  purchase_id: string;
  status: string;
  installment_number: string;
  due_days: string;
  amount: string;
  pending_amount: string;
  due_date?: Date;
}

// Campos de texto: se envían con debounce desde la página
export const ACCOUNTS_PAYABLE_TEXT_FILTERS = [
  "installment_number",
  "due_days",
  "amount",
  "pending_amount",
] as const;

export const EMPTY_ACCOUNTS_PAYABLE_FILTERS: AccountsPayableFilters = {
  purchase_id: "",
  status: "",
  installment_number: "",
  due_days: "",
  amount: "",
  pending_amount: "",
};

const STATUS_OPTIONS: Option[] = [
  { value: "", label: "Todos los estados" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "VENCIDO", label: "Vencido" },
  { value: "PAGADO", label: "Pagado" },
];

const mapPurchaseOption = (p: any): Option => ({
  value: String(p.id),
  label: p.document_number ? `${p.correlativo} - ${p.document_number}` : p.correlativo,
  description: p.supplier_fullname ?? "",
});

interface AccountsPayableOptionsProps {
  filters: AccountsPayableFilters;
  onChange: (changes: Partial<AccountsPayableFilters>) => void;
}

export default function AccountsPayableOptions({
  filters,
  onChange,
}: AccountsPayableOptionsProps) {
  return (
    <FilterWrapper>
      <SearchableSelectAsync
        value={filters.purchase_id}
        onChange={(value) => onChange({ purchase_id: value })}
        placeholder="Compra"
        useQueryHook={usePurchases}
        mapOptionFn={mapPurchaseOption}
      />

      <SearchableSelect
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(value) => onChange({ status: value })}
        placeholder="Estado"
        className="w-full md:w-[160px]"
      />

      <SearchInput
        value={filters.installment_number}
        onChange={(value) => onChange({ installment_number: value })}
        placeholder="N° de cuota..."
      />

      <DatePicker
        value={filters.due_date}
        onChange={(date) => onChange({ due_date: date })}
        placeholder="Fecha de vencimiento"
      />

      <SearchInput
        value={filters.due_days}
        onChange={(value) => onChange({ due_days: value })}
        placeholder="Días de vencimiento..."
      />

      <SearchInput
        value={filters.amount}
        onChange={(value) => onChange({ amount: value })}
        placeholder="Monto..."
      />

      <SearchInput
        value={filters.pending_amount}
        onChange={(value) => onChange({ pending_amount: value })}
        placeholder="Monto pendiente..."
      />
    </FilterWrapper>
  );
}
