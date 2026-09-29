"use client";
import DatePicker from "@/components/DatePicker";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import SearchInput from "@/components/SearchInput";
import FilterWrapper from "@/components/FilterWrapper";
import type { Option } from "@/lib/core.interface";
import { useSale } from "@/pages/sale/lib/sale.hook";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";

// Filtros soportados por GET /installments
export interface AccountsReceivableFilters {
  search: string;
  status: string;
  sale_id: string;
  installment_number: string;
  due_date?: Date;
}

export const EMPTY_ACCOUNTS_RECEIVABLE_FILTERS: AccountsReceivableFilters = {
  search: "",
  status: "",
  sale_id: "",
  installment_number: "",
};

const statusOptions: Option[] = [
  { value: "", label: "Todas las cuotas" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PARCIAL", label: "Parcial" },
  { value: "PAGADA", label: "Pagada" },
];

const mapSaleOption = (sale: SaleResource): Option => ({
  value: String(sale.id),
  label: `${sale.serie}-${sale.numero}`,
  description: sale.customer_fullname,
});

interface AccountsReceivableOptionsProps {
  filters: AccountsReceivableFilters;
  onChange: (changes: Partial<AccountsReceivableFilters>) => void;
}

export default function AccountsReceivableOptions({
  filters,
  onChange,
}: AccountsReceivableOptionsProps) {
  return (
    <FilterWrapper maxVisible={5}>
      <SearchInput
        value={filters.search}
        onChange={(value) => onChange({ search: value })}
        placeholder="Buscar cuenta por cobrar..."
      />

      <SearchableSelect
        options={statusOptions}
        value={filters.status}
        onChange={(value) => onChange({ status: value })}
        placeholder="Estado de cuota"
        className="w-full md:w-[170px]"
      />

      <SearchableSelectAsync
        value={filters.sale_id}
        onChange={(value) => onChange({ sale_id: value })}
        placeholder="Venta"
        useQueryHook={useSale}
        mapOptionFn={mapSaleOption}
      />

      <SearchInput
        value={filters.installment_number}
        onChange={(value) =>
          onChange({ installment_number: value.replace(/\D/g, "") })
        }
        placeholder="N° de cuota..."
      />

      <DatePicker
        value={filters.due_date}
        onChange={(date) => onChange({ due_date: date })}
        placeholder="Fecha de vencimiento"
      />
    </FilterWrapper>
  );
}
